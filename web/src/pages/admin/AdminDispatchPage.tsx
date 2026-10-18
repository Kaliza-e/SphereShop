import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Send,
  Clock,
  ArrowRight
} from "lucide-react";
import { Order } from "../../types";
import { apiRequest } from "../../services/api";
import { formatRWF } from "../../data/productMedia";
import { useStore } from "../../context/StoreContext";

export function AdminDispatchPage() {
  const { showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/admin/orders/queue");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Queue load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePack = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await apiRequest(`/admin/orders/${orderId}/pack`, { method: "POST" });
      showToast("Order marked as PACKED and sealed for dispatch.", "success");
      await loadQueue();
    } catch (err: any) {
      showToast(err.message || "Failed to pack order", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAssignAndDispatch = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      // 1. Assign agent
      await apiRequest(`/admin/orders/${orderId}/assign-agent`, {
        method: "POST",
        body: JSON.stringify({ agentId: "usr-agent" })
      });

      // 2. Dispatch
      const res = await apiRequest(`/admin/orders/${orderId}/dispatch`, {
        method: "POST"
      });

      showToast(`Order dispatched! Delivery Security Code generated: ${res.deliveryCode || "4829"}`, "success");
      await loadQueue();
    } catch (err: any) {
      showToast(err.message || "Failed to dispatch order", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          Fulfillment & Dispatch Queue
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Process paid customer orders: verify packaging, assign Kigali delivery agents, and initiate live tracking.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2].map((i) => (
            <div key={i} className="card" style={{ height: "140px" }}>
              <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "40px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 20px", maxWidth: "560px", margin: "40px auto" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "var(--cs-emerald-50)", color: "var(--cs-emerald-500)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>Dispatch Queue is Clear</h3>
          <p style={{ color: "var(--cs-text-secondary)" }}>
            All paid orders have been processed and dispatched to riders or store pickup points.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((o) => {
            const isPacked = o.status === "PACKED";
            const isPaid = o.status === "PAID";
            const isProcessing = actionLoadingId === o.id;

            return (
              <div key={o.id} className="card" style={{ padding: "24px" }} id={`dispatch-card-${o.order_number}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--cs-blue-600)" }}>
                        #{o.order_number}
                      </span>
                      <span className={`status-pill status-${o.status.toLowerCase().replace(/_/g, "-")}`}>
                        {o.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--cs-text-muted)" }}>
                      Destination: <strong>{o.delivery_district}</strong> • {o.delivery_address}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Value</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900 }}>{formatRWF(o.total)}</div>
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", borderRadius: "var(--cs-radius-md)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--cs-text-secondary)" }}>
                    <div><strong>Method:</strong> {o.delivery_method}</div>
                    <div><strong>Received:</strong> {new Date(o.created_at).toLocaleTimeString("en-RW")} Kigali time</div>
                  </div>

                  {/* Operational Transition Actions */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {isPaid && (
                      <button
                        onClick={() => handlePack(o.id)}
                        disabled={isProcessing}
                        className="btn btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                      >
                        <Package size={16} />
                        <span>{isProcessing ? "Packing..." : "1. Pack & Seal"}</span>
                      </button>
                    )}

                    {isPacked && (
                      <button
                        onClick={() => handleAssignAndDispatch(o.id)}
                        disabled={isProcessing}
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.875rem" }}
                      >
                        <Truck size={16} />
                        <span>{isProcessing ? "Dispatching..." : "2. Assign Agent & Dispatch"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
