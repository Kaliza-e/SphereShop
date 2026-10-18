import React, { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  RotateCcw,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ToastContainer } from "../components/ToastContainer";

export function AdminLayout() {
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className="app-shell" style={{ background: "#F1F5F9" }}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(10, 15, 29, 0.6)", zIndex: 39 }}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`} style={{ background: "#0F172A" }}>
        <div className="sidebar-logo" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/logo.png"
              alt="SphereShop Logo"
              style={{
                height: "44px",
                width: "auto",
                objectFit: "contain"
              }}
            />
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>SphereOps</div>
              <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Admin Operations Console</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden"
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #2563EB, #06B6D4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1rem"
          }}>
            {user?.name?.charAt(0) || "A"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "Ops Admin"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#06B6D4", fontWeight: 600 }}>Store Administrator</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/products" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <Package size={18} />
            <span>Products Catalogue</span>
          </NavLink>

          <NavLink to="/admin/dispatch" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <Truck size={18} />
            <span>Dispatch Queue</span>
          </NavLink>

          <NavLink to="/admin/returns" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <RotateCcw size={18} />
            <span>Returns & Refunds</span>
          </NavLink>

          <NavLink to="/admin/audit" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
            <ShieldAlert size={18} />
            <span>Security & Audit</span>
          </NavLink>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "12px 0" }} />

          <Link to="/" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
            <ArrowLeft size={18} />
            <span>Back to Storefront</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-full"
            style={{ padding: "8px 12px", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.15)" }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-secondary lg:hidden"
              style={{ padding: "8px" }}
              aria-label="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cs-text-primary)" }}>
              Administration & Operations
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--cs-text-muted)", fontWeight: 600 }}>
              Kigali Time (UTC+2)
            </span>
            <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} />
            </div>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
