import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Headphones,
  Smartphone,
  Briefcase,
  Zap,
  Laptop,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Product, Category } from "../types";
import { apiRequest } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { HeroSection } from "../components/HeroSection";
import { BenefitsSection } from "../components/BenefitsSection";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiRequest("/products?pageSize=8"),
          apiRequest("/categories").catch(() => ({ categories: [] })),
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
    laptops: Laptop,
  };

  return (
    <div className="homepage-container">
      {/* 1. Main Hero Section (Spacious two-column composition with product arrangement) */}
      <HeroSection />

      {/* 2. Four-Feature Benefits Section (Full-width white section directly beneath hero) */}
      <BenefitsSection />

      {/* 3. Curated Storefront Content Container */}
      <div className="homepage-content-wrapper">
        {/* Shop by Category */}
        <section className="home-section" aria-label="Shop by Category">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">
                Explore our curated tech catalog tailored for modern life in Kigali
              </p>
            </div>
            <Link to="/products" className="section-link">
              <span>View all categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.length > 0
              ? categories.map((cat) => {
                  const Icon = categoryIcons[cat.slug] || Smartphone;
                  return (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
                      className="category-card"
                    >
                      <div className="category-icon-wrapper">
                        <Icon size={24} color="#3B5AF4" />
                      </div>
                      <span className="category-name">{cat.name}</span>
                    </Link>
                  );
                })
              : [
                  { name: "Audio Gear", slug: "audio", icon: Headphones },
                  { name: "Accessories", slug: "accessories", icon: Smartphone },
                  { name: "Home & Office", slug: "home-office", icon: Briefcase },
                  { name: "Power & Cables", slug: "power", icon: Zap },
                  { name: "Laptops & Computing", slug: "laptops", icon: Laptop },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="category-card"
                    >
                      <div className="category-icon-wrapper">
                        <Icon size={24} color="#3B5AF4" />
                      </div>
                      <span className="category-name">{cat.name}</span>
                    </Link>
                  );
                })}
          </div>
        </section>

        {/* Featured Products */}
        <section className="home-section" aria-label="Featured Products">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">
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
                <div key={i} className="product-skeleton-card card">
                  <div className="skeleton" style={{ width: "100%", height: "200px", borderRadius: "10px", marginBottom: "14px" }} />
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

        {/* Technician Setup Service Highlight Banner */}
        <section className="setup-service-banner" aria-label="Technician Device Setup Service">
          <div className="setup-banner-content">
            <div className="setup-badge">
              <Calendar size={14} />
              <span>Kigali Certified Setup Service</span>
            </div>
            <h3 className="setup-title">
              Need help configuring your home or office workstation?
            </h3>
            <p className="setup-desc">
              Our certified technicians visit your location anywhere in Kigali (Mon–Sat, 09:00–17:00). We mount monitors, wire peripherals, configure Wi-Fi mesh routers, and optimize your workstation with full warranty.
            </p>
            <div className="setup-actions">
              <Link to="/book" className="btn btn-blue" id="book-setup-btn">
                <span>Book a 1-Hour Setup Visit (15,000 RWF)</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="setup-banner-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80"
              alt="Certified Technician configuring computer setup in Kigali"
              className="setup-banner-image"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
