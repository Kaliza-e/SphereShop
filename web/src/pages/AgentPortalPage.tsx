import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Order } from "../types";
import { apiRequest } from "../services/api";
import { formatRWF } from "../data/productMedia";
import { useStore } from "../context/StoreContext";

export function AgentPortalPage() {
  const { user, logout, showToast } = useStore();
  const navigate = useNavigate();

  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [verifying, setVerifying] = useState(false);
  const [disputeTriggered, setDisputeTriggered] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, [user]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/agent/orders");
      setAssignedOrders(data.orders || []);
    } catch (err) {
      console.error("Agent orders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (o: Order) => {
    setSelectedOrder(o);
    setDeliveryCode("");
    setAttemptsLeft(3);
    setDisputeTriggered(false);
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || deliveryCode.length !== 4) return;

    setVerifying(true);
    try {
      await apiRequest(`/agent/orders/${selectedOrder.id}/confirm-delivery`, {
        method: "POST",
        body: JSON.stringify({ code: deliveryCode.trim() })
      });

      showToast("Delivery confirmed successfully! Handover complete.", "success");
      setSelectedOrder(null);
      await loadDeliveries();
    } catch (err: any) {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);

      if (nextAttempts <= 0) {
        setDisputeTriggered(true);
        showToast("DELIVERY DISPUTE: 3 incorrect codes entered. Order has been locked and flagged for store admin.", "error");
      } else {
        showToast(`Incorrect 4-digit code. ${nextAttempts} attempt(s) remaining before dispute lock.`, "error");
      }
    } finally {
      setVerifying(false);
    }
  };

  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return (
      <div className="card" style={{ maxWidth: "460px", margin: "40px auto", padding: "36px", textAlign: "center" }}>
        <ShieldAlert size={48} color="#DC2626" style={{ margin: "0 auto 16px auto" }} />
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Agent Portal Access Restricted</h2>
        <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>
          You must be signed in with an authorized Delivery Agent account to access this rider portal.
        </p>
        <Link to="/signin" className="btn btn-primary btn-full">
          Sign In as Delivery Agent (agent@spheretest.rw)
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Rider Header Bar */}
      <div className="card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "999px", background: "var(--cs-emerald-50)", color: "var(--cs-emerald-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{user.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--cs-emerald-700)", fontWeight: 700 }}>
              Active Rider • Kigali Delivery Unit
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="SphereShop" style={{ height: "34px", objectFit: "contain" }} />
          <button
            onClick={async () => { await logout(); navigate("/signin"); }}
            className="btn btn-secondary"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          Active Assigned Deliveries
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.9rem" }}>
          Verify handover with the customer's 4-digit SMS security code upon physical delivery.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2].map((i) => (
            <div key={i} className="card" style={{ height: "160px" }}>
              <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "48px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : assignedOrders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 20px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#EFF6FF", color: "var(--cs-blue-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>No Active Deliveries</h3>
          <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>
            You have no parcels in transit. Stand by for new assignments from the central dispatch console.
          </p>
          <button onClick={loadDeliveries} className="btn btn-secondary">
            Refresh Deliveries
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {assignedOrders.map((o) => (
            <div key={o.id} className="card" style={{ padding: "24px" }} id={`agent-delivery-${o.order_number}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", borderBottom: "1px solid var(--cs-border)", paddingBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--cs-blue-600)" }}>
                      #{o.order_number}
                    </span>
                    <span className="status-pill status-out-for-delivery">OUT FOR DELIVERY</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--cs-text-muted)" }}>
                    Value: {formatRWF(o.total)} • Paid Online
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConfirm(o)}
                  className="btn btn-primary"
                  style={{ padding: "10px 18px" }}
                  id={`confirm-delivery-btn-${o.order_number}`}
                >
                  <KeyRound size={16} />
                  <span>Verify 4-Digit Code</span>
                </button>
              </div>

              {/* Destination Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "var(--cs-text-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={18} color="var(--cs-blue-600)" />
                  <div>
                    <strong>{o.delivery_district}:</strong> {o.delivery_address}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={18} color="var(--cs-emerald-700)" />
                  <a href={`tel:${o.shopper_id}`} style={{ color: "var(--cs-emerald-700)", fontWeight: 700, textDecoration: "none" }}>
                    Call Customer
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4-Digit Code Verification Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delivery</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>

            <form onSubmit={handleConfirmDelivery}>
              <div className="modal-body">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.9rem" }}>
                    Ask the customer for the <strong>4-digit delivery security PIN</strong> sent to their phone via SMS for order <strong>#{selectedOrder.order_number}</strong>:
                  </p>
                </div>

                {disputeTriggered ? (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "16px", borderRadius: "var(--cs-radius-md)", textAlign: "center" }}>
                    <ShieldAlert size={36} style={{ margin: "0 auto 8px auto" }} />
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>DELIVERY DISPUTE TRIGGERED</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      3 incorrect attempts exceeded. The order is now locked. Please contact store operations.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="••••"
                        value={deliveryCode}
                        onChange={(e) => setDeliveryCode(e.target.value.replace(/\D/g, ""))}
                        style={{
                          width: "100%",
                          textAlign: "center",
                          fontSize: "2rem",
                          fontWeight: 900,
                          letterSpacing: "0.5em",
                          padding: "12px",
                          borderRadius: "var(--cs-radius-md)",
                          border: "2px solid var(--cs-border)",
                          background: "#F8FAFC",
                          outline: "none"
                        }}
                        autoFocus
                        required
                      />
                    </div>

                    <div style={{ textAlign: "center", fontSize: "0.825rem", color: attemptsLeft < 3 ? "#DC2626" : "var(--cs-text-muted)", marginBottom: "16px" }}>
                      {attemptsLeft < 3 ? `⚠️ Warning: ${attemptsLeft} attempt(s) left before dispute lock.` : "3 attempts permitted."}
                    </div>

                    <button
                      type="submit"
                      disabled={verifying || deliveryCode.length !== 4}
                      className="btn btn-primary btn-full"
                      style={{ padding: "12px", fontSize: "1rem" }}
                    >
                      <span>{verifying ? "Verifying PIN..." : "Confirm & Complete Handover"}</span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
