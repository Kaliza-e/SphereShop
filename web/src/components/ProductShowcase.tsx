import React from "react";

export function ProductShowcase() {
  return (
    <div className="product-showcase" aria-label="Curated SphereShop Products Showcase">
      <div className="showcase-inner">
        {/* Soft blue circular backdrop decoration */}
        <div className="showcase-circle-backdrop" aria-hidden="true" />

        {/* High-fidelity composed product scene */}
        <img
          src="/hero-showcase.png"
          alt="Curated SphereShop products: branded shopping bag, premium black headphones, white sneaker, wristwatch, insulated water bottle, and indoor plant"
          className="showcase-image"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
