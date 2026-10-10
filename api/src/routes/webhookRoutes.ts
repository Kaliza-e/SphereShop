import { Router, Request, Response } from "express";
import { paymentAdapter, WebhookPayload } from "../services/paymentAdapter";
import { memoryDb } from "../db";
import { validateStateTransition } from "../domain/orderStateMachine";
import { webhookDuplicatesTotal, paymentsTotal, ordersTotal } from "../middleware/metrics";

const router = Router();

function sendNotification(type: "SMS" | "EMAIL", recipient: string, message: string) {
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type,
    recipient,
    message,
    created_at: new Date()
  };
  memoryDb.notifications.set(notif.id, notif);
}

function sendOpsAlert(alertType: string, message: string) {
  const alert = {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    alert_type: alertType,
    message,
    created_at: new Date()
  };
  memoryDb.opsAlerts.set(alert.id, alert);
}

// POST /webhooks/payment
router.post("/payment", (req: Request, res: Response) => {
  const signature = (req.headers["x-payment-signature"] || req.headers["x-signature"]) as string;
  const payload: WebhookPayload = req.body;

  if (!payload || !payload.providerRef || !payload.orderId || !payload.status) {
    return res.status(400).json({ error: { code: "INVALID_PAYLOAD", message: "Missing required webhook fields" } });
  }

  // HMAC verification
  if (!signature || !paymentAdapter.verifySignature(payload, signature)) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED_WEBHOOK", message: "Invalid or forged signature" } });
  }

  const existingPayment = memoryDb.payments.get(payload.providerRef);
  if (existingPayment && (existingPayment.status === "SUCCESS" || existingPayment.status === "COMPLETED")) {
    webhookDuplicatesTotal.inc();
    return res.status(200).json({ message: "Duplicate webhook ignored", providerRef: payload.providerRef });
  }

  const order = memoryDb.orders.get(payload.orderId);
  if (!order) {
    return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
  }

  if (payload.status === "SUCCESS") {
    paymentsTotal.inc({ outcome: "SUCCESS" });

    if (order.status === "PENDING_PAYMENT") {
      validateStateTransition(order.status, "PAID");
      order.status = "PAID";

      // Commit stock (decrement)
      const lines = Array.from(memoryDb.orderLines.values()).filter(l => l.order_id === order.id);
      for (const l of lines) {
        const p = memoryDb.products.get(l.product_id);
        if (p) {
          p.stock = Math.max(0, p.stock - l.quantity);
        }
      }

      // Mark payment SUCCESS
      if (existingPayment) {
        existingPayment.status = "SUCCESS";
      } else {
        memoryDb.payments.set(payload.providerRef, {
          id: `pay-${Date.now()}`,
          order_id: order.id,
          provider_ref: payload.providerRef,
          method: "MTN_MOMO",
          status: "SUCCESS",
          amount: payload.amount,
          created_at: new Date()
        });
      }

      memoryDb.orderEvents.set(`evt-${Date.now()}`, {
        id: `evt-${Date.now()}`,
        order_id: order.id,
        from_state: "PENDING_PAYMENT",
        to_state: "PAID",
        note: `Payment confirmed by provider ref ${payload.providerRef}`,
        created_at: new Date()
      });

      ordersTotal.inc({ status: "PAID" });

      const shopper = memoryDb.users.get(order.shopper_id);
      if (shopper) {
        sendNotification("SMS", shopper.phone, `SphereShop Payment Confirmed! Order #${order.order_number} for ${order.total.toLocaleString()} RWF is now PAID.`);
      }
    } else if (order.status === "PAYMENT_EXPIRED") {
      // Late SUCCESS case
      const lines = Array.from(memoryDb.orderLines.values()).filter(l => l.order_id === order.id);
      let stockAvailable = true;
      for (const l of lines) {
        const p = memoryDb.products.get(l.product_id);
        if (!p || p.stock < l.quantity) {
          stockAvailable = false;
          break;
        }
      }

      if (stockAvailable) {
        validateStateTransition(order.status, "PAID");
        order.status = "PAID";
        for (const l of lines) {
          const p = memoryDb.products.get(l.product_id)!;
          p.stock -= l.quantity;
        }
        memoryDb.orderEvents.set(`evt-${Date.now()}`, {
          id: `evt-${Date.now()}`,
          order_id: order.id,
          from_state: "PAYMENT_EXPIRED",
          to_state: "PAID",
          note: "Late payment SUCCESS accepted; stock committed",
          created_at: new Date()
        });
      } else {
        validateStateTransition(order.status, "REFUND_DUE");
        order.status = "REFUND_DUE";
        sendOpsAlert("LATE_PAYMENT_NO_STOCK", `Late payment SUCCESS for order ${order.order_number}, but stock was exhausted. Refund required.`);
        memoryDb.orderEvents.set(`evt-${Date.now()}`, {
          id: `evt-${Date.now()}`,
          order_id: order.id,
          from_state: "PAYMENT_EXPIRED",
          to_state: "REFUND_DUE",
          note: "Late payment SUCCESS received but stock unavailable. Refund due.",
          created_at: new Date()
        });
      }
    }
  } else {
    // Status == FAILED
    paymentsTotal.inc({ outcome: "FAILED" });
    if (order.status === "PENDING_PAYMENT") {
      validateStateTransition(order.status, "PAYMENT_FAILED");
      order.status = "PAYMENT_FAILED";

      // Release stock reservation
      const res = Array.from(memoryDb.stockReservations.values()).filter(r => r.order_id === order.id);
      res.forEach(r => r.released = true);

      memoryDb.orderEvents.set(`evt-${Date.now()}`, {
        id: `evt-${Date.now()}`,
        order_id: order.id,
        from_state: "PENDING_PAYMENT",
        to_state: "PAYMENT_FAILED",
        note: `Payment failed for provider ref ${payload.providerRef}`,
        created_at: new Date()
      });
    }
  }

  res.status(200).json({ message: "Webhook processed successfully" });
});

export default router;
