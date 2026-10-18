import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { formatRWF, getProductMedia } from "../data/productMedia";

export function CartPage() {
  const {
    cart,
    cartLoading,
    updateCartQty,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useStore();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponSubmitting(true);
    setCouponError(null);

    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      setCouponInput("");
    } catch (err: any) {
      setCouponError(err.message || "Invalid or expired coupon code");
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (err: any) {
      setCouponError(err.message || "Failed to remove coupon");
    }
  };

  if (!cart || cart.lines?.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "600px", margin: "40px auto" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "999px", background: "var(--cs-orange-50)", color: "var(--cs-orange-500)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: "var(--cs-text-secondary)", marginBottom: "28px" }}>
          Looks like you haven't added any products to your cart yet. Discover great electronics accessories with Kigali delivery.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: "12px 28px" }}>
          <span>Explore Products Catalogue</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.subtotal || 0;
  const lineDiscount = cart.line_discount || 0;
  const couponDiscount = cart.coupon_discount || 0;
  const netAfterCoupon = cart.net_after_coupon || (subtotal - lineDiscount - couponDiscount);
  // Delivery rule estimate: Free if netAfterCoupon >= 40,000, else standard 1,500 RWF
  const estimatedDelivery = netAfterCoupon >= 40000 ? 0 : 1500;
  const grandTotal = netAfterCoupon + estimatedDelivery;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          Your Shopping Cart
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Review your items and discounts before proceeding to checkout.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(320px, 380px)", gap: "32px", alignItems: "start" }}>
        {/* Left: Items Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="data-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Product</th>
                  <th>Price</th>
                  <th style={{ textAlign: "center" }}>Quantity</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.lines.map((line) => {
                  const media = getProductMedia(line.sku);
                  const isLineDiscounted = line.quantity >= 6;

                  return (
                    <tr key={line.id || line.product_id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <img
                            src={media.main}
                            alt={line.name}
                            style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "var(--cs-radius-md)", border: "1px solid var(--cs-border)" }}
                          />
                          <div>
                            <Link to={`/products/${line.sku}`} style={{ fontWeight: 700, color: "var(--cs-text-primary)", textDecoration: "none", fontSize: "0.95rem" }}>
                              {line.name}
                            </Link>
                            <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>SKU: {line.sku}</div>
                            {isLineDiscounted && (
                              <span style={{ display: "inline-block", background: "var(--cs-emerald-50)", color: "var(--cs-emerald-700)", fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", marginTop: "4px" }}>
                                8% Line Discount Applied
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 600 }}>{formatRWF(line.unit_price)}</td>

                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--cs-border)", borderRadius: "var(--cs-radius-sm)", background: "#F8FAFC" }}>
                          <button
                            onClick={() => updateCartQty(line.product_id, Math.max(1, line.quantity - 1))}
                            disabled={cartLoading || line.quantity <= 1}
                            style={{ padding: "6px 10px", border: "none", background: "none", cursor: "pointer" }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ minWidth: "32px", textAlign: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(line.product_id, line.quantity + 1)}
                            disabled={cartLoading}
                            style={{ padding: "6px 10px", border: "none", background: "none", cursor: "pointer" }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>

                      <td style={{ textAlign: "right", fontWeight: 800, fontSize: "1rem" }}>
                        {formatRWF(line.line_total)}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => removeFromCart(line.product_id)}
                          disabled={cartLoading}
                          style={{ background: "none", border: "none", color: "var(--cs-text-muted)", cursor: "pointer", padding: "6px" }}
                          title="Remove line"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Coupon Entry */}
          <div style={{ padding: "20px", borderTop: "1px solid var(--cs-border)", background: "#F8FAFC" }}>
            {cart.coupon_code ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--cs-emerald-50)", border: "1px solid #A7F3D0", padding: "12px 16px", borderRadius: "var(--cs-radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--cs-emerald-700)" }}>
                  <Tag size={18} />
                  <div>
                    <span style={{ fontWeight: 800 }}>Coupon Active: {cart.coupon_code}</span>
                    <span style={{ fontSize: "0.85rem", marginLeft: "8px" }}>(-{formatRWF(cart.coupon_discount)})</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.8rem", color: "#DC2626" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "10px", maxWidth: "420px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Tag size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--cs-text-muted)" }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: "36px", textTransform: "uppercase" }}
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponSubmitting || !couponInput.trim()}
                  className="btn btn-secondary"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {couponSubmitting ? "Applying..." : "Apply"}
                </button>
              </form>
            )}

            {couponError && (
              <div style={{ color: "#DC2626", fontSize: "0.85rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} />
                <span>{couponError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "18px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "12px" }}>
            Order Summary
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cs-text-secondary)" }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{formatRWF(subtotal)}</span>
            </div>

            {lineDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cs-emerald-700)" }}>
                <span>Line Discounts (Qty ≥ 6)</span>
                <span style={{ fontWeight: 700 }}>-{formatRWF(lineDiscount)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cs-emerald-700)" }}>
                <span>Coupon ({cart.coupon_code})</span>
                <span style={{ fontWeight: 700 }}>-{formatRWF(couponDiscount)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cs-text-secondary)" }}>Delivery (Est.)</span>
              <span style={{ fontWeight: 700 }}>
                {estimatedDelivery === 0 ? (
                  <span style={{ color: "var(--cs-emerald-700)" }}>FREE</span>
                ) : (
                  formatRWF(estimatedDelivery)
                )}
              </span>
            </div>

            {netAfterCoupon < 40000 && (
              <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)", background: "#F8FAFC", padding: "8px 10px", borderRadius: "var(--cs-radius-sm)" }}>
                💡 Add {formatRWF(40000 - netAfterCoupon)} more for <strong>FREE Kigali delivery</strong>!
              </div>
            )}

            <div style={{ borderTop: "2px dashed var(--cs-border)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--cs-text-primary)" }}>
                {formatRWF(grandTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="btn btn-primary btn-full"
            style={{ padding: "14px 20px", fontSize: "1rem" }}
            id="proceed-to-checkout-btn"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <Link
            to="/products"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", color: "var(--cs-blue-600)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
