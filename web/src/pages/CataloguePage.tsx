import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Product, Category } from "../types";
import { apiRequest } from "../services/api";
import { ProductCard } from "../components/ProductCard";

export function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0, pageSize: 12 });
  const [loading, setLoading] = useState(true);
  const [emptyMsg, setEmptyMsg] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Query state from searchParams
  const queryQ = searchParams.get("q") || "";
  const queryCat = searchParams.get("category") || "";
  const queryMinPrice = searchParams.get("minPrice") || "";
  const queryMaxPrice = searchParams.get("maxPrice") || "";
  const querySort = searchParams.get("sort") || "newest";
  const queryPage = searchParams.get("page") || "1";

  // Local search input
  const [searchInput, setSearchInput] = useState(queryQ);

  useEffect(() => {
    setSearchInput(queryQ);
  }, [queryQ]);

  // Load categories
  useEffect(() => {
    apiRequest("/categories")
      .then((res) => {
        if (res?.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Load products whenever searchParams change
  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryQ) params.set("q", queryQ);
      if (queryCat) params.set("category", queryCat);
      if (queryMinPrice) params.set("minPrice", queryMinPrice);
      if (queryMaxPrice) params.set("maxPrice", queryMaxPrice);
      if (querySort) params.set("sort", querySort);
      if (queryPage) params.set("page", queryPage);

      const data = await apiRequest(`/products?${params.toString()}`);
      setProducts(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, totalItems: 0, pageSize: 12 });
      setEmptyMsg(data.message || (data.items?.length === 0 ? "No products match your search" : ""));
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
      setEmptyMsg("Unable to load catalogue. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1"); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const handlePriceRangeSelect = (min: string, max: string) => {
    const next = new URLSearchParams(searchParams);
    if (min) next.set("minPrice", min);
    else next.delete("minPrice");

    if (max) next.set("maxPrice", max);
    else next.delete("maxPrice");

    next.set("page", "1");
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filterSidebar = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Category filter */}
      <div>
        <h4 style={{ fontSize: "0.875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--cs-text-secondary)", marginBottom: "12px" }}>
          Category
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer", fontWeight: !queryCat ? 700 : 500 }}>
            <input
              type="radio"
              name="cat-radio"
              checked={!queryCat}
              onChange={() => updateParam("category", "")}
            />
            <span>All Categories</span>
          </label>
          {categories.map((c) => (
            <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer", fontWeight: queryCat === c.slug || queryCat === c.id ? 700 : 500 }}>
              <input
                type="radio"
                name="cat-radio"
                checked={queryCat === c.slug || queryCat === c.id}
                onChange={() => updateParam("category", c.slug || c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 style={{ fontSize: "0.875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--cs-text-secondary)", marginBottom: "12px" }}>
          Price Range (RWF)
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price-radio"
              checked={!queryMinPrice && !queryMaxPrice}
              onChange={() => handlePriceRangeSelect("", "")}
            />
            <span>Any Price</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price-radio"
              checked={queryMinPrice === "0" && queryMaxPrice === "5000"}
              onChange={() => handlePriceRangeSelect("0", "5000")}
            />
            <span>Under 5,000 RWF</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price-radio"
              checked={queryMinPrice === "5000" && queryMaxPrice === "20000"}
              onChange={() => handlePriceRangeSelect("5000", "20000")}
            />
            <span>5,000 - 20,000 RWF</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price-radio"
              checked={queryMinPrice === "20000" && queryMaxPrice === "50000"}
              onChange={() => handlePriceRangeSelect("20000", "50000")}
            />
            <span>20,000 - 50,000 RWF</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
            <input
              type="radio"
              name="price-radio"
              checked={queryMinPrice === "50000" && !queryMaxPrice}
              onChange={() => handlePriceRangeSelect("50000", "")}
            />
            <span>50,000+ RWF</span>
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(queryQ || queryCat || queryMinPrice || queryMaxPrice || querySort !== "newest") && (
        <button
          onClick={handleResetFilters}
          className="btn btn-secondary btn-full"
          style={{ fontSize: "0.85rem", padding: "8px" }}
        >
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
          All Products
        </h1>
        <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
          Discover verified electronics, accessories & home-office gear in Kigali.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: "220px", maxWidth: "420px", position: "relative" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            style={{ padding: "8px 14px 8px 38px", fontSize: "0.875rem" }}
            placeholder="Search by name or SKU (e.g. HDP-01)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-secondary lg:hidden"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--cs-text-secondary)", whiteSpace: "nowrap" }}>
              Sort by:
            </span>
            <select
              className="form-select"
              style={{ width: "auto", padding: "7px 12px", fontSize: "0.85rem" }}
              value={querySort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px", alignItems: "start" }}>
        {/* Desktop Filter Sidebar */}
        <aside className="card hidden lg:block" style={{ padding: "20px", position: "sticky", top: "96px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--cs-border)" }}>
            <Filter size={18} color="var(--cs-blue-600)" />
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>Filters</span>
          </div>
          {filterSidebar}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="modal-overlay" onClick={() => setMobileFilterOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "340px" }}>
              <div className="modal-header">
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Filter Products</div>
                <button onClick={() => setMobileFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {filterSidebar}
              </div>
              <div className="modal-footer">
                <button onClick={() => setMobileFilterOpen(false)} className="btn btn-primary btn-full">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Listing */}
        <div>
          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card" style={{ height: "300px" }}>
                  <div className="skeleton" style={{ width: "100%", height: "160px", marginBottom: "12px" }} />
                  <div className="skeleton" style={{ width: "60%", height: "18px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ width: "40%", height: "20px" }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#EFF6FF", color: "var(--cs-blue-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <Search size={32} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>{emptyMsg}</h3>
              <p style={{ color: "var(--cs-text-secondary)", maxWidth: "400px", margin: "0 auto 20px auto" }}>
                Try adjusting your search query, clearing your filters, or browsing other categories.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                <RotateCcw size={16} />
                <span>Show All Products</span>
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard key={p.id || p.sku} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn btn-secondary"
                    style={{ padding: "8px 12px" }}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span style={{ fontSize: "0.875rem", fontWeight: 700, padding: "0 12px", color: "var(--cs-text-secondary)" }}>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} items)
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn btn-secondary"
                    style={{ padding: "8px 12px" }}
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
