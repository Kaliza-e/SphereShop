import { Router, Request, Response } from "express";
import { paymentAdapter } from "../services/paymentAdapter";
import { memoryDb } from "../db";
import { seedData } from "../db/seed";
import { Clock } from "../domain/clock";

const router = Router();

router.use((_req: Request, res: Response, next) => {
  if (process.env.ENABLE_TEST_SUPPORT !== "true" && process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "development") {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Test support endpoints are disabled in production" } });
  }
  next();
});

// POST /test-support/payment-stub/mode
router.post("/payment-stub/mode", (req: Request, res: Response) => {
  const { mode } = req.body;
  if (!["success", "decline", "silent", "late-success"].includes(mode)) {
    return res.status(400).json({ error: { code: "INVALID_MODE", message: "Mode must be success, decline, silent, or late-success" } });
  }
  paymentAdapter.setStubMode(mode);
  res.json({ message: `Payment stub mode set to '${mode}'` });
});

// POST /test-support/refund-stub/mode
router.post("/refund-stub/mode", (req: Request, res: Response) => {
  const { mode } = req.body;
  if (!["success", "fail"].includes(mode)) {
    return res.status(400).json({ error: { code: "INVALID_MODE", message: "Mode must be success or fail" } });
  }
  paymentAdapter.setRefundStubMode(mode);
  res.json({ message: `Refund stub mode set to '${mode}'` });
});

// POST /test-support/clock
router.post("/clock", (req: Request, res: Response) => {
  const { date } = req.body;
  Clock.setMockedTime(date || null);
  res.json({ message: "Clock updated", currentTime: Clock.now() });
});

// GET /test-support/notifications
router.get("/notifications", (_req: Request, res: Response) => {
  const list = Array.from(memoryDb.notifications.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ notifications: list });
});

// POST /test-support/run-reconciliation
router.post("/run-reconciliation", (_req: Request, res: Response) => {
  const expiredOrders = Array.from(memoryDb.orders.values()).filter(o => o.status === "PAYMENT_EXPIRED");
  let reconciled = 0;

  for (const o of expiredOrders) {
    const pay = Array.from(memoryDb.payments.values()).find(p => p.order_id === o.id);
    if (pay && pay.status === "SUCCESS") {
      o.status = "PAID";
      reconciled += 1;
    }
  }

  res.json({ message: "Reconciliation completed", reconciledCount: reconciled });
});

// POST /test-support/reset-db
router.post("/reset-db", async (_req: Request, res: Response) => {
  await seedData();
  res.json({ message: "Database reset and re-seeded successfully" });
});

export default router;
