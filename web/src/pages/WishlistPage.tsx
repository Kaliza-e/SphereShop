import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Product } from "../types";
import { apiRequest } from "../services/api";
import { useStore } from "../context/StoreContext";
import { ProductCard } from "../components/ProductCard";

export function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const promises = wishlist.map((sku) =>
          apiRequest(`/products/${sku}`)
            .then((res) => res.product)
            .catch(() => null)
        );
        const resolved = await Promise.all(promises);
        setProducts(resolved.filter(Boolean));
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistProducts();
  }, [wishlist]);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          My Wishlist
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Products you saved for future purchases.
        </p>
      </div>

      {loading ? (
        <div className="products-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: "300px" }}>
              <div className="skeleton" style={{ width: "100%", height: "160px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "60%", height: "18px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "40%", height: "20px" }} />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 20px", maxWidth: "560px", margin: "40px auto" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "var(--cs-rose-50)", color: "var(--cs-rose-500)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <Heart size={32} />
          </div>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Your Wishlist is Empty</h3>
          <p style={{ color: "var(--cs-text-secondary)", marginBottom: "20px" }}>
            Explore our catalogue and click the heart icon on any product to save it here.
          </p>
          <Link to="/products" className="btn btn-primary">
            <span>Explore Catalogue</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
