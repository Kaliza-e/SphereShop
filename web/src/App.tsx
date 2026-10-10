import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ShoppingBag, Search, User, LogOut, Package, Calendar, Shield, Truck, ChevronRight, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { apiRequest, formatRWF } from "./services/api";

// --- Header / Navbar Component ---
function Navbar({ user, setUser, cartCount }: { user: any; setUser: any; cartCount: number }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      setUser(null);
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: "24px" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, #06B6D4, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SphereShop
          </span>
          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", color: "#94A3B8" }}>Kigali</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/products" className="btn btn-secondary" style={{ padding: "8px 12px" }}><Search size={16} /> Products</Link>
          <Link to="/book" className="btn btn-secondary" style={{ padding: "8px 12px" }}><Calendar size={16} /> Book Visit</Link>
          <Link to="/cart" className="btn btn-primary" style={{ padding: "8px 12px", position: "relative" }}>
            <ShoppingBag size={16} /> Cart
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#F43F5E", color: "#FFF", borderRadius: "999px", fontSize: "0.7rem", padding: "2px 6px", fontWeight: "bold" }}>
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link to="/orders" className="btn btn-secondary" style={{ padding: "8px 12px" }}><Package size={16} /> Orders</Link>
              {user.role === "ADMIN" && <Link to="/admin" className="btn btn-secondary" style={{ padding: "8px 12px", borderColor: "#06B6D4" }}><Shield size={16} /> Admin</Link>}
              {user.role === "AGENT" && <Link to="/agent" className="btn btn-secondary" style={{ padding: "8px 12px", borderColor: "#10B981" }}><Truck size={16} /> Agent</Link>}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "8px 12px" }}><LogOut size={16} /></button>
            </div>
          ) : (
            <Link to="/signin" className="btn btn-secondary" style={{ padding: "8px 12px" }}><User size={16} /> Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// --- Home / Product Catalogue Page ---
function ProductsPage({ onAddToCart }: { onAddToCart: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [emptyMsg, setEmptyMsg] = useState("");

  const q = searchParams.get("q") || "";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/products?q=${encodeURIComponent(q)}&page=${page}`);
      setProducts(data.items);
      setPagination(data.pagination);
      setEmptyMsg(data.message || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q, page: "1" });
  };

  return (
    <div className="container">
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Cloud Sphere Storefront — Kigali</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Genuine Electronics Accessories, Home-Office Gear & On-Site Setup Visit Booking</p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products by name or SKU (e.g. HDP-01, headphones)..."
            value={q}
            onChange={(e) => setSearchParams({ q: e.target.value, page: "1" })}
            aria-label="Search products by name or SKU"
          />
          <button type="submit" className="btn btn-primary"><Search size={18} /> Search</button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading catalogue...</div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <h3>{emptyMsg || "No products match your search"}</h3>
          <p style={{ color: "var(--text-muted)", margin: "12px 0" }}>Try clearing search filters or checking spelling.</p>
          <button onClick={() => setSearchParams({})} className="btn btn-secondary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>{p.sku}</span>
                    <span className={`badge badge-${p.stockBadge.toLowerCase().replace(/\s+/g, "-")}`}>{p.stockBadge}</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>{p.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px" }}>{p.description}</p>
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "12px" }}>
                    {formatRWF(p.price)}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link to={`/products/${p.sku}`} className="btn btn-secondary" style={{ flex: 1 }}>Details</Link>

                    <button
                      disabled={p.stock <= 0}
                      onClick={async () => {
                        try {
                          await apiRequest("/cart/items", { method: "POST", body: JSON.stringify({ productId: p.id, quantity: 1 }) });
                          onAddToCart();
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setSearchParams({ q, page: pNum.toString() })}
                  className={`btn ${parseInt(page, 10) === pNum ? "btn-primary" : "btn-secondary"}`}
                >
                  {pNum}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Product Detail Page ---
function ProductDetailPage({ onAddToCart }: { onAddToCart: () => void }) {
  const { sku } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/products/${sku}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message));
  }, [sku]);

  if (error) {
    return (
      <div className="container glass-card" style={{ textAlign: "center", padding: "40px" }}>
        <h2>Product Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "12px 0" }}>{error}</p>
        <Link to="/products" className="btn btn-secondary">Back to Catalogue</Link>
      </div>
    );
  }

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>SKU: {product.sku}</span>
          <span className={`badge badge-${product.stockBadge.toLowerCase().replace(/\s+/g, "-")}`}>{product.stockBadge}</span>
        </div>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>{product.name}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{product.description}</p>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "20px" }}>
          {formatRWF(product.price)}
        </div>

        <button
          disabled={product.addToCartDisabled}
          onClick={async () => {
            try {
              await apiRequest("/cart/items", { method: "POST", body: JSON.stringify({ productId: product.id, quantity: 1 }) });
              onAddToCart();
              alert("Added to cart!");
            } catch (err: any) {
              alert(err.message);
            }
          }}
          className="btn btn-primary"
          style={{ width: "100%", padding: "14px" }}
        >
          {product.addToCartDisabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// --- Cart Page ---
function CartPage({ onCartUpdated }: { onCartUpdated: () => void }) {
  const [cart, setCart] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponErr, setCouponErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await apiRequest("/cart");
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponErr("");
    try {
      await apiRequest("/cart/coupon", { method: "POST", body: JSON.stringify({ code: couponCode }) });
      loadCart();
      setCouponCode("");
    } catch (err: any) {
      setCouponErr(err.message);
    }
  };

  const handleRemoveCoupon = async () => {
    await apiRequest("/cart/coupon", { method: "DELETE" });
    loadCart();
  };

  if (!cart) return <div className="container">Loading cart...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Your Shopping Cart</h1>

      {cart.lines.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
          <h3>Your cart is empty</h3>
          <p style={{ color: "var(--text-muted)", margin: "12px 0" }}>Browse our catalogue for products.</p>
          <Link to="/products" className="btn btn-primary">Browse Catalogue</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
          <div className="glass-card">
            {cart.lines.map((line: any) => (
              <div key={line.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--bg-card-border)", paddingBottom: "16px", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "1.05rem" }}>{line.name}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SKU: {line.sku} | Price: {formatRWF(line.price)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ width: "70px", textAlign: "center" }}
                    value={line.quantity}
                    onChange={async (e) => {
                      try {
                        await apiRequest(`/cart/items/${line.product_id}`, { method: "PATCH", body: JSON.stringify({ quantity: e.target.value }) });
                        loadCart();
                        onCartUpdated();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                  />
                  <div style={{ fontWeight: 700, minWidth: "90px", textAlign: "right" }}>{formatRWF(line.lineTotal)}</div>
                  <button
                    onClick={async () => {
                      await apiRequest(`/cart/items/${line.product_id}`, { method: "DELETE" });
                      loadCart();
                      onCartUpdated();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: "6px 10px", color: "var(--accent-rose)" }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ height: "fit-content" }}>
            <h3 style={{ marginBottom: "16px" }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Subtotal</span>
              <span>{formatRWF(cart.pricing.subtotal)}</span>
            </div>
            {cart.pricing.lineDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--accent-emerald)" }}>
                <span>Line Discount (8%)</span>
                <span>-{formatRWF(cart.pricing.lineDiscount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Net Subtotal</span>
              <span>{formatRWF(cart.pricing.net)}</span>
            </div>

            {/* Coupon input */}
            <div style={{ margin: "16px 0", borderTop: "1px solid var(--bg-card-border)", paddingTop: "16px" }}>
              {cart.couponCode ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(6, 182, 212, 0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                  <span>Coupon: <strong>{cart.couponCode}</strong></span>
                  <button onClick={handleRemoveCoupon} style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer" }}>Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    aria-label="Coupon code"
                  />
                  <button type="submit" className="btn btn-secondary">Apply</button>
                </form>
              )}
              {couponErr && <div style={{ color: "var(--accent-rose)", fontSize: "0.8rem", marginTop: "4px" }}>{couponErr}</div>}
            </div>

            {cart.pricing.couponDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--accent-cyan)" }}>
                <span>Coupon Discount</span>
                <span>-{formatRWF(cart.pricing.couponDiscount)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", borderTop: "1px solid var(--bg-card-border)", paddingTop: "16px", fontSize: "1.2rem", fontWeight: 800 }}>
              <span>Total Quote</span>
              <span style={{ color: "var(--accent-cyan)" }}>{formatRWF(cart.pricing.total)}</span>
            </div>

            <button onClick={() => navigate("/checkout")} className="btn btn-primary" style={{ width: "100%", marginTop: "20px", padding: "12px" }}>
              Proceed to Checkout <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Checkout Page ---
function CheckoutPage({ user }: { user: any }) {
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS" | "PICKUP">("STANDARD");
  const [district, setDistrict] = useState("Gasabo");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MTN_MOMO");
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/signin?redirect=/checkout");
      return;
    }
    fetchQuote();
  }, [deliveryMethod, district, user]);

  const fetchQuote = async () => {
    setError("");
    try {
      const res = await apiRequest(`/checkout/quote?method=${deliveryMethod}&district=${district}`);
      setQuote(res.quote);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiRequest("/orders", {
        method: "POST",
        headers: { "Idempotency-Key": `key-web-${Date.now()}` },
        body: JSON.stringify({
          deliveryMethod,
          deliveryDistrict: district,
          deliveryAddress: address,
          paymentMethod
        })
      });
      setPlacedOrder(res);
      setIsWaiting(true);
      startPolling(res.orderId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startPolling = (orderId: string) => {
    let count = 0;
    const interval = setInterval(async () => {
      count += 1;
      try {
        const data = await apiRequest(`/orders/${orderId}`);
        if (data.order.status === "PAID") {
          clearInterval(interval);
          setIsWaiting(false);
          navigate(`/orders/${orderId}`);
        } else if (data.order.status === "PAYMENT_FAILED" || data.order.status === "PAYMENT_EXPIRED") {
          clearInterval(interval);
          setIsWaiting(false);
          setError(`Payment result: ${data.order.status}. You may retry payment.`);
        }
      } catch (err) {
        console.error(err);
      }
      if (count >= 24) { // 70 seconds
        clearInterval(interval);
        setIsWaiting(false);
      }
    }, 3000);
  };

  if (isWaiting) {
    return (
      <div className="container glass-card" style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center", padding: "40px" }}>
        <Clock size={48} style={{ color: "var(--accent-cyan)", marginBottom: "16px", animation: "spin 2s linear infinite" }} />
        <h2>Waiting for Payment Confirmation</h2>
        <p style={{ color: "var(--text-muted)", margin: "12px 0" }}>Please approve the MoMo/Airtel prompt on your phone...</p>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Order: {placedOrder?.orderNumber}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>Checkout</h1>

      {error && <div className="glass-card" style={{ borderColor: "var(--accent-rose)", color: "var(--accent-rose)", marginBottom: "16px" }}>{error}</div>}

      <form onSubmit={handlePlaceOrder} className="glass-card">
        <h3 style={{ marginBottom: "16px" }}>1. Delivery Option</h3>

        <div className="form-group">
          <label className="form-label" htmlFor="delivery-method-select">Method</label>
          <select id="delivery-method-select" className="form-select" value={deliveryMethod} onChange={(e: any) => setDeliveryMethod(e.target.value)}>
            <option value="STANDARD">Standard Delivery (1,500 RWF)</option>
            <option value="EXPRESS">Express Delivery (3,500 RWF — before 14:00)</option>
            <option value="PICKUP">Store Pickup (0 RWF)</option>
          </select>
        </div>

        {deliveryMethod !== "PICKUP" && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="district-select">District (Gasabo, Kicukiro, Nyarugenge)</label>
              <select id="district-select" className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="Gasabo">Gasabo</option>
                <option value="Kicukiro">Kicukiro</option>
                <option value="Nyarugenge">Nyarugenge</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="street-address-input">Street Address / Landmark</label>
              <input id="street-address-input" type="text" className="form-input" required placeholder="e.g. KG 123 St, Remera" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </>
        )}

        <h3 style={{ margin: "24px 0 16px" }}>2. Payment Method</h3>
        <div className="form-group">
          <label className="form-label" htmlFor="payment-method-select">Provider</label>
          <select id="payment-method-select" className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="MTN_MOMO">MTN Mobile Money</option>
            <option value="AIRTEL_MONEY">Airtel Money</option>
            <option value="CARD">Credit / Debit Card</option>
          </select>
        </div>

        {quote && (
          <div style={{ margin: "20px 0", background: "rgba(15, 23, 42, 0.6)", padding: "16px", borderRadius: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span>Net Subtotal:</span><span>{formatRWF(quote.netAfterCoupon)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span>Delivery Fee:</span><span>{formatRWF(quote.deliveryFee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.2rem", color: "var(--accent-cyan)", borderTop: "1px solid var(--bg-card-border)", paddingTop: "8px" }}>
              <span>Total:</span><span>{formatRWF(quote.total)}</span>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
          Confirm & Pay {quote && formatRWF(quote.total)}
        </button>
      </form>
    </div>
  );
}

// --- Sign In Page ---
function SignInPage({ setUser }: { setUser: any }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login, password })
      });
      setUser(data.user);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px" }}>
      <form onSubmit={handleSubmit} className="glass-card">
        <h1 style={{ fontSize: "1.6rem", marginBottom: "20px", textAlign: "center" }}>Sign In to SphereShop</h1>

        {error && <div style={{ background: "rgba(244,63,94,0.1)", color: "var(--accent-rose)", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="signin-phone-or-email">Phone Number or E-mail</label>
          <input id="signin-phone-or-email" type="text" className="form-input" required placeholder="0781000001 or name@test.rw" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signin-password">Password</label>
          <input id="signin-password" type="password" className="form-input" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "12px" }}>Sign In</button>

        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.85rem" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--accent-cyan)" }}>Register here</Link>
        </div>
      </form>
    </div>
  );
}

// --- Register Page ---
function RegisterPage({ setUser }: { setUser: any }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, password, confirmPassword })
      });
      setUser(data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "480px" }}>
      <form onSubmit={handleSubmit} className="glass-card">
        <h1 style={{ fontSize: "1.6rem", marginBottom: "20px", textAlign: "center" }}>Create Shopper Account</h1>

        {error && <div style={{ background: "rgba(244,63,94,0.1)", color: "var(--accent-rose)", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="register-full-name">Full Name</label>
          <input id="register-full-name" type="text" className="form-input" required placeholder="Aline Umutoni" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-phone">Phone Number (Rwandan 10 digits: 078/079/072/073)</label>
          <input id="register-phone" type="text" className="form-input" required placeholder="0781999001" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">E-mail Address</label>
          <input id="register-email" type="email" className="form-input" required placeholder="aline@spheretest.rw" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Password (≥8 chars, 1 letter, 1 digit)</label>
          <input id="register-password" type="password" className="form-input" required placeholder="Kigali2026" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
          <input id="register-confirm-password" type="password" className="form-input" required placeholder="Kigali2026" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "12px" }}>Register & Sign In</button>
      </form>
    </div>
  );
}

// --- Orders & Admin Pages Stubs ---
function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    apiRequest("/orders").then((data) => setOrders(data.orders)).catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>My Orders</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {orders.map((o) => (
          <div key={o.id} className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>{o.order_number}</h3>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total: {formatRWF(o.total)} | Status: <strong style={{ color: "var(--accent-cyan)" }}>{o.status}</strong></div>
            </div>
            <Link to={`/orders/${o.id}`} className="btn btn-secondary">View History</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    apiRequest(`/orders/${id}`).then((data) => setOrder(data.order)).catch(console.error);
  }, [id]);

  if (!order) return <div className="container">Loading order...</div>;

  return (
    <div className="container glass-card">
      <h2>Order #{order.order_number}</h2>
      <p>Status: <strong>{order.status}</strong></p>
      <p>Total: {formatRWF(order.total)}</p>
      <p>Masked Payment Ref: {order.maskedPaymentRef}</p>
      <h3 style={{ marginTop: "20px" }}>Timeline Events:</h3>
      <ul>
        {order.history.map((h: any) => (
          <li key={h.id}>{new Date(h.created_at).toLocaleString()}: {h.from_state || "Start"} → {h.to_state} ({h.note})</li>
        ))}
      </ul>
    </div>
  );
}

function ServiceBookingPage() {
  const [date, setDate] = useState("2026-10-12");
  const [startTime, setStartTime] = useState("10:00");
  const [slots, setSlots] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest(`/services/svc-setup/slots?date=${date}`)
      .then((data) => setSlots(data.availableSlots))
      .catch(console.error);
  }, [date]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId: "svc-setup", date, startTime })
      });
      alert("Service visit booked successfully!");
      navigate("/orders");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="container glass-card" style={{ maxWidth: "500px" }}>
      <h1>Book Device Setup Visit</h1>
      <form onSubmit={handleBook} style={{ marginTop: "16px" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="booking-date-select">Select Date (Mon - Sat)</label>
          <input id="booking-date-select" type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="booking-time-select">Available Time Slot (Capacity 2)</label>
          <select id="booking-time-select" className="form-select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {slots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Confirm Booking</button>
      </form>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="container glass-card">
      <h1>Store Administration Console</h1>
      <p style={{ color: "var(--text-muted)" }}>Catalogue Management, Dispatch Queue, Returns Inbox & Audit Events</p>
    </div>
  );
}

function AgentPage() {
  return (
    <div className="container glass-card" style={{ maxWidth: "420px" }}>
      <h1>Delivery Agent Portal</h1>
      <p style={{ color: "var(--text-muted)" }}>Confirm orders with 4-digit shopper delivery code</p>
    </div>
  );
}

// --- Main App Entry ---
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    apiRequest("/auth/me").then((d) => setUser(d.user)).catch(() => {});
    updateCartCount();
  }, []);

  const updateCartCount = async () => {
    try {
      const d = await apiRequest("/cart");
      setCartCount(d.lines.reduce((acc: number, l: any) => acc + l.quantity, 0));
    } catch {}
  };

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<ProductsPage onAddToCart={updateCartCount} />} />
        <Route path="/products" element={<ProductsPage onAddToCart={updateCartCount} />} />
        <Route path="/products/:sku" element={<ProductDetailPage onAddToCart={updateCartCount} />} />
        <Route path="/cart" element={<CartPage onCartUpdated={updateCartCount} />} />
        <Route path="/checkout" element={<CheckoutPage user={user} />} />
        <Route path="/signin" element={<SignInPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/book" element={<ServiceBookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/agent" element={<AgentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
