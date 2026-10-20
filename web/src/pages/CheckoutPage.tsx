import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Zap,
  Store,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { apiRequest } from "../services/api";
import { formatRWF, KIGALI_DISTRICTS, KIGALI_PICKUP_POINTS } from "../data/productMedia";

export function CheckoutPage() {
  const { user, cart, refreshCart, showToast, login } = useStore();
  const navigate = useNavigate();

  // Multi-step
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS" | "PICKUP">("STANDARD");
  const [district, setDistrict] = useState("Gasabo");
  const [address, setAddress] = useState("");
  const [pickupPoint, setPickupPoint] = useState(KIGALI_PICKUP_POINTS[0].id);

  // Payment State
  const [paymentProvider, setPaymentProvider] = useState<"MTN" | "AIRTEL" | "CARD">("MTN");
  const [phone, setPhone] = useState(user?.phone || "0781000001");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardHolder, setCardHolder] = useState(user?.name || "Aline");

  // Processing & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Check Kigali Time for Express Delivery Cut-off (14:00 UTC+2)
  const isExpressAllowed = () => {
    const now = new Date();
    // UTC time + 2 hours for Kigali
    const kigaliHour = (now.getUTCHours() + 2) % 24;
    return kigaliHour < 14;
  };

  // Fetch official quote from API whenever delivery parameters change
  useEffect(() => {
    async function fetchQuote() {
      if (!cart || cart.lines?.length === 0) return;
      setQuoteLoading(true);
      try {
        const q = await apiRequest(
          `/checkout/quote?deliveryMethod=${deliveryMethod}&district=${district}`
        );
        setQuote(q);
      } catch (err) {
        console.error("Quote fetch error:", err);
      } finally {
        setQuoteLoading(false);
      }
    }
    fetchQuote();
  }, [deliveryMethod, district, cart]);

  // If cart is empty, redirect
  if (!cart || cart.lines?.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "64px 20px", maxWidth: "540px", margin: "40px auto" }}>
        <ShoppingBag size={48} color="var(--cs-blue-600)" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Your Cart is Empty</h2>
        <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>Add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="btn btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  // If not signed in, show gate
  if (!user) {
    return (
      <div className="card" style={{ maxWidth: "500px", margin: "40px auto", padding: "36px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#EFF6FF", color: "#3B5AF4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px auto" }}>
          <Lock size={30} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Sign In to Complete Order</h2>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>
          SphereShop uses verified accounts for order tracking, delivery SMS codes, and customer protection.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/signin?redirect=/checkout" className="btn btn-primary btn-full" style={{ padding: "12px" }}>
            Sign In with Phone or Email
          </Link>
          <Link to="/register?redirect=/checkout" className="btn btn-secondary btn-full" style={{ padding: "12px" }}>
            Create New Shopper Account
          </Link>
          <button
            type="button"
            onClick={async () => {
              await login("aline@spheretest.rw", "Kigali2026");
            }}
            className="btn btn-secondary btn-full"
            style={{ padding: "10px", fontSize: "0.85rem", marginTop: "6px", background: "#F8FAFC" }}
          >
            ⚡ Quick 1-Click Demo Login (Aline - Shopper)
          </button>
        </div>
      </div>
    );
  }

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (deliveryMethod !== "PICKUP" && !address.trim()) {
      showToast("Please enter your detailed delivery address", "warning");
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 1. Place order on backend
      const fullDeliveryAddress =
        deliveryMethod === "PICKUP"
          ? KIGALI_PICKUP_POINTS.find((p) => p.id === pickupPoint)?.address || "SphereShop Flagship Hub"
          : `${address.trim()}, ${district}, Kigali`;

      const orderPayload = {
        deliveryMethod,
        deliveryDistrict: district,
        deliveryAddress: fullDeliveryAddress,
        paymentProvider,
        paymentPhone: phone
      };

      const res = await apiRequest("/orders", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(orderPayload)
      });

      const placedOrderId = res.orderId || res.order?.id || res.id;
      let orderObj = res.order;

      // 2. Fetch latest order state
      if (placedOrderId) {
        try {
          const finalOrderRes = await apiRequest(`/orders/${placedOrderId}`);
          orderObj = finalOrderRes.order || finalOrderRes || orderObj;
        } catch (fetchErr) {
          console.warn("Fetch order state error:", fetchErr);
        }
      }

      setConfirmedOrder(orderObj || {
        id: placedOrderId,
        order_number: res.orderNumber || `SS-${Date.now()}`,
        status: "PENDING_PAYMENT",
        total: res.total || 0,
        delivery_method: deliveryMethod,
        delivery_address: fullDeliveryAddress,
        delivery_district: district,
        created_at: new Date()
      });

      // 3. Refresh cart and advance to confirmation
      await refreshCart();
      setStep(3);
      showToast("Order placed successfully! We've prepared your delivery.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to place order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Success Confirmation Screen
  if (step === 3 && confirmedOrder) {
    return (
      <div className="card" style={{ maxWidth: "680px", margin: "20px auto", padding: "40px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "999px", background: "var(--cs-emerald-50)", color: "var(--cs-emerald-500)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
          <CheckCircle2 size={44} />
        </div>

        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: "8px", color: "var(--cs-navy-900)" }}>
          Payment & Order Confirmed!
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "1rem", marginBottom: "24px" }}>
          Thank you for choosing SphereShop Kigali. Your order is being packed by our dispatch team.
        </p>

        {/* Order Details Receipt Card */}
        <div style={{ background: "#F8FAFC", border: "1px solid var(--cs-border)", borderRadius: "var(--cs-radius-lg)", padding: "24px", textAlign: "left", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/logo.png" alt="SphereShop" style={{ height: "36px", objectFit: "contain" }} />
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--cs-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Order Number</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cs-blue-600)" }}>{confirmedOrder.order_number}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--cs-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Paid</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cs-text-primary)" }}>{formatRWF(confirmedOrder.total)}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.875rem" }}>
            <div>
              <div style={{ color: "var(--cs-text-muted)", fontWeight: 600 }}>Delivery Method:</div>
              <div style={{ fontWeight: 700 }}>{confirmedOrder.delivery_method}</div>
            </div>
            <div>
              <div style={{ color: "var(--cs-text-muted)", fontWeight: 600 }}>Destination:</div>
              <div style={{ fontWeight: 700 }}>{confirmedOrder.delivery_district} • {confirmedOrder.delivery_address}</div>
            </div>
            <div>
              <div style={{ color: "var(--cs-text-muted)", fontWeight: 600 }}>Customer:</div>
              <div style={{ fontWeight: 700 }}>{user.name} ({user.phone})</div>
            </div>
            <div>
              <div style={{ color: "var(--cs-text-muted)", fontWeight: 600 }}>Status:</div>
              <span className="status-pill status-paid" style={{ display: "inline-flex" }}>
                {confirmedOrder.status}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--cs-radius-sm)", padding: "12px", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#1E40AF" }}>
            <ShieldCheck size={18} />
            <span>A 4-digit delivery security code will be generated and sent via SMS once your rider departs.</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={`/orders/${confirmedOrder.id}`} className="btn btn-primary" style={{ padding: "12px 24px" }}>
            <span>Track Order Timeline</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ padding: "12px 24px" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Stepper */}
      <div className="stepper" style={{ maxWidth: "600px", margin: "16px auto 32px auto" }}>
        <div className="stepper-line" />
        <div className={`stepper-item ${step >= 1 ? "active" : ""}`}>
          <div className="stepper-circle">1</div>
          <span className="stepper-label">Delivery</span>
        </div>
        <div className={`stepper-item ${step >= 2 ? "active" : ""}`}>
          <div className="stepper-circle">2</div>
          <span className="stepper-label">Payment</span>
        </div>
        <div className={`stepper-item ${step === 3 ? "active" : ""}`}>
          <div className="stepper-circle">3</div>
          <span className="stepper-label">Confirmation</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(320px, 380px)", gap: "32px", alignItems: "start" }}>
        {/* Left Form: Delivery or Payment */}
        <div>
          {step === 1 && (
            <div className="card" style={{ padding: "32px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>
                1. Delivery Information
              </h2>
              <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Select your delivery preference across Kigali districts or choose free store pickup.
              </p>

              {/* Delivery Choice Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                {/* Standard Delivery */}
                <div
                  onClick={() => setDeliveryMethod("STANDARD")}
                  style={{
                    border: `2px solid ${deliveryMethod === "STANDARD" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    background: deliveryMethod === "STANDARD" ? "var(--cs-blue-50)" : "var(--cs-surface)",
                    borderRadius: "var(--cs-radius-lg)",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Truck size={20} color="var(--cs-blue-600)" />
                    <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      {quote?.deliveryFee === 0 ? "FREE" : "1,500 RWF"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "4px" }}>Standard Delivery</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>
                    1–2 business days across Kigali
                  </div>
                </div>

                {/* Express Delivery */}
                <div
                  onClick={() => isExpressAllowed() && setDeliveryMethod("EXPRESS")}
                  style={{
                    border: `2px solid ${deliveryMethod === "EXPRESS" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    background: deliveryMethod === "EXPRESS" ? "var(--cs-blue-50)" : "var(--cs-surface)",
                    borderRadius: "var(--cs-radius-lg)",
                    padding: "16px",
                    cursor: isExpressAllowed() ? "pointer" : "not-allowed",
                    opacity: isExpressAllowed() ? 1 : 0.6,
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Zap size={20} color="var(--cs-orange-500)" />
                    <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>3,500 RWF</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "4px" }}>Express Delivery</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>
                    {isExpressAllowed()
                      ? "Same-day delivery (before 14:00 Kigali time)"
                      : "Cutoff passed (available before 14:00 Kigali time)"}
                  </div>
                </div>

                {/* Pickup */}
                <div
                  onClick={() => setDeliveryMethod("PICKUP")}
                  style={{
                    border: `2px solid ${deliveryMethod === "PICKUP" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    background: deliveryMethod === "PICKUP" ? "var(--cs-blue-50)" : "var(--cs-surface)",
                    borderRadius: "var(--cs-radius-lg)",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Store size={20} color="var(--cs-emerald-500)" />
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--cs-emerald-700)" }}>FREE</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "4px" }}>Store Pickup</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>
                    Collect at Kigali Heights or UTC
                  </div>
                </div>
              </div>

              {/* Destination inputs */}
              {deliveryMethod !== "PICKUP" ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Kigali District</label>
                    <select
                      className="form-select"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      {KIGALI_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>
                      * Home delivery is restricted to Gasabo, Kicukiro, and Nyarugenge.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address & Landmarks</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="e.g. KG 15 Ave, House 42, Near BK Arena, Remera"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Select Pickup Location</label>
                  <select
                    className="form-select"
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                  >
                    {KIGALI_PICKUP_POINTS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.address} ({p.hours})</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => {
                  if (deliveryMethod !== "PICKUP" && !address.trim()) {
                    showToast("Please enter a street address", "warning");
                    return;
                  }
                  setStep(2);
                }}
                className="btn btn-primary btn-full"
                style={{ padding: "12px", marginTop: "12px" }}
              >
                <span>Continue to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card" style={{ padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>2. Payment Method</h2>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                >
                  <ArrowLeft size={14} />
                  <span>Change Delivery</span>
                </button>
              </div>

              <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                Select your preferred Rwandan mobile money provider or credit card.
              </p>

              {/* Payment Method Choices */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {/* MTN MoMo */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    border: `2px solid ${paymentProvider === "MTN" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    borderRadius: "var(--cs-radius-md)",
                    background: paymentProvider === "MTN" ? "var(--cs-blue-50)" : "#FFFFFF",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === "MTN"}
                    onChange={() => setPaymentProvider("MTN")}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>MTN Mobile Money (MoMo)</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>Instant push prompt on your 078/079 number</div>
                  </div>
                  <span style={{ background: "#FDE047", color: "#854D0E", fontWeight: 800, fontSize: "0.75rem", padding: "3px 8px", borderRadius: "4px" }}>MTN MoMo</span>
                </label>

                {/* Airtel Money */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    border: `2px solid ${paymentProvider === "AIRTEL" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    borderRadius: "var(--cs-radius-md)",
                    background: paymentProvider === "AIRTEL" ? "var(--cs-blue-50)" : "#FFFFFF",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === "AIRTEL"}
                    onChange={() => setPaymentProvider("AIRTEL")}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Airtel Money</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>Direct push confirmation on 072/073 number</div>
                  </div>
                  <span style={{ background: "#FEE2E2", color: "#DC2626", fontWeight: 800, fontSize: "0.75rem", padding: "3px 8px", borderRadius: "4px" }}>Airtel</span>
                </label>

                {/* Card */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px",
                    border: `2px solid ${paymentProvider === "CARD" ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    borderRadius: "var(--cs-radius-md)",
                    background: paymentProvider === "CARD" ? "var(--cs-blue-50)" : "#FFFFFF",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === "CARD"}
                    onChange={() => setPaymentProvider("CARD")}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Debit / Credit Card</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--cs-text-secondary)" }}>Visa, Mastercard, Bank of Kigali (3D Secure)</div>
                  </div>
                  <CreditCard size={20} color="var(--cs-text-muted)" />
                </label>
              </div>

              {/* Provider details */}
              {paymentProvider !== "CARD" ? (
                <div className="form-group">
                  <label className="form-label">Rwandan Mobile Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 0781000001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>
                    You will receive a USSD prompt on this phone to authorize the transaction.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cardholder Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">CVV Security Code</label>
                      <input
                        type="password"
                        className="form-input"
                        defaultValue="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="btn btn-primary btn-full"
                style={{ padding: "14px", marginTop: "24px", fontSize: "1.05rem" }}
                id="place-order-submit-btn"
              >
                <Lock size={18} />
                <span>{isSubmitting ? "Securing Order..." : "Place Order & Pay"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Invoice Card */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "14px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "10px" }}>
            Invoice Summary
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
            {cart.lines.map((l) => (
              <div key={l.id || l.product_id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--cs-text-secondary)" }}>
                  {l.name} <strong style={{ color: "var(--cs-text-primary)" }}>× {l.quantity}</strong>
                </span>
                <span style={{ fontWeight: 700 }}>{formatRWF(l.line_total)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--cs-border)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cs-text-secondary)" }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{formatRWF(cart.subtotal)}</span>
            </div>

            {cart.line_discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cs-emerald-700)" }}>
                <span>Line Discounts (Qty ≥ 6)</span>
                <span style={{ fontWeight: 700 }}>-{formatRWF(cart.line_discount)}</span>
              </div>
            )}

            {cart.coupon_discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--cs-emerald-700)" }}>
                <span>Coupon ({cart.coupon_code})</span>
                <span style={{ fontWeight: 700 }}>-{formatRWF(cart.coupon_discount)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--cs-text-secondary)" }}>
                Delivery ({deliveryMethod})
              </span>
              <span style={{ fontWeight: 700 }}>
                {quote?.deliveryFee === 0 ? (
                  <span style={{ color: "var(--cs-emerald-700)" }}>FREE</span>
                ) : (
                  formatRWF(quote?.deliveryFee ?? (deliveryMethod === "STANDARD" ? 1500 : deliveryMethod === "EXPRESS" ? 3500 : 0))
                )}
              </span>
            </div>

            <div style={{ borderTop: "2px dashed var(--cs-border)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "1.05rem", fontWeight: 800 }}>Total Due</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--cs-text-primary)" }}>
                {formatRWF(quote?.total ?? (cart.net_after_coupon + (deliveryMethod === "STANDARD" ? 1500 : 0)))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
