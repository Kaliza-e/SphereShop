import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { memoryDb } from "../db";
import { AuthenticatedRequest, requireAuth, requireRole } from "../middleware/auth";
import { validateStateTransition } from "../domain/orderStateMachine";
import { paymentAdapter } from "../services/paymentAdapter";

const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/PNG images up to 3 MB are allowed for return photos"));
    }
  }
});

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

// POST /orders/:id/returns
router.post("/orders/:id/returns", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: { code: "INVALID_FILE", message: err.message } });
    }

    const { id } = req.params;
    const { orderLineId, quantity = 1, reason, isFaulty } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: { code: "REASON_REQUIRED", message: "Reason for return is required" } });
    }

    const order = memoryDb.orders.get(id);
    if (!order || order.shopper_id !== req.user.id) {
      return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    }

    if (order.status !== "DELIVERED") {
      return res.status(400).json({ error: { code: "INVALID_STATE", message: "Returns can only be requested for delivered orders" } });
    }

    // Return window check (<= 7 days)
    const deliv = Array.from(memoryDb.deliveries.values()).find(d => d.order_id === order.id);
    const deliveredAt = deliv && deliv.delivered_at ? new Date(deliv.delivered_at) : new Date(order.created_at);
    const diffDays = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return res.status(400).json({ error: { code: "WINDOW_CLOSED", message: "Return window has closed. Items must be returned within 7 days of delivery." } });
    }

    const line = memoryDb.orderLines.get(orderLineId) || Array.from(memoryDb.orderLines.values()).find(l => l.order_id === order.id && (l.id === orderLineId || l.product_id === orderLineId));
    if (!line) {
      return res.status(400).json({ error: { code: "LINE_NOT_FOUND", message: "Order line item not found" } });
    }

    const qty = parseInt(quantity as string, 10);
    if (isNaN(qty) || qty > line.quantity) {
      return res.status(400).json({ error: { code: "INVALID_QUANTITY", message: `Quantity returned cannot exceed quantity delivered (${line.quantity})` } });
    }

    const product = memoryDb.products.get(line.product_id);
    if (product && !product.is_returnable) {
      return res.status(400).json({ error: { code: "NON_RETURNABLE", message: `Product ${product.name} is non-returnable` } });
    }

    // One open return per line
    const existingReturn = Array.from(memoryDb.returns.values()).find(r => r.order_id === order.id && r.status === "RETURN_REQUESTED");
    if (existingReturn) {
      return res.status(400).json({ error: { code: "RETURN_EXISTS", message: "An open return request already exists for this order" } });
    }

    validateStateTransition(order.status, "RETURN_REQUESTED");
    order.status = "RETURN_REQUESTED";

    const returnId = `ret-${Date.now()}`;
    const returnObj = {
      id: returnId,
      order_id: order.id,
      status: "RETURN_REQUESTED",
      reason: reason.trim(),
      photo_path: req.file ? req.file.path : null,
      is_faulty: isFaulty === "true" || isFaulty === true,
      return_code: null,
      refund_status: null,
      refund_attempts: 0,
      created_at: new Date()
    };

    memoryDb.returns.set(returnId, returnObj);
    memoryDb.returnLines.set(`rl-${Date.now()}`, {
      id: `rl-${Date.now()}`,
      return_id: returnId,
      order_line_id: line.id,
      quantity: qty
    });

    memoryDb.orderEvents.set(`evt-${Date.now()}`, {
      id: `evt-${Date.now()}`,
      order_id: order.id,
      from_state: "DELIVERED",
      to_state: "RETURN_REQUESTED",
      note: `Return requested for ${line.product_name} x${qty}`,
      created_at: new Date()
    });

    sendOpsAlert("RETURN_REQUESTED", `New return request submitted for order ${order.order_number}`);

    res.status(201).json({ message: "Return request submitted successfully. Awaiting admin review.", returnId });
  });
});

// GET /returns
router.get("/returns", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const shopperOrders = Array.from(memoryDb.orders.values()).filter(o => o.shopper_id === req.user.id).map(o => o.id);
  const returns = Array.from(memoryDb.returns.values()).filter(r => shopperOrders.includes(r.order_id));
  res.json({ returns });
});

// Admin Returns Inbox: GET /admin/returns
router.get("/admin/returns", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const returns = Array.from(memoryDb.returns.values());
  res.json({ returns });
});

