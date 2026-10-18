import React, { useEffect, useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
  CreditCard
} from "lucide-react";
import { ReturnRequest } from "../../types";
import { apiRequest } from "../../services/api";
import { useStore } from "../../context/StoreContext";

export function AdminReturnsPage() {
  const { showToast } = useStore();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/admin/returns");
      setReturns(data.returns || []);
    } catch (err) {
      console.error("Load returns error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (retId: string) => {
    setActionLoadingId(retId);
    try {
      const res = await apiRequest(`/admin/returns/${retId}/approve`, { method: "POST" });
      showToast(`Return approved! 7-day return code generated: ${res.returnCode || "RET-7890"}`, "success");
      await loadReturns();
    } catch (err: any) {
      showToast(err.message || "Failed to approve return", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (retId: string) => {
    const reason = prompt("Enter rejection reason for customer (e.g. Return window expired or item unsealed):");
    if (!reason || !reason.trim()) return;

    setActionLoadingId(retId);
    try {
      await apiRequest(`/admin/returns/${retId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() })
      });
      showToast("Return request rejected with customer notice.", "info");
      await loadReturns();
    } catch (err: any) {
      showToast(err.message || "Failed to reject return", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptAndRefund = async (retId: string) => {
    setActionLoadingId(retId);
    try {
      await apiRequest(`/admin/returns/${retId}/accept`, {
        method: "POST",
        body: JSON.stringify({ isFaulty: true })
      });
      showToast("Item accepted into inventory and payment refund executed!", "success");
      await loadReturns();
    } catch (err: any) {
      showToast(err.message || "Failed to process refund", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          Returns & Refunds Inbox
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Inspect shopper return requests, generate 7-day drop-off codes, and issue payment refunds.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="data-table-container" style={{ border: "none", boxShadow: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order Ref</th>
                <th>Reason Provided</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px" }}>
                    Loading returns queue...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--cs-text-muted)" }}>
                    No pending return requests in queue.
                  </td>
                </tr>
              ) : (
                returns.map((r) => {
                  const isProcessing = actionLoadingId === r.id;
                  const isOpen = r.status === "OPEN";
                  const isApproved = r.status === "APPROVED";

                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 800, color: "var(--cs-blue-600)" }}>{r.id}</td>
                      <td>#{r.order_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.reason}</div>
                        {r.return_code && (
                          <div style={{ fontSize: "0.75rem", color: "var(--cs-emerald-700)", fontWeight: 700 }}>
                            Drop-off Code: {r.return_code}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${r.status.toLowerCase().replace(/_/g, "-")}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--cs-text-muted)" }}>
                        {new Date(r.created_at).toLocaleDateString("en-RW")}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          {isOpen && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                disabled={isProcessing}
                                className="btn btn-secondary"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", color: "var(--cs-emerald-700)" }}
                                title="Approve return"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                disabled={isProcessing}
                                className="btn btn-secondary"
                                style={{ padding: "6px 10px", fontSize: "0.8rem", color: "#DC2626" }}
                                title="Reject return"
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleAcceptAndRefund(r.id)}
                              disabled={isProcessing}
                              className="btn btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              <CreditCard size={14} />
                              <span>Accept & Refund</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
