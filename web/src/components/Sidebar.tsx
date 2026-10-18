import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Grid,
  Package,
  Heart,
  Calendar,
  User,
  Shield,
  Truck,
  HelpCircle,
  Menu,
  Sparkles
} from "lucide-react";
import { useStore } from "../context/StoreContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, cartCount, wishlist } = useStore();

  const handleHamburgerClick = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.6)",
            zIndex: 39,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? "mobile-open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <Link
            to="/"
            onClick={onClose}
            className="sidebar-brand-link"
            title="SphereShop Home"
          >
            <img
              src="/logo.png"
              alt="SphereShop Logo"
              className="sidebar-brand-img"
            />
          </Link>
          <button
            onClick={handleHamburgerClick}
            className="sidebar-hamburger-btn"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <Home size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <ShoppingBag size={18} />
            <span>Shop Catalogue</span>
          </NavLink>

          <NavLink to="/book" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <Calendar size={18} />
            <span>Book Setup Visit</span>
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <Package size={18} />
            <span>My Orders</span>
          </NavLink>

          <NavLink to="/wishlist" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <Heart size={18} />
            <span>Wishlist</span>
            {wishlist.length > 0 && <span className="sidebar-link-badge">{wishlist.length}</span>}
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="sidebar-link-badge">{cartCount}</span>}
          </NavLink>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />

          {user && user.role === "ADMIN" && (
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
              <Shield size={18} color="var(--cs-cyan-500)" />
              <span style={{ color: "var(--cs-cyan-500)" }}>Admin Console</span>
            </NavLink>
          )}

          {user && (user.role === "AGENT" || user.role === "ADMIN") && (
            <NavLink to="/agent" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
              <Truck size={18} color="var(--cs-emerald-500)" />
              <span style={{ color: "var(--cs-emerald-500)" }}>Agent Portal</span>
            </NavLink>
          )}

          {user ? (
            <NavLink to="/account" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
              <User size={18} />
              <span>Account ({user.name.split(" ")[0]})</span>
            </NavLink>
          ) : (
            <NavLink to="/signin" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
              <User size={18} />
              <span>Sign In / Register</span>
            </NavLink>
          )}

          <a
            href="https://wa.me/250788000000"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
            style={{ marginTop: "auto" }}
          >
            <HelpCircle size={18} />
            <span>Support & FAQ</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-badge">
            <Sparkles size={14} color="var(--cs-cyan-500)" />
            <span>Kigali, Rwanda</span>
          </div>
          <div>Fast • Reliable • Secure Delivery</div>
        </div>
      </aside>
    </>
  );
}
