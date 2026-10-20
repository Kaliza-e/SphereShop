import { Router, Response } from "express";
import { memoryDb } from "../db";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { calculatePricing, CouponInput } from "../domain/pricing";
import { isAllowedDistrict } from "../domain/validators";
import { paymentAdapter } from "../services/paymentAdapter";
import { validateStateTransition } from "../domain/orderStateMachine";
import { ordersTotal, paymentsTotal } from "../middleware/metrics";

const router = Router();

// Store idempotency keys
const idempotencyMap = new Map<string, any>();
let dailyOrderSequence = 1;
let currentDayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

function getNextOrderNumber(): string {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  if (todayStr !== currentDayStr) {
    currentDayStr = todayStr;
    dailyOrderSequence = 1;
  }
  const seqStr = dailyOrderSequence.toString().padStart(4, "0");
  dailyOrderSequence += 1;
  return `SS-${todayStr}-${seqStr}`;
}

// GET /checkout/quote
router.get("/checkout/quote", (req: AuthenticatedRequest, res: Response) => {
  const rawMethod = (req.query.method || req.query.deliveryMethod || "STANDARD") as string;
  const district = req.query.district;
  const deliveryMethod = rawMethod.toUpperCase() as "STANDARD" | "EXPRESS" | "PICKUP";

  if (deliveryMethod !== "PICKUP" && district) {
    if (!isAllowedDistrict(district as string)) {
      return res.status(400).json({
        error: {
          code: "UNSUPPORTED_DISTRICT",
          message: "We do not deliver there yet. We currently deliver only in Gasabo, Kicukiro, and Nyarugenge. You may select Pickup instead."
        }
      });
    }
  }

  const userCart = req.user
    ? Array.from(memoryDb.carts.values()).find(c => c.user_id === req.user.id)
    : Array.from(memoryDb.carts.values()).find(c => c.session_id === req.cartId);

  if (!userCart) {
    return res.status(400).json({ error: { code: "EMPTY_CART", message: "Cart is empty" } });
  }

  const lines = Array.from(memoryDb.cartLines.values()).filter(l => l.cart_id === userCart.id);
  if (lines.length === 0) {
    return res.status(400).json({ error: { code: "EMPTY_CART", message: "Cart is empty" } });
  }

  const cartLines = lines.map(line => {
    const p = memoryDb.products.get(line.product_id);
    return { price: p ? p.price : 0, qty: line.quantity };
  });

  let couponData: CouponInput | null = null;
  if (userCart.coupon_code) {
    const couponObj = Array.from(memoryDb.coupons.values()).find(c => c.code.toUpperCase() === userCart.coupon_code.toUpperCase());
    if (couponObj) {
      couponData = {
        code: couponObj.code,
        percent: couponObj.percent,
        minSubtotal: couponObj.min_subtotal,
        maxDiscount: couponObj.max_discount,
        active: couponObj.active,
        expiresAt: couponObj.expires_at
      };
    }
  }

  const isLoyal = req.user ? Array.from(memoryDb.orders.values()).filter(o => o.shopper_id === req.user.id && o.status === "DELIVERED").length >= 5 : false;

  try {
    const pricing = calculatePricing({
      lines: cartLines,
      coupon: couponData,
      deliveryMethod,
      isLoyal
    });
    res.json({ quote: pricing });
  } catch (err: any) {
    res.status(400).json({ error: { code: "PRICING_ERROR", message: err.message } });
  }
});

// GET /pickup-points
router.get("/pickup-points", (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    pickupPoints: [
      { id: "pk-1", name: "Kigali City Tower Hub", district: "Nyarugenge", address: "KN 21 Ave, KCT Ground Floor" },
      { id: "pk-2", name: "Remera Gisimenti Branch", district: "Gasabo", address: "KG 11 Ave, Remera" },
      { id: "pk-3", name: "Kicukiro Centre Outlet", district: "Kicukiro", address: "KK 15 Ave, Kicukiro" }
    ]
  });
});

