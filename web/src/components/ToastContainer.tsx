import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useStore } from "../context/StoreContext";

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        let icon = <Info size={18} color="var(--cs-cyan-500)" />;
        let className = "toast";

        if (toast.type === "success") {
          icon = <CheckCircle2 size={18} color="var(--cs-emerald-500)" />;
          className = "toast toast-success";
        } else if (toast.type === "error") {
          icon = <AlertCircle size={18} color="var(--cs-rose-500)" />;
          className = "toast toast-error";
        } else if (toast.type === "warning") {
          icon = <AlertTriangle size={18} color="var(--cs-amber-500)" />;
          className = "toast toast-warning";
        }

        return (
          <div key={toast.id} className={className} role="alert">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {icon}
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center"
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
