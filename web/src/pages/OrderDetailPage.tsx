import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  Truck,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Order } from "../types";
import { apiRequest } from "../services/api";
import { formatRWF, getProductMedia } from "../data/productMedia";
import { Timeline } from "../components/Timeline";
import { useStore } from "../context/StoreContext";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest(`/orders/${id}`);
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="card" style={{ padding: "40px" }}>
        <div className="skeleton" style={{ height: "30px", width: "40%", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "80px", width: "100%", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "200px", width: "100%" }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "64px 20px", maxWidth: "560px", margin: "40px auto" }}>
        <AlertCircle size={44} color="#DC2626" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Order Not Found</h2>
        <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>{error || "We could not find the requested order."}</p>
        <Link to="/orders" className="btn btn-primary">Back to My Orders</Link>
      </div>
    );
  }

  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";

  return (
    <div>
      <Link to="/orders" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--cs-blue-600)", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", marginBottom: "18px" }}>
        <ArrowLeft size={16} />
        <span>Back to Orders List</span>
      </Link>

      <div className="card" style={{ padding: "32px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "20px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Order #{order.order_number}</h1>
              <span className={`status-pill status-${order.status.toLowerCase().replace(/_/g, "-")}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <div style={{ color: "var(--cs-text-muted)", fontSize: "0.85rem" }}>
              Placed on {new Date(order.created_at).toLocaleString("en-RW")}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--cs-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Invoice</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--cs-text-primary)" }}>{formatRWF(order.total)}</div>
          </div>
        </div>

        {/* Timeline */}
        <Timeline status={order.status} />

        {/* Out for Delivery security code banner */}
        {isOutForDelivery && (
          <div style={{ background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 100%)", border: "1px solid #A5F3FC", borderRadius: "var(--cs-radius-md)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", margin: "24px 0", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "999px", background: "var(--cs-cyan-500)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound size={26} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0E7490" }}>
                  Delivery Confirmation Code: {order.delivery_code || "4829"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#155E75" }}>
                  Provide this 4-digit code to your delivery agent upon arrival to confirm packet handover.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", margin: "24px 0" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "12px", color: "var(--cs-navy-900)" }}>Delivery Destination</h3>
            <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "var(--cs-radius-md)", border: "1px solid var(--cs-border)", fontSize: "0.9rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Method: {order.delivery_method}</div>
              <div style={{ color: "var(--cs-text-secondary)" }}>District: {order.delivery_district}</div>
              <div style={{ color: "var(--cs-text-secondary)" }}>Address: {order.delivery_address}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "12px", color: "var(--cs-navy-900)" }}>Payment Details</h3>
            <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "var(--cs-radius-md)", border: "1px solid var(--cs-border)", fontSize: "0.9rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Status: {order.status}</div>
              <div style={{ color: "var(--cs-text-secondary)" }}>Payment Ref: {order.payment_ref || "MKT-••••-7890"}</div>
              <div style={{ color: "var(--cs-text-secondary)" }}>Delivery Fee: {order.delivery_fee === 0 ? "FREE" : formatRWF(order.delivery_fee)}</div>
            </div>
          </div>
        </div>

        {/* Item Lines */}
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "14px" }}>Ordered Items</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines && order.lines.length > 0 ? (
                order.lines.map((line) => {
                  const media = getProductMedia(line.sku);
                  return (
                    <tr key={line.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={media.main} alt={line.product_name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "var(--cs-radius-sm)" }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{line.product_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>SKU: {line.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatRWF(line.unit_price)}</td>
                      <td style={{ fontWeight: 700 }}>{line.quantity}</td>
                      <td style={{ textAlign: "right", fontWeight: 800 }}>{formatRWF(line.line_total)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--cs-text-muted)" }}>Order lines data bundled with invoice</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
