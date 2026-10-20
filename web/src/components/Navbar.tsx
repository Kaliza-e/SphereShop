import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  User as UserIcon,
  ShoppingCart,
  Menu,
  X,
  Shield,
  Truck,
  Package,
  Heart,
  Calendar,
  LogOut,
  ChevronDown,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { SphereLogo } from "./SphereLogo";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const { user, cartCount, searchQuery, setSearchQuery, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Interactive UI state
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Global keyboard shortcut ('/' to search, 'Escape' to close popups)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAccountOpen(false);
        setCategoriesOpen(false);
        setAboutModalOpen(false);
        setContactModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setSearchOpen(false);
    setAccountOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    } else {
      navigate("/products");
      setSearchOpen(false);
    }
  };

  const isHomeActive = location.pathname === "/";

  const categories = [
    { name: "All Categories", slug: "" },
    { name: "Audio Gear & Headphones", slug: "audio" },
    { name: "Electronics & Accessories", slug: "accessories" },
    { name: "Home & Office Workstations", slug: "home-office" },
    { name: "Power Banks & Chargers", slug: "power" },
    { name: "Laptops & Computing", slug: "laptops" },
  ];

  return (
    <>
      <header className="sphereshop-navbar" role="banner">
        <div className="navbar-container">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="navbar-left">
            {onToggleMobileMenu && (
              <button
                type="button"
                className="navbar-mobile-toggle"
                onClick={onToggleMobileMenu}
                aria-label="Toggle Navigation Drawer"
                title="Toggle Menu"
              >
                <Menu size={22} />
              </button>
            )}

            <Link
              to="/"
              className="navbar-brand-link"
              aria-label="SphereShop Homepage"
              title="SphereShop Home"
            >
              <SphereLogo size="md" />
            </Link>
          </div>

          {/* Center: Primary Navigation Links */}
          <nav
            className="navbar-center-nav"
            role="navigation"
            aria-label="Primary Navigation"
          >
            {/* Home link with active underline indicator */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>Home</span>
              {isHomeActive && <span className="nav-active-indicator" />}
            </NavLink>

            {/* Shop link */}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>Shop</span>
            </NavLink>

            {/* Categories link / dropdown */}
            <div className="nav-dropdown-wrapper" ref={categoriesRef}>
              <button
                type="button"
                className={`nav-link nav-btn-link ${
                  categoriesOpen ? "active" : ""
                }`}
                onClick={() => setCategoriesOpen((prev) => !prev)}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: categoriesOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {categoriesOpen && (
                <div className="nav-dropdown-menu" role="menu">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={
                        cat.slug
                          ? `/products?category=${encodeURIComponent(cat.slug)}`
                          : "/products"
                      }
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About link */}
            <button
              type="button"
              className="nav-link nav-btn-link"
              onClick={() => setAboutModalOpen(true)}
            >
              <span>About</span>
            </button>

            {/* Contact link */}
            <button
              type="button"
              className="nav-link nav-btn-link"
              onClick={() => setContactModalOpen(true)}
            >
              <span>Contact</span>
            </button>
          </nav>

          {/* Right: Functional Utility Icons */}
          <div className="navbar-right">
            {/* Search Icon Button */}
            <button
              type="button"
              className={`nav-icon-btn ${searchOpen ? "active" : ""}`}
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search Products"
              title="Search (Press / to focus)"
            >
              <Search size={21} strokeWidth={2} />
            </button>

            {/* Account Icon Button & Popover */}
            <div className="nav-dropdown-wrapper" ref={accountRef}>
              <button
                type="button"
                className={`nav-icon-btn ${accountOpen ? "active" : ""}`}
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-label="User Account"
                title={user ? `Account: ${user.name}` : "User Account"}
                aria-expanded={accountOpen}
              >
                <UserIcon size={21} strokeWidth={2} />
              </button>

              {accountOpen && (
                <div
                  className="nav-dropdown-menu account-dropdown-menu"
                  role="menu"
                >
                  {user ? (
                    <>
                      <div className="account-header-info">
                        <div className="account-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="account-details">
                          <div className="account-name">{user.name}</div>
                          <div className="account-email">{user.email}</div>
                          <span className={`role-badge role-${user.role.toLowerCase()}`}>
                            {user.role === "ADMIN"
                              ? "Administrator"
                              : user.role === "AGENT"
                              ? "Dispatch Agent"
                              : "Verified Customer"}
                          </span>
                        </div>
                      </div>

                      <div className="dropdown-divider" />

                      <Link
                        to="/orders"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package size={16} />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Heart size={16} />
                        <span>Wishlist</span>
                      </Link>

                      <Link
                        to="/book"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Calendar size={16} />
                        <span>Book Setup Visit</span>
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          className="dropdown-item dropdown-admin-item"
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Shield size={16} color="#06B6D4" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      {user.role === "AGENT" && (
                        <Link
                          to="/agent"
                          className="dropdown-item dropdown-agent-item"
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Truck size={16} color="#10B981" />
                          <span>Agent Portal</span>
                        </Link>
                      )}

                      <div className="dropdown-divider" />

                      <button
                        type="button"
                        className="dropdown-item dropdown-logout-btn"
                        role="menuitem"
                        onClick={async () => {
                          setAccountOpen(false);
                          await logout();
                        }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="account-guest-banner">
                        <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                          Welcome to SphereShop
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "12px" }}>
                          Sign in to manage your orders, wishlist, and Kigali deliveries.
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link
                            to="/signin"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem", justifyContent: "center" }}
                            onClick={() => setAccountOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem", justifyContent: "center" }}
                            onClick={() => setAccountOpen(false)}
                          >
                            Register
                          </Link>
                        </div>
                      </div>

                      <div className="dropdown-divider" />

                      <Link
                        to="/orders"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package size={16} />
                        <span>Track an Order</span>
                      </Link>

                      <Link
                        to="/book"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Calendar size={16} />
                        <span>Book Device Setup</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Icon with Circular Blue Badge */}
            <Link
              to="/cart"
              className="nav-icon-btn cart-icon-btn"
              aria-label={`Shopping Cart with ${cartCount} items`}
              title="Shopping Cart"
              id="header-cart-icon-btn"
            >
              <ShoppingCart size={21} strokeWidth={2} />
              {/* Blue circular badge showing item count, default '0' matching reference image */}
              <span className="cart-badge" aria-hidden="true">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar Overlay */}
        {searchOpen && (
          <div className="navbar-search-overlay">
            <div className="navbar-container">
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <Search size={20} className="search-bar-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="navbar-search-input"
                  placeholder="Search products, brands, headphones, chargers, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="search-close-btn"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close Search"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* About SphereShop Modal */}
      {aboutModalOpen && (
        <div className="modal-backdrop" onClick={() => setAboutModalOpen(false)}>
          <div
            className="modal-content modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-modal-title"
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <SphereLogo size="sm" />
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAboutModalOpen(false)}
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px", color: "#334155" }}>
              <h2
                id="about-modal-title"
                style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", marginBottom: "12px" }}
              >
                Shop Smart. Live Better.
              </h2>
              <p style={{ lineHeight: 1.6, marginBottom: "14px", fontSize: "0.95rem" }}>
                SphereShop is Kigali’s premier tech and lifestyle e-commerce platform, engineered by Cloud Sphere Solutions. We bridge the gap between world-class authentic consumer technology and fast, dependable Rwandan delivery.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", margin: "20px 0" }}>
                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>100% Verified Quality</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
                    Every item is inspected and warranted before dispatch across Rwanda.
                  </div>
                </div>
                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem" }}>Certified Setup Visits</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
                    Expert technician on-site home or office installation service.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <Link
                  to="/products"
                  className="btn btn-primary"
                  onClick={() => setAboutModalOpen(false)}
                >
                  Explore Catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {contactModalOpen && (
        <div className="modal-backdrop" onClick={() => setContactModalOpen(false)}>
          <div
            className="modal-content modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <SphereLogo size="sm" />
                <span style={{ fontWeight: 700, color: "#0F172A" }}>Customer Support</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setContactModalOpen(false)}
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px" }}>
              <h2
                id="contact-modal-title"
                style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}
              >
                We're Here to Help
              </h2>
              <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "20px" }}>
                Our Kigali support desk is available Monday through Saturday from 08:00 to 19:00.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <a
                  href="https://wa.me/250788000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    color: "#166534",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <MessageCircle size={22} color="#16A34A" />
                  <div>
                    <div style={{ fontSize: "0.95rem" }}>Instant WhatsApp Chat</div>
                    <div style={{ fontSize: "0.8rem", color: "#15803D" }}>+250 788 000 000 (Fastest response)</div>
                  </div>
                  <ExternalLink size={16} style={{ marginLeft: "auto" }} />
                </a>

                <a
                  href="tel:+250788000000"
                  className="contact-card-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    color: "#1E40AF",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  <Phone size={22} color="#2563EB" />
                  <div>
                    <div style={{ fontSize: "0.95rem" }}>Direct Phone Line</div>
                    <div style={{ fontSize: "0.8rem", color: "#2563EB" }}>Toll-Free in Rwanda: 250 788 000 000</div>
                  </div>
                </a>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    color: "#334155",
                  }}
                >
                  <MapPin size={22} color="#64748B" />
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>Kigali Fulfillment Hub</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748B" }}>KN 4 Ave, Commercial District, Kigali, Rwanda</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setContactModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
