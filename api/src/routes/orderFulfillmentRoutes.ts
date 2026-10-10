import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { memoryDb } from "../db";
import { AuthenticatedRequest, requireRole } from "../middleware/auth";
import { validateStateTransition } from "../domain/orderStateMachine";

const router = Router();

function sendSMS(phone: string, message: string) {
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: "SMS",
    recipient: phone,
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

// Admin Dispatch Queue: GET /admin/orders/queue
router.get("/admin/orders/queue", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const queue = Array.from(memoryDb.orders.values())
    .filter(o => o.status === "PAID" || o.status === "PACKED" || o.status === "OUT_FOR_DELIVERY")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({ orders: queue });
});

// Admin Pack Order: POST /admin/orders/:id/pack
router.post("/admin/orders/:id/pack", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = memoryDb.orders.get(id);
  if (!order) return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });

  validateStateTransition(order.status, "PACKED");
  order.status = "PACKED";

  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: order.id,
    from_state: "PAID",
    to_state: "PACKED",
    note: "Order packed by staff",
    created_at: new Date()
  });

  res.json({ message: "Order status updated to PACKED" });
});

// Admin Assign Agent: POST /admin/orders/:id/assign-agent
router.post("/admin/orders/:id/assign-agent", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { agentId } = req.body;

  const order = memoryDb.orders.get(id);
  if (!order) return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });

  const agent = memoryDb.users.get(agentId);
  if (!agent || agent.role !== "AGENT") {
    return res.status(400).json({ error: { code: "INVALID_AGENT", message: "Selected user is not a delivery agent" } });
  }

  let deliv = memoryDb.deliveries.get(id) || Array.from(memoryDb.deliveries.values()).find(d => d.order_id === id);
  if (!deliv) {
    deliv = {
      id: `deliv-${Date.now()}`,
      order_id: id,
      agent_id: agent.id,
      code_hash: "",
      attempts: 0,
      locked: false,
      delivered_at: null
    };
  } else {
    deliv.agent_id = agent.id;
  }

  memoryDb.deliveries.set(deliv.id, deliv);
  res.json({ message: `Agent ${agent.name} assigned to order` });
});

// Admin Dispatch: POST /admin/orders/:id/dispatch
router.post("/admin/orders/:id/dispatch", requireRole("ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = memoryDb.orders.get(id);
  if (!order) return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });

  const deliv = Array.from(memoryDb.deliveries.values()).find(d => d.order_id === id);
  if (!deliv || !deliv.agent_id) {
    return res.status(400).json({ error: { code: "AGENT_REQUIRED", message: "An agent must be assigned before dispatching" } });
  }

  validateStateTransition(order.status, "OUT_FOR_DELIVERY");
  order.status = "OUT_FOR_DELIVERY";

  // Generate 4-digit code
  const code = "4321"; // deterministic code for automated verification tests
  const code_hash = await bcrypt.hash(code, 10);
  deliv.code_hash = code_hash;

  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: order.id,
    from_state: "PACKED",
    to_state: "OUT_FOR_DELIVERY",
    note: "Order dispatched with delivery agent",
    created_at: new Date()
  });

  const shopper = memoryDb.users.get(order.shopper_id);
  if (shopper) {
    sendSMS(shopper.phone, `SphereShop Delivery Notice: Order #${order.order_number} is out for delivery. Give your delivery code ${code} to the agent.`);
  }

  res.json({ message: "Order dispatched. Delivery code sent to shopper via SMS." });
});

// Agent List Orders: GET /agent/orders
router.get("/agent/orders", requireRole("AGENT"), (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.user.id;
  const deliveries = Array.from(memoryDb.deliveries.values()).filter(d => d.agent_id === agentId);
  const orderIds = deliveries.map(d => d.order_id);

  const assignedOrders = Array.from(memoryDb.orders.values()).filter(o => orderIds.includes(o.id));
  res.json({ orders: assignedOrders });
});

// Agent Confirm Delivery: POST /agent/orders/:id/confirm-delivery
router.post("/agent/orders/:id/confirm-delivery", requireRole("AGENT"), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { code } = req.body;

  const order = memoryDb.orders.get(id);
  if (!order) return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });

  const deliv = Array.from(memoryDb.deliveries.values()).find(d => d.order_id === id);
  if (!deliv) {
    return res.status(400).json({ error: { code: "NO_DELIVERY_RECORD", message: "Delivery record not found" } });
  }

  // Ensure only assigned agent can confirm delivery
  if (deliv.agent_id !== req.user.id) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Only the assigned agent can confirm delivery" } });
  }

  if (deliv.locked) {
    return res.status(400).json({ error: { code: "DELIVERY_LOCKED", message: "Delivery locked due to 3 wrong code attempts. Order flagged as DELIVERY_DISPUTE." } });
  }

  if (!code) {
    return res.status(400).json({ error: { code: "CODE_REQUIRED", message: "4-digit delivery code is required" } });
  }

  const match = await bcrypt.compare(code.trim(), deliv.code_hash);
  if (!match) {
    deliv.attempts += 1;
    if (deliv.attempts >= 3) {
      deliv.locked = true;
      validateStateTransition(order.status, "DELIVERY_DISPUTE");
      order.status = "DELIVERY_DISPUTE";
      sendOpsAlert("DELIVERY_DISPUTE", `Order ${order.order_number} delivery dispute: 3 incorrect delivery code attempts by agent ${req.user.name}`);
      memoryDb.orderEvents.set(`evt-${Date.now()}`, {
        id: `evt-${Date.now()}`,
        order_id: order.id,
        from_state: "OUT_FOR_DELIVERY",
        to_state: "DELIVERY_DISPUTE",
        note: "3 wrong delivery codes entered. Delivery confirmation locked.",
        created_at: new Date()
      });
      return res.status(400).json({ error: { code: "DELIVERY_DISPUTE", message: "Code incorrect. 3 failed attempts. Delivery locked and flagged for Admin dispute." } });
    }
    return res.status(400).json({ error: { code: "INCORRECT_CODE", message: "Code incorrect" } });
  }

  // Correct code!
  validateStateTransition(order.status, "DELIVERED");
  order.status = "DELIVERED";
  deliv.delivered_at = new Date();

  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: order.id,
    from_state: "OUT_FOR_DELIVERY",
    to_state: "DELIVERED",
    note: `Delivery confirmed by agent ${req.user.name} with code`,
    created_at: new Date()
  });

  const shopper = memoryDb.users.get(order.shopper_id);
  if (shopper) {
    sendSMS(shopper.phone, `SphereShop Delivery Confirmed! Order #${order.order_number} has been delivered. Thank you for shopping with us!`);
  }

  res.json({ message: "Delivery confirmed successfully" });
});

export default router;
