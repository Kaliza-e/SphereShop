import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { Product } from "../types";
import { getProductMedia, formatRWF } from "../data/productMedia";
import { useStore } from "../context/StoreContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [adding, setAdding] = useState(false);
  const media = getProductMedia(product.sku, product.category_id);
  const inWishlist = isInWishlist(product.sku);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      await addToCart(product.sku, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.sku);
  };

  return (
    <div className="product-card" id={`product-card-${product.sku}`}>
      <Link to={`/products/${product.sku}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="product-img-box">
          {/* Stock Badge */}
          {isOutOfStock ? (
            <span className="stock-badge badge-out-of-stock">Out of Stock</span>
          ) : isLowStock ? (
            <span className="stock-badge badge-low-stock">Low Stock ({product.stock})</span>
          ) : (
            <span className="stock-badge badge-in-stock">In Stock</span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`product-wishlist-btn ${inWishlist ? "active" : ""}`}
            aria-label="Add to Wishlist"
            title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart size={16} fill={inWishlist ? "var(--cs-rose-500)" : "none"} />
          </button>

          <img
            src={product.imageUrl || media.main}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
        </div>

        <div className="product-card-body">
          <div className="product-category-label">{media.brand}</div>
          <h3 className="product-title" title={product.name}>{product.name}</h3>

          <div className="product-rating">
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span>{media.rating}</span>
            <span style={{ color: "var(--cs-text-muted)", fontSize: "0.75rem" }}>({media.reviews})</span>
          </div>

          <div className="product-price">{formatRWF(product.price)}</div>

          <div className="product-card-footer">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="btn btn-primary btn-full"
              id={`add-to-cart-${product.sku}`}
            >
              <ShoppingBag size={16} />
              <span>{isOutOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to cart"}</span>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
