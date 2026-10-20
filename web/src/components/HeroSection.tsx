import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductShowcase } from "./ProductShowcase";

export function HeroSection() {
  return (
    <section className="hero-section" aria-label="Hero Introduction">
      <div className="hero-container">
        {/* Left Column: Marketing Copy */}
        <div className="hero-copy-col">
          <div className="hero-eyebrow">SHOP SMART. LIVE BETTER.</div>

          <h1 className="hero-headline">
            Welcome to <br />
            <span className="hero-brand-name">
              <span className="hero-brand-navy">Sphere</span>
              <span className="hero-brand-blue">Shop</span>
            </span>
          </h1>

          <p className="hero-subtext">
            Discover a world of quality products, great prices, and a seamless
            shopping experience — all in one place.
          </p>

          <div className="hero-actions">
            <Link
              to="/products"
              className="hero-cta-btn"
              id="hero-shop-now-btn"
            >
              <span>Shop Now</span>
              <ArrowRight size={18} className="hero-btn-arrow" />
            </Link>
          </div>
        </div>

        {/* Right Column: High-Fidelity Product Composition */}
        <div className="hero-media-col">
          <ProductShowcase />
        </div>
      </div>
    </section>
  );
}