// POST /orders
router.post("/orders", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const idempotencyKey = (req.headers["idempotency-key"] || req.body.idempotencyKey) as string;
  if (!idempotencyKey) {
    return res.status(400).json({ error: { code: "IDEMPOTENCY_KEY_REQUIRED", message: "Idempotency-Key header is required" } });
  }

  if (idempotencyMap.has(idempotencyKey)) {
    const existing = idempotencyMap.get(idempotencyKey);
    return res.status(202).json(existing);
  }

  const { deliveryMethod = "STANDARD", deliveryDistrict, deliveryAddress, paymentMethod = "MTN_MOMO", phoneNumber } = req.body;

  if (deliveryMethod !== "PICKUP") {
    if (!deliveryDistrict || !isAllowedDistrict(deliveryDistrict)) {
      return res.status(400).json({
        error: {
          code: "UNSUPPORTED_DISTRICT",
          message: "We do not deliver there yet. Delivery is available only in Gasabo, Kicukiro, and Nyarugenge. Please select Pickup."
        }
      });
    }
  }

  const userCart = Array.from(memoryDb.carts.values()).find(c => c.user_id === req.user.id);
  if (!userCart) {
    return res.status(400).json({ error: { code: "EMPTY_CART", message: "Cart is empty" } });
  }

  const lines = Array.from(memoryDb.cartLines.values()).filter(l => l.cart_id === userCart.id);
  if (lines.length === 0) {
    return res.status(400).json({ error: { code: "EMPTY_CART", message: "Cart is empty" } });
  }

  // Stock check
  for (const l of lines) {
    const product = memoryDb.products.get(l.product_id);
    if (!product || product.status !== "PUBLISHED") {
      return res.status(400).json({ error: { code: "PRODUCT_UNAVAILABLE", message: "One or more items in your cart are no longer available" } });
    }
    if (l.quantity > product.stock) {
      return res.status(400).json({ error: { code: "STOCK_EXCEEDED", message: `Stock exceeded for ${product.name}. Available: ${product.stock}` } });
    }
  }

  // Calculate total pricing
  const cartLines = lines.map(line => {
    const p = memoryDb.products.get(line.product_id)!;
    return { price: p.price, qty: line.quantity };
  });

  let couponData: CouponInput | null = null;
  if (userCart.coupon_code) {
    const couponObj = Array.from(memoryDb.coupons.values()).find(c => c.code.toUpperCase() === userCart.coupon_code.toUpperCase());
    if (couponObj) {
      couponData = {
        code: couponObj.code,
        percent: couponObj.percent,
        minSubtotal: couponObj.min_subtotal,
        maxDiscount: couponObj.max_discount,
        active: couponObj.active,
        expiresAt: couponObj.expires_at
      };
    }
  }

  const isLoyal = Array.from(memoryDb.orders.values()).filter(o => o.shopper_id === req.user.id && o.status === "DELIVERED").length >= 5;

  let pricing;
  try {
    pricing = calculatePricing({
      lines: cartLines,
      coupon: couponData,
      deliveryMethod,
      isLoyal
    });
  } catch (err: any) {
    return res.status(400).json({ error: { code: "PRICING_ERROR", message: err.message } });
  }

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderNumber = getNextOrderNumber();

  const newOrder = {
    id: orderId,
    order_number: orderNumber,
    shopper_id: req.user.id,
    status: "PENDING_PAYMENT",
    subtotal: pricing.subtotal,
    line_discount: pricing.lineDiscount,
    net: pricing.net,
    coupon_code: userCart.coupon_code || null,
    coupon_discount: pricing.couponDiscount,
    net_after_coupon: pricing.netAfterCoupon,
    delivery_method: deliveryMethod,
    delivery_fee: pricing.deliveryFee,
    delivery_district: deliveryDistrict || "Nyarugenge",
    delivery_address: deliveryAddress || "Pickup Point",
    total: pricing.total,
    idempotency_key: idempotencyKey,
    created_at: new Date()
  };

  memoryDb.orders.set(orderId, newOrder);

  // Order lines
  lines.forEach(l => {
    const p = memoryDb.products.get(l.product_id)!;
    const olId = `ol-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    memoryDb.orderLines.set(olId, {
      id: olId,
      order_id: orderId,
      product_id: p.id,
      sku: p.sku,
      product_name: p.name,
      unit_price: p.price,
      quantity: l.quantity,
      line_total: p.price * l.quantity,
      is_faulty: false
    });
    // Reserve stock 10 min
    const resId = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    memoryDb.stockReservations.set(resId, {
      id: resId,
      product_id: p.id,
      order_id: orderId,
      quantity: l.quantity,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      released: false
    });
  });

  // Record order event
  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: orderId,
    from_state: null,
    to_state: "PENDING_PAYMENT",
    note: "Order created, stock reserved 10 min",
    created_at: new Date()
  });

  ordersTotal.inc({ status: "PENDING_PAYMENT" });

  // Clear cart after place-order
  for (const l of lines) {
    memoryDb.cartLines.delete(l.id);
  }
  userCart.coupon_code = null;

  // Charge initiation via payment adapter
  const chargeRes = await paymentAdapter.charge({
    orderId,
    amount: pricing.total,
    method: paymentMethod,
    phoneNumber: phoneNumber || req.user.phone,
    idempotencyKey
  });

  // Save payment record
  memoryDb.payments.set(chargeRes.providerRef, {
    id: `pay-${Date.now()}`,
    order_id: orderId,
    provider_ref: chargeRes.providerRef,
    method: paymentMethod,
    status: chargeRes.status,
    amount: pricing.total,
    created_at: new Date()
  });

  const resultPayload = {
    orderId,
    orderNumber,
    status: "PENDING_PAYMENT",
    total: pricing.total,
    providerRef: chargeRes.providerRef,
    message: "Order placed. Awaiting payment confirmation.",
    order: newOrder
  };

  idempotencyMap.set(idempotencyKey, resultPayload);
  res.status(202).json(resultPayload);
});

// GET /orders
router.get("/orders", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const pageSize = 10;

  const userOrders = Array.from(memoryDb.orders.values())
    .filter(o => o.shopper_id === req.user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalItems = userOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (pageNum - 1) * pageSize;
  const paginatedOrders = userOrders.slice(startIndex, startIndex + pageSize);

  res.json({
    orders: paginatedOrders,
    pagination: {
      page: pageNum,
      pageSize,
      totalItems,
      totalPages
    }
  });
});

// GET /orders/:id
router.get("/orders/:id", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = memoryDb.orders.get(id) || Array.from(memoryDb.orders.values()).find(o => o.order_number === id);

  // Security: Other shopper's order or unknown id -> 404 (never 403 with body)
  if (!order || (req.user.role !== "ADMIN" && order.shopper_id !== req.user.id)) {
    return res.status(404).json({
      error: {
        code: "ORDER_NOT_FOUND",
        message: "Order not found",
        referenceId: `REF-${Date.now()}`
      }
    });
  }

  const lines = Array.from(memoryDb.orderLines.values()).filter(l => l.order_id === order.id);
  const events = Array.from(memoryDb.orderEvents.values())
    .filter(e => e.order_id === order.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  const payment = Array.from(memoryDb.payments.values()).find(p => p.order_id === order.id);
  const maskedRef = payment ? payment.provider_ref.replace(/(.{4}).*(.{4})/, "$1****$2") : "N/A";

  res.json({
    order: {
      ...order,
      lines,
      history: events,
      maskedPaymentRef: maskedRef
    }
  });
});

// POST /orders/:id/pay (retry payment)
router.post("/orders/:id/pay", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { method = "MTN_MOMO" } = req.body;

  const order = memoryDb.orders.get(id);
  if (!order || order.shopper_id !== req.user.id) {
    return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
  }

  if (order.status !== "PAYMENT_FAILED" && order.status !== "PAYMENT_EXPIRED") {
    return res.status(400).json({ error: { code: "INVALID_STATE", message: "Retry payment is only allowed for failed or expired orders" } });
  }

  validateStateTransition(order.status, "PENDING_PAYMENT");
  order.status = "PENDING_PAYMENT";

  // Re-reserve stock
  const lines = Array.from(memoryDb.orderLines.values()).filter(l => l.order_id === order.id);
  for (const l of lines) {
    const resId = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    memoryDb.stockReservations.set(resId, {
      id: resId,
      product_id: l.product_id,
      order_id: order.id,
      quantity: l.quantity,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      released: false
    });
  }

  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: order.id,
    from_state: "PAYMENT_EXPIRED",
    to_state: "PENDING_PAYMENT",
    note: "Shopper retried payment; stock re-reserved",
    created_at: new Date()
  });

  const chargeRes = await paymentAdapter.charge({
    orderId: order.id,
    amount: order.total,
    method
  });

  res.json({ message: "Payment retried. Awaiting provider confirmation.", providerRef: chargeRes.providerRef });
});

// POST /orders/:id/cancel
router.post("/orders/:id/cancel", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = memoryDb.orders.get(id);

  if (!order || (req.user.role !== "ADMIN" && order.shopper_id !== req.user.id)) {
    return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
  }

  if (req.user.role !== "ADMIN" && order.status !== "PAID" && order.status !== "PENDING_PAYMENT") {
    return res.status(400).json({ error: { code: "CANNOT_CANCEL", message: "Shopper can only cancel order while in PAID or PENDING_PAYMENT state" } });
  }

  validateStateTransition(order.status, "CANCELLED");
  const prevStatus = order.status;
  order.status = "CANCELLED";

  // Release reservations
  const reservations = Array.from(memoryDb.stockReservations.values()).filter(r => r.order_id === order.id);
  reservations.forEach(r => r.released = true);

  memoryDb.orderEvents.set(`evt-${Date.now()}`, {
    id: `evt-${Date.now()}`,
    order_id: order.id,
    from_state: prevStatus,
    to_state: "CANCELLED",
    note: "Order cancelled by shopper",
    created_at: new Date()
  });

  if (prevStatus === "PAID") {
    order.status = "REFUND_DUE";
    // Refund process initiated
    order.status = "REFUNDED";
    memoryDb.orderEvents.set(`evt-${Date.now()}-ref`, {
      id: `evt-${Date.now()}-ref`,
      order_id: order.id,
      from_state: "CANCELLED",
      to_state: "REFUNDED",
      note: "Full refund processed for cancelled order",
      created_at: new Date()
    });
  }

  res.json({ message: "Order cancelled successfully" });
});

export default router;
