import bcrypt from "bcryptjs";
import { memoryDb } from "./index";

export async function seedData() {
  memoryDb.reset();

  const passwordHash = await bcrypt.hash("Kigali2026", 10);
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + 15 * 60 * 1000);

  // Users
  const userAline = {
    id: "usr-aline",
    name: "Aline",
    email: "aline@spheretest.rw",
    phone: "0781000001",
    password_hash: passwordHash,
    role: "SHOPPER",
    failed_attempts: 0,
    locked_until: null,
    created_at: now
  };

  const userEric = {
    id: "usr-eric",
    name: "Eric",
    email: "eric@spheretest.rw",
    phone: "0791000002",
    password_hash: passwordHash,
    role: "SHOPPER",
    failed_attempts: 0,
    locked_until: null,
    created_at: now
  };

  const userLocked = {
    id: "usr-locked",
    name: "Locked User",
    email: "locked@spheretest.rw",
    phone: "0721000003",
    password_hash: passwordHash,
    role: "SHOPPER",
    failed_attempts: 5,
    locked_until: lockedUntil,
    created_at: now
  };

  const userAdmin = {
    id: "usr-admin",
    name: "Ops Admin",
    email: "ops@spheretest.rw",
    phone: "0788000000",
    password_hash: passwordHash,
    role: "ADMIN",
    failed_attempts: 0,
    locked_until: null,
    created_at: now
  };

  const userAgent = {
    id: "usr-agent",
    name: "Delivery Agent",
    email: "agent@spheretest.rw",
    phone: "0789000000",
    password_hash: passwordHash,
    role: "AGENT",
    failed_attempts: 0,
    locked_until: null,
    created_at: now
  };

  [userAline, userEric, userLocked, userAdmin, userAgent].forEach(u => {
    memoryDb.users.set(u.id, u);
  });

  // Categories
  const catAudio = { id: "cat-audio", name: "Audio & Headphones", slug: "audio" };
  const catAccessories = { id: "cat-acc", name: "Accessories & Cables", slug: "accessories" };
  const catHomeOffice = { id: "cat-office", name: "Home Office & Desk", slug: "home-office" };
  const catPower = { id: "cat-power", name: "Power & Chargers", slug: "power" };

  [catAudio, catAccessories, catHomeOffice, catPower].forEach(c => memoryDb.categories.set(c.id, c));

  // Products
  const seedProducts = [
    { id: "prod-1", sku: "HDP-01", name: "Wireless Headphones", description: "High quality Bluetooth wireless headphones", price: 12000, stock: 30, category_id: "cat-audio", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-2", sku: "CASE-02", name: "Phone Case", description: "Durable silicone protective case", price: 3500, stock: 100, category_id: "cat-acc", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-3", sku: "LAMP-03", name: "Desk Lamp", description: "LED eye-care adjustable desk lamp", price: 18000, stock: 10, category_id: "cat-office", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-4", sku: "CABLE-04", name: "USB-C Cable", description: "Fast charging 2m USB-C cable", price: 2500, stock: 200, category_id: "cat-acc", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-5", sku: "LOW-05", name: "Power Bank", description: "10,000mAh portable power bank", price: 25000, stock: 3, category_id: "cat-power", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-6", sku: "GIFT-08", name: "Gift Voucher", description: "Store digital gift voucher 10,000 RWF", price: 10000, stock: 50, category_id: "cat-acc", is_returnable: false, status: "PUBLISHED" },
    { id: "prod-7", sku: "OOS-09", name: "Phone Stand", description: "Aluminium foldable desktop phone stand", price: 5000, stock: 0, category_id: "cat-acc", is_returnable: true, status: "PUBLISHED" },
    { id: "prod-8", sku: "DRAFT-07", name: "Prototype Smartwatch", description: "Unreleased prototype product", price: 15000, stock: 10, category_id: "cat-audio", is_returnable: true, status: "DRAFT" }
  ];

  // Extra products for pagination test (total 25+ products)
  for (let i = 10; i <= 30; i++) {
    const sku = `EXTRA-${i}`;
    seedProducts.push({
      id: `prod-extra-${i}`,
      sku,
      name: `Product ${i} Accessory`,
      description: `Description for extra product ${i}`,
      price: 4000 + i * 500,
      stock: 20,
      category_id: i % 2 === 0 ? "cat-acc" : "cat-office",
      is_returnable: true,
      status: "PUBLISHED"
    });
  }

  seedProducts.forEach(p => memoryDb.products.set(p.id, { ...p, created_at: now }));

  // Coupons
  const coupons = [
    { id: "c1", code: "WELCOME10", percent: 10, min_subtotal: 20000, max_discount: 5000, active: true, expires_at: null },
    { id: "c2", code: "ABC123", percent: 5, min_subtotal: 0, max_discount: 2000, active: true, expires_at: null },
    { id: "c3", code: "MAXCODE12345", percent: 5, min_subtotal: 0, max_discount: 2000, active: true, expires_at: null },
    { id: "c4", code: "OLD2025", percent: 10, min_subtotal: 0, max_discount: 5000, active: false, expires_at: new Date("2025-12-31T23:59:59Z") }
  ];

  coupons.forEach(c => memoryDb.coupons.set(c.id, c));

  // Services
  const svc = {
    id: "svc-setup",
    code: "SVC-SETUP",
    name: "Device Setup Visit",
    duration_min: 60,
    price: 15000,
    capacity_per_slot: 2
  };
  memoryDb.services.set(svc.id, svc);

  // Seed 5 DELIVERED orders for Eric (so Eric has >= 5 DELIVERED orders and is loyal)
  for (let i = 1; i <= 5; i++) {
    const ordId = `ord-eric-${i}`;
    const orderNum = `SS-20261001-000${i}`;
    memoryDb.orders.set(ordId, {
      id: ordId,
      order_number: orderNum,
      shopper_id: userEric.id,
      status: "DELIVERED",
      subtotal: 12000,
      line_discount: 0,
      net: 12000,
      coupon_code: null,
      coupon_discount: 0,
      net_after_coupon: 12000,
      delivery_method: "STANDARD",
      delivery_fee: 0,
      delivery_district: "Gasabo",
      delivery_address: "KG 123 St, Kigali",
      total: 12000,
      idempotency_key: `key-eric-${i}`,
      created_at: new Date(now.getTime() - i * 86400000)
    });
    memoryDb.orderLines.set(`ol-eric-${i}`, {
      id: `ol-eric-${i}`,
      order_id: ordId,
      product_id: "prod-1",
      sku: "HDP-01",
      product_name: "Wireless Headphones",
      unit_price: 12000,
      quantity: 1,
      line_total: 12000,
      is_faulty: false
    });
  }

  // Seed helper order fixtures for UAT tests:
  // 1. Order in PAID
  memoryDb.orders.set("ord-paid-1", {
    id: "ord-paid-1",
    order_number: "SS-20261010-0100",
    shopper_id: userAline.id,
    status: "PAID",
    subtotal: 12000,
    line_discount: 0,
    net: 12000,
    coupon_code: null,
    coupon_discount: 0,
    net_after_coupon: 12000,
    delivery_method: "STANDARD",
    delivery_fee: 1500,
    delivery_district: "Gasabo",
    delivery_address: "KG 500 St",
    total: 13500,
    created_at: now
  });

  // 2. Order DELIVERED 2 days ago (returnable HDP-01)
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
  memoryDb.orders.set("ord-deliv-2days", {
    id: "ord-deliv-2days",
    order_number: "SS-20261008-0101",
    shopper_id: userAline.id,
    status: "DELIVERED",
    subtotal: 12000,
    line_discount: 0,
    net: 12000,
    coupon_code: null,
    coupon_discount: 0,
    net_after_coupon: 12000,
    delivery_method: "STANDARD",
    delivery_fee: 1500,
    delivery_district: "Kicukiro",
    delivery_address: "KK 15 Ave",
    total: 13500,
    created_at: twoDaysAgo
  });
  memoryDb.orderLines.set("ol-deliv-2days-1", {
    id: "ol-deliv-2days-1",
    order_id: "ord-deliv-2days",
    product_id: "prod-1",
    sku: "HDP-01",
    product_name: "Wireless Headphones",
    unit_price: 12000,
    quantity: 1,
    line_total: 12000,
    is_faulty: false
  });
  memoryDb.deliveries.set("deliv-2days", {
    id: "deliv-2days",
    order_id: "ord-deliv-2days",
    agent_id: userAgent.id,
    code_hash: "$2a$10$xyz",
    attempts: 0,
    locked: false,
    delivered_at: twoDaysAgo
  });

  // 3. Order DELIVERED 8 days ago (expired return window)
  const eightDaysAgo = new Date(now.getTime() - 8 * 86400000);
  memoryDb.orders.set("ord-deliv-8days", {
    id: "ord-deliv-8days",
    order_number: "SS-20261002-0102",
    shopper_id: userAline.id,
    status: "DELIVERED",
    subtotal: 12000,
    line_discount: 0,
    net: 12000,
    coupon_code: null,
    coupon_discount: 0,
    net_after_coupon: 12000,
    delivery_method: "STANDARD",
    delivery_fee: 1500,
    delivery_district: "Gasabo",
    delivery_address: "KG 5 Ave",
    total: 13500,
    created_at: eightDaysAgo
  });
  memoryDb.orderLines.set("ol-deliv-8days-1", {
    id: "ol-deliv-8days-1",
    order_id: "ord-deliv-8days",
    product_id: "prod-1",
    sku: "HDP-01",
    product_name: "Wireless Headphones",
    unit_price: 12000,
    quantity: 1,
    line_total: 12000,
    is_faulty: false
  });
  memoryDb.deliveries.set("deliv-8days", {
    id: "deliv-8days",
    order_id: "ord-deliv-8days",
    agent_id: userAgent.id,
    code_hash: "$2a$10$xyz",
    attempts: 0,
    locked: false,
    delivered_at: eightDaysAgo
  });

  // 4. Order DELIVERED containing non-returnable GIFT-08
  memoryDb.orders.set("ord-deliv-gift", {
    id: "ord-deliv-gift",
    order_number: "SS-20261009-0103",
    shopper_id: userAline.id,
    status: "DELIVERED",
    subtotal: 10000,
    line_discount: 0,
    net: 10000,
    coupon_code: null,
    coupon_discount: 0,
    net_after_coupon: 10000,
    delivery_method: "STANDARD",
    delivery_fee: 1500,
    delivery_district: "Gasabo",
    delivery_address: "KG 9 Ave",
    total: 11500,
    created_at: twoDaysAgo
  });
  memoryDb.orderLines.set("ol-deliv-gift-1", {
    id: "ol-deliv-gift-1",
    order_id: "ord-deliv-gift",
    product_id: "prod-6",
    sku: "GIFT-08",
    product_name: "Gift Voucher",
    unit_price: 10000,
    quantity: 1,
    line_total: 10000,
    is_faulty: false
  });

  // 5. Seed 12 orders for Aline for ORD-002 pagination test
  for (let i = 1; i <= 12; i++) {
    const ordId = `ord-aline-p${i}`;
    memoryDb.orders.set(ordId, {
      id: ordId,
      order_number: `SS-20260901-${100 + i}`,
      shopper_id: userAline.id,
      status: "DELIVERED",
      subtotal: 12000,
      line_discount: 0,
      net: 12000,
      coupon_code: null,
      coupon_discount: 0,
      net_after_coupon: 12000,
      delivery_method: "STANDARD",
      delivery_fee: 1500,
      delivery_district: "Gasabo",
      delivery_address: "KG 100 St",
      total: 13500,
      created_at: new Date(now.getTime() - (100 + i) * 3600000)
    });
  }
}
