import { Router, Response } from "express";
import { memoryDb } from "../db";
import { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /products
router.get("/products", (req: AuthenticatedRequest, res: Response) => {
  const { q, category, minPrice, maxPrice, sort, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10) || 1;
  const pageSize = 12;

  const isAdmin = req.user && req.user.role === "ADMIN";
  let items = Array.from(memoryDb.products.values());

  // Filter published only for visitors/shoppers
  if (!isAdmin) {
    items = items.filter(p => p.status === "PUBLISHED");
  }

  // Search filter
  if (q && (q as string).trim()) {
    const queryStr = (q as string).trim().toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(queryStr) || p.sku.toLowerCase().includes(queryStr));
  }

  // Category filter
  if (category && (category as string).trim()) {
    const catStr = (category as string).trim();
    const cat = Array.from(memoryDb.categories.values()).find(c => c.slug === catStr || c.id === catStr);
    if (cat) {
      items = items.filter(p => p.category_id === cat.id);
    }
  }

  // Price range filters
  if (minPrice) {
    const minP = parseInt(minPrice as string, 10);
    if (!isNaN(minP)) {
      items = items.filter(p => p.price >= minP);
    }
  }

  if (maxPrice) {
    const maxP = parseInt(maxPrice as string, 10);
    if (!isNaN(maxP)) {
      items = items.filter(p => p.price <= maxP);
    }
  }

  // Sort
  if (sort === "price_asc") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    items.sort((a, b) => b.price - a.price);
  } else {
    // Newest
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (pageNum - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize).map(p => ({
    ...p,
    stockBadge: p.stock > 5 ? "In stock" : p.stock > 0 ? "Low stock" : "Out of stock"
  }));

  res.json({
    items: paginatedItems,
    pagination: {
      page: pageNum,
      pageSize,
      totalItems,
      totalPages
    },
    message: totalItems === 0 ? "No products match your search" : undefined
  });
});

// GET /products/:skuOrId
router.get("/products/:skuOrId", (req: AuthenticatedRequest, res: Response) => {
  const { skuOrId } = req.params;
  const isAdmin = req.user && req.user.role === "ADMIN";

  const product = Array.from(memoryDb.products.values()).find(p => p.sku === skuOrId || p.id === skuOrId);

  if (!product || (!isAdmin && product.status !== "PUBLISHED")) {
    return res.status(404).json({
      error: {
        code: "PRODUCT_NOT_FOUND",
        message: "Product not found",
        referenceId: `REF-${Date.now()}`
      }
    });
  }

  const stockBadge = product.stock > 5 ? "In stock" : product.stock > 0 ? "Low stock" : "Out of stock";

  res.json({
    product: {
      ...product,
      stockBadge,
      addToCartDisabled: product.stock <= 0
    }
  });
});

// GET /categories
router.get("/categories", (_req: AuthenticatedRequest, res: Response) => {
  const categories = Array.from(memoryDb.categories.values());
  res.json({ categories });
});

export default router;
