import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, Package, User, Menu } from "lucide-react";
import { useStore } from "../context/StoreContext";

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { cartCount, user } = useStore();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/products" className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
        <ShoppingBag size={20} />
        <span>Shop</span>
      </NavLink>

      <NavLink to="/cart" className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
        <div style={{ position: "relative" }}>
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="cart-pill" style={{ position: "absolute", top: "-6px", right: "-10px" }}>{cartCount}</span>}
        </div>
        <span>Cart</span>
      </NavLink>

      <NavLink to="/orders" className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
        <Package size={20} />
        <span>Orders</span>
      </NavLink>

      <button
        type="button"
        onClick={onOpenMenu}
        className="mobile-nav-link"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        aria-label="Open Navigation Menu"
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
