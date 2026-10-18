import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User as UserIcon, LogOut, Shield, Truck } from "lucide-react";
import { useStore } from "../context/StoreContext";

export function Navbar() {
  const { user, cartCount, searchQuery, setSearchQuery, logout } = useStore();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <header className="top-header">

      <form onSubmit={handleSearchSubmit} className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search for electronics, cables, accessories, SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="top-actions">
        <Link to="/cart" className="cart-button" id="header-cart-btn">
          <ShoppingBag size={18} color="var(--cs-orange-500)" />
          <span>Cart</span>
          {cartCount > 0 && <span className="cart-pill">{cartCount}</span>}
        </Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              to={user.role === "ADMIN" ? "/admin" : user.role === "AGENT" ? "/agent" : "/orders"}
              className="user-profile-btn"
              title={`${user.name} (${user.role})`}
            >
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name.split(" ")[0]}
              </span>
              {user.role === "ADMIN" && <Shield size={14} color="var(--cs-cyan-500)" />}
              {user.role === "AGENT" && <Truck size={14} color="var(--cs-emerald-500)" />}
            </Link>
            <button
              onClick={() => logout()}
              className="btn btn-secondary"
              style={{ padding: "8px 10px", minWidth: "auto" }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/signin" className="btn btn-secondary" style={{ padding: "8px 16px" }}>
            <UserIcon size={16} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
