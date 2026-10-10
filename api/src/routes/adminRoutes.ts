import { Router, Response } from "express";
import { memoryDb } from "../db";
import { AuthenticatedRequest, requireRole } from "../middleware/auth";
import { redactSensitiveData } from "../middleware/logger";

const router = Router();

// GET /admin/products
router.get("/admin/products", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const products = Array.from(memoryDb.products.values());
  res.json({ products });
});

// POST /admin/products
router.post("/admin/products", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { sku, name, description, price, stock, categoryId, isReturnable = true, status = "DRAFT" } = req.body;

  if (!sku || !sku.trim()) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "SKU is required" } });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Name is required" } });
  }

  const pPrice = parseInt(price, 10);
  if (isNaN(pPrice) || pPrice <= 0) {
    return res.status(400).json({ error: { code: "INVALID_PRICE", message: "Price must be a positive integer" } });
  }

  const pStock = parseInt(stock, 10);
  if (isNaN(pStock) || pStock < 0) {
    return res.status(400).json({ error: { code: "INVALID_STOCK", message: "Stock cannot be negative" } });
  }

  const existingSku = Array.from(memoryDb.products.values()).find(p => p.sku.toUpperCase() === sku.trim().toUpperCase());
  if (existingSku) {
    return res.status(400).json({ error: { code: "DUPLICATE_SKU", message: `Product with SKU '${sku}' already exists` } });
  }

  const prodId = `prod-${Date.now()}`;
  const newProduct = {
    id: prodId,
    sku: sku.trim().toUpperCase(),
    name: name.trim(),
    description: description || "",
    price: pPrice,
    stock: pStock,
    category_id: categoryId || "cat-acc",
    is_returnable: isReturnable === "true" || isReturnable === true,
    status: status.toUpperCase(),
    created_at: new Date()
  };

  memoryDb.products.set(prodId, newProduct);
  res.status(201).json({ message: "Product created successfully", product: newProduct });
});

// PATCH/PUT /admin/products/:id
router.patch("/admin/products/:id", requireRole("ADMIN"), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = memoryDb.products.get(id) || Array.from(memoryDb.products.values()).find(p => p.sku === id);

  if (!product) {
    return res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
  }

  const { sku, name, description, price, stock, categoryId, isReturnable, status } = req.body;

  // SKU is immutable after first publish!
  if (sku && sku.trim().toUpperCase() !== product.sku) {
    if (product.status === "PUBLISHED") {
      return res.status(400).json({ error: { code: "SKU_IMMUTABLE", message: "SKU is immutable after product has been published" } });
    }
  }

  if (price !== undefined) {
    const pPrice = parseInt(price, 10);
    if (isNaN(pPrice) || pPrice <= 0) {
      return res.status(400).json({ error: { code: "INVALID_PRICE", message: "Price must be a positive integer" } });
    }
    product.price = pPrice;
  }

  if (stock !== undefined) {
    const pStock = parseInt(stock, 10);
    if (isNaN(pStock) || pStock < 0) {
      return res.status(400).json({ error: { code: "INVALID_STOCK", message: "Stock cannot be negative" } });
    }
    product.stock = pStock;
  }

  if (name) product.name = name.trim();
  if (description !== undefined) product.description = description;
  if (categoryId) product.category_id = categoryId;
  if (isReturnable !== undefined) product.is_returnable = isReturnable === true || isReturnable === "true";
  if (status) product.status = status.toUpperCase();

  res.json({ message: "Product updated successfully", product });
});

// GET /admin/audit
router.get("/admin/audit", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const auditList = Array.from(memoryDb.auditEvents.values()).map(a => redactSensitiveData(a));
  res.json({ auditEvents: auditList });
});

// GET /admin/alerts
router.get("/admin/alerts", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const alerts = Array.from(memoryDb.opsAlerts.values());
  res.json({ alerts });
});

// GET /admin/payouts
router.get("/admin/payouts", requireRole("ADMIN"), (_req: AuthenticatedRequest, res: Response) => {
  const failedRefunds = Array.from(memoryDb.returns.values()).filter(r => r.refund_status === "REFUND_FAILED");
  res.json({ payoutTasks: failedRefunds });
});

export default router;
