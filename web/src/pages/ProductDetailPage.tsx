import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Product } from "../types";
import { apiRequest } from "../services/api";
import { getProductMedia, formatRWF } from "../data/productMedia";
import { useStore } from "../context/StoreContext";
import { ProductCard } from "../components/ProductCard";

export function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!sku) return;
      setLoading(true);
      setError(null);
      setQuantity(1);
      setActiveImageIndex(0);

      try {
        const data = await apiRequest(`/products/${sku}`);
        if (data?.product) {
          setProduct(data.product);

          // Fetch related in same category
          apiRequest(`/products?category=${data.product.category_id}&pageSize=4`)
            .then((res) => {
              if (res?.items) {
                setRelatedProducts(res.items.filter((p: Product) => p.sku !== sku).slice(0, 4));
              }
            })
            .catch(() => {});
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [sku]);

  if (loading) {
    return (
      <div className="card" style={{ padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        <div className="skeleton" style={{ height: "400px", width: "100%" }} />
        <div>
          <div className="skeleton" style={{ height: "32px", width: "70%", marginBottom: "16px" }} />
          <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "24px" }} />
          <div className="skeleton" style={{ height: "120px", width: "100%", marginBottom: "24px" }} />
          <div className="skeleton" style={{ height: "48px", width: "50%" }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Product Not Available</h2>
        <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>{error || "The product you requested could not be found."}</p>
        <Link to="/products" className="btn btn-primary">
          Back to Products Catalogue
        </Link>
      </div>
    );
  }

  const media = getProductMedia(product.sku, product.category_id);
  const gallery = media.gallery && media.gallery.length > 0 ? media.gallery : [media.main];
  const inWishlist = isInWishlist(product.sku);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxAvailable = Math.max(1, product.stock);

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.min(Math.max(1, prev + delta), maxAvailable));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    try {
      await addToCart(product.sku, quantity);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--cs-text-muted)", marginBottom: "20px" }}>
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" style={{ color: "inherit", textDecoration: "none" }}>Catalogue</Link>
        <ChevronRight size={14} />
        <span style={{ color: "var(--cs-text-primary)", fontWeight: 700 }}>{product.name}</span>
      </nav>

      {/* Product Hero Details Card */}
      <div className="card" style={{ padding: "32px", display: "grid", gridTemplateColumns: "minmax(300px, 460px) 1fr", gap: "40px", marginBottom: "32px" }}>
        {/* Left: Images */}
        <div>
          <div style={{ width: "100%", height: "380px", borderRadius: "var(--cs-radius-lg)", overflow: "hidden", background: "#F8FAFC", border: "1px solid var(--cs-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
            <img
              src={gallery[activeImageIndex] || media.main}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "var(--cs-radius-md)",
                    overflow: "hidden",
                    border: `2px solid ${activeImageIndex === idx ? "var(--cs-blue-600)" : "var(--cs-border)"}`,
                    cursor: "pointer",
                    padding: 0,
                    background: "#FFFFFF"
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cs-blue-600)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            {media.brand} • SKU: {product.sku}
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--cs-text-primary)", lineHeight: 1.25, marginBottom: "12px" }}>
            {product.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B", fontWeight: 700, fontSize: "0.9rem" }}>
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <span>{media.rating}</span>
            </div>
            <span style={{ color: "var(--cs-text-muted)", fontSize: "0.85rem" }}>
              ({media.reviews} verified shopper reviews)
            </span>
          </div>

          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "14px" }}>
            {formatRWF(product.price)}
          </div>

          {/* Stock Status Indicator */}
          <div style={{ marginBottom: "20px" }}>
            {isOutOfStock ? (
              <span className="stock-badge badge-out-of-stock" style={{ position: "static" }}>
                Out of Stock — Delivery currently unavailable
              </span>
            ) : isLowStock ? (
              <span className="stock-badge badge-low-stock" style={{ position: "static" }}>
                Low Stock — Only {product.stock} units remaining in Kigali hub!
              </span>
            ) : (
              <span className="stock-badge badge-in-stock" style={{ position: "static" }}>
                In Stock ({product.stock} available for same-day delivery)
              </span>
            )}
          </div>

          <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
            {product.description}
          </p>

          {/* Quantity and Actions */}
          {!isOutOfStock && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--cs-border)", borderRadius: "var(--cs-radius-md)", background: "#F8FAFC" }}>
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  style={{ padding: "10px 14px", border: "none", background: "none", cursor: "pointer" }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 800, fontSize: "1rem" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= product.stock}
                  style={{ padding: "10px 14px", border: "none", background: "none", cursor: "pointer" }}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {quantity >= 6 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--cs-emerald-50)", color: "var(--cs-emerald-700)", padding: "6px 12px", borderRadius: "var(--cs-radius-md)", fontSize: "0.8rem", fontWeight: 700 }}>
                  <CheckCircle2 size={14} />
                  <span>Eligible for 8% bulk line discount!</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="btn btn-primary"
              style={{ flex: 1, minWidth: "200px", padding: "14px 24px", fontSize: "1rem" }}
              id="product-detail-add-to-cart"
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? "Out of Stock" : adding ? "Adding to Cart..." : "Add to Cart"}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.sku)}
              className={`btn btn-secondary ${inWishlist ? "active" : ""}`}
              style={{ padding: "14px 20px" }}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={inWishlist ? "var(--cs-rose-500)" : "none"} color={inWishlist ? "var(--cs-rose-500)" : "currentColor"} />
              <span>{inWishlist ? "Saved" : "Wishlist"}</span>
            </button>
          </div>

          {/* Value Props Box */}
          <div style={{ borderTop: "1px solid var(--cs-border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--cs-text-secondary)" }}>
              <Truck size={18} color="var(--cs-blue-600)" />
              <span>Free standard delivery in Kigali on orders ≥ 40,000 RWF (or 1,500 RWF fee)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--cs-text-secondary)" }}>
              <RotateCcw size={18} color="var(--cs-emerald-500)" />
              <span>
                {product.is_returnable
                  ? "7-Day hassle-free return window for eligible items"
                  : "Non-returnable item (digital or hygiene product)"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--cs-text-secondary)" }}>
              <ShieldCheck size={18} color="var(--cs-cyan-500)" />
              <span>Authentic products backed by official Rwanda manufacturer warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Specifications */}
      <div className="card" style={{ padding: "28px", marginBottom: "36px" }}>
        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--cs-border)", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("description")}
            style={{
              padding: "10px 4px",
              background: "none",
              border: "none",
              borderBottom: `3px solid ${activeTab === "description" ? "var(--cs-blue-600)" : "transparent"}`,
              fontWeight: 800,
              fontSize: "1rem",
              color: activeTab === "description" ? "var(--cs-blue-600)" : "var(--cs-text-secondary)",
              cursor: "pointer"
            }}
          >
            Description & Features
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            style={{
              padding: "10px 4px",
              background: "none",
              border: "none",
              borderBottom: `3px solid ${activeTab === "specs" ? "var(--cs-blue-600)" : "transparent"}`,
              fontWeight: 800,
              fontSize: "1rem",
              color: activeTab === "specs" ? "var(--cs-blue-600)" : "var(--cs-text-secondary)",
              cursor: "pointer"
            }}
          >
            Technical Specifications
          </button>
        </div>

        {activeTab === "description" ? (
          <div style={{ lineHeight: 1.7, color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
            <p style={{ marginBottom: "16px" }}>
              The {product.name} from {media.brand} delivers industry-leading performance tailored for your home workstation, mobile lifestyle, and entertainment needs in Kigali, Rwanda.
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Carefully curated and verified by Cloud Sphere Solutions technical staff.</li>
              <li>Tested for durability, electrical safety, and performance standards.</li>
              <li>Backed by our local Kigali customer support team and certified repair partners.</li>
            </ul>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, width: "30%" }}>Brand</td>
                  <td>{media.brand}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>SKU</td>
                  <td>{product.sku}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Stock Availability</td>
                  <td>{product.stock} units currently stored in Kigali warehouse</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Returnable Policy</td>
                  <td>{product.is_returnable ? "Yes (Within 7 days of delivery)" : "No (Excluded from returns)"}</td>
                </tr>
                {media.specs && Object.entries(media.specs).map(([key, val]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 700 }}>{key}</td>
                    <td>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="section-header">
            <h3 className="section-title">You Might Also Need</h3>
          </div>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p.sku} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
