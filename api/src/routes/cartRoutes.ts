import { Router, Response } from "express";
import { memoryDb } from "../db";
import { AuthenticatedRequest } from "../middleware/auth";
import { calculatePricing, CouponInput } from "../domain/pricing";
import { validateCouponCode } from "../domain/validators";

const router = Router();

function getCartForRequest(req: AuthenticatedRequest) {
  let cart;
  if (req.user) {
    cart = Array.from(memoryDb.carts.values()).find(c => c.user_id === req.user.id);
    if (!cart) {
      cart = { id: `cart-${req.user.id}`, user_id: req.user.id, updated_at: new Date() };
      memoryDb.carts.set(cart.id, cart);
    }
  } else {
    cart = Array.from(memoryDb.carts.values()).find(c => c.session_id === req.cartId);
    if (!cart) {
      cart = { id: `cart-session-${req.cartId}`, session_id: req.cartId, updated_at: new Date() };
      memoryDb.carts.set(cart.id, cart);
    }
  }
  return cart;
}

// GET /cart
router.get("/cart", (req: AuthenticatedRequest, res: Response) => {
  const cart = getCartForRequest(req);
  const lines = Array.from(memoryDb.cartLines.values()).filter(l => l.cart_id === cart.id);

  const cartLines = lines.map(line => {
    const product = memoryDb.products.get(line.product_id);
    return {
      id: line.id,
      product_id: line.product_id,
      sku: product ? product.sku : "UNKNOWN",
      name: product ? product.name : "Product",
      price: product ? product.price : 0,
      stock: product ? product.stock : 0,
      quantity: line.quantity,
      lineTotal: (product ? product.price : 0) * line.quantity
    };
  });

  let couponData: CouponInput | null = null;
  if (cart.coupon_code) {
    const couponObj = Array.from(memoryDb.coupons.values()).find(c => c.code.toUpperCase() === cart.coupon_code.toUpperCase());
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

  const pricing = calculatePricing({
    lines: cartLines.map(l => ({ price: l.price, qty: l.quantity })),
    coupon: couponData,
    deliveryMethod: "STANDARD",
    isLoyal
  });

  res.json({
    cartId: cart.id,
    lines: cartLines,
    couponCode: cart.coupon_code || null,
    pricing
  });
});

// POST /cart/items
router.post("/cart/items", (req: AuthenticatedRequest, res: Response) => {
  const { productId, sku, quantity = 1 } = req.body;
  const qty = parseInt(quantity, 10);

  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: { code: "INVALID_QUANTITY", message: "Quantity must be at least 1" } });
  }

  const product = Array.from(memoryDb.products.values()).find(p => p.id === productId || p.sku === sku || p.sku === productId);
  if (!product || product.status !== "PUBLISHED") {
    return res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found or unpublished" } });
  }

  const cart = getCartForRequest(req);
  const existingLine = Array.from(memoryDb.cartLines.values()).find(l => l.cart_id === cart.id && l.product_id === product.id);
  const currentQty = existingLine ? existingLine.quantity : 0;
  const newQty = currentQty + qty;

  if (newQty > product.stock) {
    return res.status(400).json({
      error: {
        code: "STOCK_EXCEEDED",
        message: `Cannot add requested quantity. Only ${product.stock} available in stock.`,
        availableStock: product.stock
      }
    });
  }

  if (existingLine) {
    existingLine.quantity = newQty;
  } else {
    const lineId = `cl-${Date.now()}-${Math.random()}`;
    memoryDb.cartLines.set(lineId, {
      id: lineId,
      cart_id: cart.id,
      product_id: product.id,
      quantity: newQty
    });
  }

  cart.updated_at = new Date();
  res.json({ message: "Item added to cart successfully" });
});

// PATCH /cart/items/:productId
router.patch("/cart/items/:productId", (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: { code: "INVALID_QUANTITY", message: "Quantity must be at least 1" } });
  }

  const product = memoryDb.products.get(productId) || Array.from(memoryDb.products.values()).find(p => p.sku === productId);
  if (!product) {
    return res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
  }

  if (qty > product.stock) {
    return res.status(400).json({
      error: {
        code: "STOCK_EXCEEDED",
        message: `Requested quantity exceeds available stock. Only ${product.stock} available.`,
        availableStock: product.stock
      }
    });
  }

  const cart = getCartForRequest(req);
  const existingLine = Array.from(memoryDb.cartLines.values()).find(l => l.cart_id === cart.id && l.product_id === product.id);

  if (!existingLine) {
    return res.status(404).json({ error: { code: "LINE_NOT_FOUND", message: "Product is not in cart" } });
  }

  existingLine.quantity = qty;
  cart.updated_at = new Date();

  res.json({ message: "Cart quantity updated" });
});

// DELETE /cart/items/:productId
router.delete("/cart/items/:productId", (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const cart = getCartForRequest(req);
  const existingLine = Array.from(memoryDb.cartLines.values()).find(l => l.cart_id === cart.id && (l.product_id === productId || l.id === productId));

  if (existingLine) {
    memoryDb.cartLines.delete(existingLine.id);
  }

  res.json({ message: "Item removed from cart" });
});

// POST /cart/coupon
router.post("/cart/coupon", (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body;
  const cart = getCartForRequest(req);

  if (cart.coupon_code) {
    return res.status(400).json({ error: { code: "COUPON_ALREADY_APPLIED", message: "Please remove the current coupon first" } });
  }

  const validation = validateCouponCode(code);
  if (!validation.valid) {
    return res.status(400).json({ error: { code: "INVALID_COUPON_FORMAT", message: validation.message } });
  }

  const trimmedCode = code.trim().toUpperCase();
  const coupon = Array.from(memoryDb.coupons.values()).find(c => c.code.toUpperCase() === trimmedCode);

  if (!coupon || !coupon.active || (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now())) {
    return res.status(400).json({ error: { code: "INVALID_COUPON", message: "Code is not valid" } });
  }

  // Calculate current cart net
  const lines = Array.from(memoryDb.cartLines.values()).filter(l => l.cart_id === cart.id);
  let subtotal = 0;
  let lineDiscount = 0;
  for (const l of lines) {
    const p = memoryDb.products.get(l.product_id);
    if (p) {
      const itemSub = p.price * l.quantity;
      subtotal += itemSub;
      if (l.quantity >= 6) lineDiscount += Math.floor(itemSub * 0.08);
    }
  }
  const net = subtotal - lineDiscount;

  if (net < coupon.min_subtotal) {
    return res.status(400).json({
      error: {
        code: "MIN_SUBTOTAL_NOT_MET",
        message: `Coupon requires a minimum order subtotal of ${coupon.min_subtotal.toLocaleString()} RWF`
      }
    });
  }

  cart.coupon_code = coupon.code;
  res.json({ message: "Coupon applied successfully", couponCode: coupon.code });
});

// DELETE /cart/coupon
router.delete("/cart/coupon", (req: AuthenticatedRequest, res: Response) => {
  const cart = getCartForRequest(req);
  cart.coupon_code = null;
  res.json({ message: "Coupon removed" });
});

export default router;
