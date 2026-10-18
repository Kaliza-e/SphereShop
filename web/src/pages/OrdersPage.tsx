import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  KeyRound,
  ExternalLink,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { Order } from "../types";
import { apiRequest } from "../services/api";
import { formatRWF, getProductMedia } from "../data/productMedia";
import { Timeline } from "../components/Timeline";
import { useStore } from "../context/StoreContext";

export function OrdersPage() {
  const { user, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Return modal state
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiRequest("/orders");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? A full refund will be processed.")) return;

    try {
      await apiRequest(`/orders/${orderId}/cancel`, { method: "POST" });
      showToast("Order cancelled and refund queued.", "success");
      await loadOrders();
    } catch (err: any) {
      showToast(err.message || "Failed to cancel order", "error");
    }
  };

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder || !returnReason.trim()) return;

    setReturnSubmitting(true);
    try {
      // Find first line item of order
      const lineId = returnModalOrder.lines?.[0]?.id || "line-1";
      await apiRequest(`/orders/${returnModalOrder.id}/returns`, {
        method: "POST",
        body: JSON.stringify({
          orderLineId: lineId,
          quantity: 1,
          reason: returnReason.trim()
        })
      });
      showToast("Return request submitted! Admin will review within 24 hours.", "success");
      setReturnModalOrder(null);
      setReturnReason("");
      await loadOrders();
    } catch (err: any) {
      showToast(err.message || "Failed to submit return request", "error");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PROCESSING") return ["PENDING_PAYMENT", "PAID", "PACKED"].includes(o.status);
    if (statusFilter === "SHIPPED") return o.status === "OUT_FOR_DELIVERY";
    if (statusFilter === "DELIVERED") return o.status === "DELIVERED";
    if (statusFilter === "RETURNED") return ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURNED", "REFUNDED"].includes(o.status);
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          My Orders
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Track your orders in real time and view your purchase history.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "12px" }}>
        {[
          { key: "ALL", label: "All Orders" },
          { key: "PROCESSING", label: "Processing" },
          { key: "SHIPPED", label: "Out for Delivery" },
          { key: "DELIVERED", label: "Delivered" },
          { key: "RETURNED", label: "Returns & Refunds" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`btn ${statusFilter === tab.key ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "8px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: "28px" }}>
              <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "48px", width: "100%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "20px", width: "30%" }} />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 20px", maxWidth: "560px", margin: "40px auto" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#EFF6FF", color: "var(--cs-blue-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <Package size={32} />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>No Orders Found</h3>
          <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>
            You don't have any orders under this filter. Explore our shop catalogue to place an order.
          </p>
          <Link to="/products" className="btn btn-primary">
            <span>Browse Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {filteredOrders.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            const isCancelable = ["PAID", "PENDING_PAYMENT"].includes(order.status);
            const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";

            return (
              <div key={order.id} className="card" style={{ padding: "28px" }} id={`order-card-${order.order_number}`}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cs-blue-600)" }}>
                        #{order.order_number}
                      </span>
                      <span className={`status-pill status-${order.status.toLowerCase().replace(/_/g, "-")}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.825rem", color: "var(--cs-text-muted)" }}>
                      Placed on {new Date(order.created_at).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })} • Destination: {order.delivery_district}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Amount</div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 900 }}>{formatRWF(order.total)}</div>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                    >
                      <span>Track Order</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                {/* Stepper Timeline */}
                <Timeline status={order.status} />

                {/* 4-digit Confirmation Code Banner when OUT_FOR_DELIVERY */}
                {isOutForDelivery && (
                  <div style={{ background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 100%)", border: "1px solid #A5F3FC", borderRadius: "var(--cs-radius-md)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "999px", background: "var(--cs-cyan-500)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <KeyRound size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0E7490" }}>
                          4-Digit Delivery Security Code
                        </div>
                        <div style={{ fontSize: "0.825rem", color: "#155E75" }}>
                          Give this code to your rider upon arrival to confirm handover:
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "0.2em", background: "#FFFFFF", padding: "6px 16px", borderRadius: "var(--cs-radius-sm)", border: "1px solid #67E8F9", color: "#0E7490" }}>
                      {order.delivery_code || "4829"}
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingTop: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {order.lines && order.lines.length > 0 ? (
                      order.lines.map((l) => {
                        const media = getProductMedia(l.sku);
                        return (
                          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#F8FAFC", border: "1px solid var(--cs-border)", borderRadius: "var(--cs-radius-sm)", padding: "6px 10px" }}>
                            <img src={media.main} alt={l.product_name} style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{l.product_name} × {l.quantity}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "var(--cs-text-secondary)" }}>
                        Delivery method: {order.delivery_method} • Address: {order.delivery_address}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {isCancelable && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#DC2626" }}
                      >
                        Cancel Order
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        onClick={() => setReturnModalOrder(order)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                      >
                        <RotateCcw size={14} />
                        <span>Request Return (7 Days)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="modal-overlay" onClick={() => setReturnModalOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Return / Exchange</h3>
              <button onClick={() => setReturnModalOrder(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleRequestReturn}>
              <div className="modal-body">
                <div style={{ background: "#EFF6FF", padding: "12px", borderRadius: "var(--cs-radius-sm)", marginBottom: "16px", fontSize: "0.85rem", color: "#1E40AF" }}>
                  Returns are accepted within <strong>7 days of delivery</strong> for eligible items in original condition.
                </div>

                <div className="form-group">
                  <label className="form-label">Order Reference</label>
                  <input type="text" className="form-input" disabled value={returnModalOrder.order_number} />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Return</label>
                  <select
                    className="form-select"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="Defective / Faulty unit upon opening">Defective / Faulty unit upon opening</option>
                    <option value="Incorrect item or color delivered">Incorrect item or color delivered</option>
                    <option value="Damaged packaging during transit">Damaged packaging during transit</option>
                    <option value="Changed mind (sealed in box)">Changed mind (sealed in box)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Photo Evidence</label>
                  <input type="file" accept="image/*" className="form-input" />
                  <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>Supported: JPG, PNG under 3MB</div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setReturnModalOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={returnSubmitting || !returnReason.trim()} className="btn btn-primary">
                  {returnSubmitting ? "Submitting..." : "Submit Return Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