// Admin Approve Return: POST /admin/returns/:id/approve
router.post("/admin/returns/:id/approve", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const returnObj = memoryDb.returns.get(id);
  if (!returnObj) return res.status(404).json({ error: { code: "RETURN_NOT_FOUND", message: "Return request not found" } });

  const returnCode = `RET-CODE-${Math.floor(100000 + Math.random() * 900000)}`;
  returnObj.return_code = returnCode;

  const order = memoryDb.orders.get(returnObj.order_id);
  if (order) {
    const shopper = memoryDb.users.get(order.shopper_id);
    if (shopper) {
      sendNotification("SMS", shopper.phone, `SphereShop Return Approved! Drop off item at Kigali City Tower Hub within 7 days using code: ${returnCode}.`);
    }
  }

  res.json({ message: "Return approved. Return code generated.", returnCode });
});

// Admin Reject Return: POST /admin/returns/:id/reject
router.post("/admin/returns/:id/reject", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason = "Item does not meet return policy criteria" } = req.body;
  const returnObj = memoryDb.returns.get(id);
  if (!returnObj) return res.status(404).json({ error: { code: "RETURN_NOT_FOUND", message: "Return request not found" } });

  returnObj.status = "RETURN_REJECTED";
  const order = memoryDb.orders.get(returnObj.order_id);
  if (order) {
    validateStateTransition(order.status, "RETURN_REJECTED");
    order.status = "RETURN_REJECTED";
  }

  res.json({ message: "Return rejected", reason });
});

// Admin Accept Return (Item Arrived & Inspected): POST /admin/returns/:id/accept
router.post("/admin/returns/:id/accept", requireRole("ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isFaulty = false } = req.body;
  const returnObj = memoryDb.returns.get(id);
  if (!returnObj) return res.status(404).json({ error: { code: "RETURN_NOT_FOUND", message: "Return request not found" } });

  returnObj.status = "RETURNED";
  returnObj.is_faulty = isFaulty;

  const order = memoryDb.orders.get(returnObj.order_id);
  if (order) {
    validateStateTransition(order.status, "RETURNED");
    order.status = "RETURNED";

    // Restock non-faulty items
    if (!isFaulty) {
      const rLines = Array.from(memoryDb.returnLines.values()).filter(rl => rl.return_id === returnObj.id);
      for (const rl of rLines) {
        const oLine = memoryDb.orderLines.get(rl.order_line_id);
        if (oLine) {
          const product = memoryDb.products.get(oLine.product_id);
          if (product) product.stock += rl.quantity;
        }
      }
    }

    // Calculate refund amount
    const rLines = Array.from(memoryDb.returnLines.values()).filter(rl => rl.return_id === returnObj.id);
    let refundAmount = 0;
    for (const rl of rLines) {
      const oLine = memoryDb.orderLines.get(rl.order_line_id);
      if (oLine) refundAmount += oLine.unit_price * rl.quantity;
    }

    // Refund delivery fee ONLY if faulty item
    if (isFaulty) {
      refundAmount += order.delivery_fee;
    }

    const refundRes = await paymentAdapter.refund({
      providerRef: `PAY-REFUND-${order.id}`,
      amount: refundAmount,
      reason: returnObj.reason
    });

    if (refundRes.status === "SUCCESS") {
      validateStateTransition(order.status, "REFUNDED");
      order.status = "REFUNDED";
      returnObj.refund_status = "REFUNDED";

      const shopper = memoryDb.users.get(order.shopper_id);
      if (shopper) {
        sendNotification("SMS", shopper.phone, `SphereShop Refund Processed! ${refundAmount.toLocaleString()} RWF has been refunded to your original payment method.`);
        sendNotification("EMAIL", shopper.email, `SphereShop Refund Confirmation for Order #${order.order_number}: Amount ${refundAmount.toLocaleString()} RWF.`);
      }

      res.json({ message: "Item accepted and refund issued successfully", refundAmount });
    } else {
      returnObj.refund_status = "REFUND_FAILED";
      sendOpsAlert("REFUND_FAILED", `Automatic refund failed for return ${returnObj.id} on order ${order.order_number}`);
      res.status(500).json({ error: { code: "REFUND_FAILED", message: "Refund processing failed. Scheduled for retry." } });
    }
  } else {
    res.json({ message: "Return updated" });
  }
});

export default router;
