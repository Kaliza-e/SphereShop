import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Calendar,
  Sparkles,
  Laptop,
  Smartphone,
  Zap,
  Briefcase
} from "lucide-react";
import { Product, Category } from "../types";
import { apiRequest } from "../services/api";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiRequest("/products?pageSize=8"),
          apiRequest("/categories").catch(() => ({ categories: [] }))
        ]);

        if (prodRes?.items) {
          setFeaturedProducts(prodRes.items.slice(0, 8));
        }
        if (catRes?.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categoryIcons: Record<string, any> = {
    audio: Headphones,
    accessories: Smartphone,
    "home-office": Briefcase,
    power: Zap,
    laptops: Laptop
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-card">
        <div className="hero-text">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(6, 182, 212, 0.2)", color: "#06B6D4", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "14px", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
            <Sparkles size={14} />
            <span>Kigali's Premier Tech Destination</span>
          </div>
          <h1 className="hero-title">
            Tech that <br />
            <span style={{ color: "#06B6D4" }}>fits your world</span>
          </h1>
          <p className="hero-subtitle">
            Quality electronics accessories, audio gear, and home-office essentials delivered straight to your door across Kigali, Rwanda.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: "12px 24px" }}>
              <span>Shop Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/book" className="btn btn-secondary" style={{ padding: "12px 20px", background: "rgba(255, 255, 255, 0.1)", color: "#FFFFFF", borderColor: "rgba(255, 255, 255, 0.2)" }}>
              <Calendar size={18} />
              <span>Book Setup Visit</span>
            </Link>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80"
            alt="Modern Tech Lifestyle Workspace in Kigali"
            className="hero-image"
          />
        </div>
      </div>

      {/* Trust Feature Pills */}
      <div className="feature-row">
        <div className="feature-pill">
          <div className="feature-icon-wrap">
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Fast Delivery</div>
            <div style={{ color: "var(--cs-text-secondary)", fontSize: "0.8rem" }}>Across Gasabo, Kicukiro & Nyarugenge</div>
          </div>
        </div>

        <div className="feature-pill">
          <div className="feature-icon-wrap" style={{ background: "var(--cs-emerald-50)", color: "var(--cs-emerald-500)" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Secure Payments</div>
            <div style={{ color: "var(--cs-text-secondary)", fontSize: "0.8rem" }}>MTN MoMo, Airtel Money & Card</div>
          </div>
        </div>

        <div className="feature-pill">
          <div className="feature-icon-wrap" style={{ background: "var(--cs-orange-50)", color: "var(--cs-orange-500)" }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>On-Site Setup Visits</div>
            <div style={{ color: "var(--cs-text-secondary)", fontSize: "0.8rem" }}>Expert technician home/office setup</div>
          </div>
        </div>
      </div>

      {/* Shop by Category */}
      <section style={{ marginBottom: "36px" }}>
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="section-link">
            <span>View all</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Smartphone;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                className="category-card"
              >
                <div className="category-icon">
                  <Icon size={24} />
                </div>
                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ marginBottom: "36px" }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.875rem" }}>
              Authentic electronics and verified accessories ready for instant dispatch
            </p>
          </div>
          <Link to="/products" className="section-link">
            <span>View all products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="products-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" style={{ height: "320px" }}>
                <div className="skeleton" style={{ width: "100%", height: "180px", marginBottom: "14px" }} />
                <div className="skeleton" style={{ width: "60%", height: "18px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ width: "40%", height: "24px" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product.sku} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Device Setup Service Highlight Banner */}
      <section className="card" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)", border: "1px solid #BFDBFE", padding: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ maxWidth: "600px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#DBEAFE", color: "#1D4ED8", padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "10px" }}>
            <Calendar size={13} />
            <span>Kigali Certified Setup</span>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--cs-navy-900)", marginBottom: "8px" }}>
            Need help configuring your home or office setup?
          </h3>
          <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem", marginBottom: "18px" }}>
            Our certified technician visits your location anywhere in Kigali (Mon–Sat, 09:00–17:00). We mount monitors, wire peripherals, configure Wi-Fi mesh, and optimize your workstation.
          </p>
          <Link to="/book" className="btn btn-blue">
            <span>Book a 1-Hour Setup Visit (15,000 RWF)</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"
          alt="Technician Device Setup Visit"
          style={{ width: "240px", height: "160px", objectFit: "cover", borderRadius: "var(--cs-radius-md)", boxShadow: "var(--cs-shadow-md)" }}
        />
      </section>
    </div>
  );
}
