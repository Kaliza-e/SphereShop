import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock
} from "lucide-react";
import { Product, Category } from "../../types";
import { apiRequest } from "../../services/api";
import { formatRWF, getProductMedia } from "../../data/productMedia";
import { useStore } from "../../context/StoreContext";

export function AdminProductsPage() {
  const { showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState("cat-acc");
  const [formReturnable, setFormReturnable] = useState(true);
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  useEffect(() => {
    loadProducts();
    apiRequest("/categories")
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      console.error("Load admin products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormSku("");
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormStock("");
    setFormCategory(categories[0]?.id || "cat-acc");
    setFormReturnable(true);
    setFormStatus("PUBLISHED");
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormDesc(p.description || "");
    setFormPrice(p.price.toString());
    setFormStock(p.stock.toString());
    setFormCategory(p.category_id);
    setFormReturnable(p.is_returnable);
    setFormStatus(p.status as any);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          sku: formSku.trim(),
          name: formName.trim(),
          description: formDesc.trim(),
          price: parseInt(formPrice, 10),
          stock: parseInt(formStock, 10),
          categoryId: formCategory,
          isReturnable: formReturnable,
          status: formStatus
        })
      });
      showToast("Product added to catalogue successfully!", "success");
      setIsAddModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to create product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);

    try {
      await apiRequest(`/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          sku: formSku.trim(),
          name: formName.trim(),
          description: formDesc.trim(),
          price: parseInt(formPrice, 10),
          stock: parseInt(formStock, 10),
          categoryId: formCategory,
          isReturnable: formReturnable,
          status: formStatus
        })
      });
      showToast("Product updated successfully!", "success");
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to update product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cs-text-primary)", marginBottom: "4px" }}>
            Catalogue Management
          </h1>
          <p style={{ color: "var(--cs-text-secondary)", fontSize: "0.95rem" }}>
            Manage inventory levels, prices, publication states, and return eligibility.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" id="add-product-btn">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: "14px 20px", marginBottom: "24px", maxWidth: "420px", position: "relative" }}>
        <Search size={16} className="search-icon" style={{ left: "16px" }} />
        <input
          type="text"
          className="search-input"
          style={{ paddingLeft: "38px" }}
          placeholder="Filter by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="data-table-container" style={{ border: "none", boxShadow: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Price (RWF)</th>
                <th>Inventory</th>
                <th>Stock Status</th>
                <th>Returnable</th>
                <th>Publication</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px" }}>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--cs-text-muted)" }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const media = getProductMedia(p.sku, p.category_id);
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={media.main}
                            alt={p.name}
                            style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "var(--cs-radius-sm)", border: "1px solid var(--cs-border)" }}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)" }}>SKU: {p.sku}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 700 }}>{formatRWF(p.price)}</td>

                      <td style={{ fontWeight: 800 }}>{p.stock} units</td>

                      <td>
                        {isOutOfStock ? (
                          <span className="stock-badge badge-out-of-stock" style={{ position: "static" }}>Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="stock-badge badge-low-stock" style={{ position: "static" }}>Low Stock</span>
                        ) : (
                          <span className="stock-badge badge-in-stock" style={{ position: "static" }}>In Stock</span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontSize: "0.85rem", color: p.is_returnable ? "var(--cs-emerald-700)" : "var(--cs-text-muted)", fontWeight: 600 }}>
                          {p.is_returnable ? "7-Day Returnable" : "Non-Returnable"}
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill ${p.status === "PUBLISHED" ? "status-delivered" : "status-cancelled"}`}>
                          {p.status}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          title="Edit product"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
              <div className="modal-body">
                {/* SKU (Note: SKU is immutable once published) */}
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label className="form-label">Product SKU (Unique identifier)</label>
                    {editingProduct && editingProduct.status === "PUBLISHED" && (
                      <span style={{ fontSize: "0.75rem", color: "var(--cs-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Lock size={12} />
                        <span>Immutable after publish</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={formSku}
                    disabled={editingProduct?.status === "PUBLISHED"}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. HEADPHONE-05"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ergonomic Desk Arm Stand"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Product details and specifications..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Price in RWF (Positive Integer)</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 15000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Units (≥ 0)</label>
                    <input
                      type="number"
                      min={0}
                      className="form-input"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="e.g. 25"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "24px", margin: "14px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formReturnable}
                      onChange={(e) => setFormReturnable(e.target.checked)}
                    />
                    <span>7-Day Returnable</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formStatus === "PUBLISHED"}
                      onChange={(e) => setFormStatus(e.target.checked ? "PUBLISHED" : "DRAFT")}
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
