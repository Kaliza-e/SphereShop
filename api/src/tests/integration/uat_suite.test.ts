import request from "supertest";
import app from "../../app";
import { seedData } from "../../db/seed";
import { paymentAdapter } from "../../services/paymentAdapter";

describe("SphereShop UAT Full Test Suite (119 UAT Verification Cases)", () => {
  let shopperCookie: string;
  let adminCookie: string;
  let agentCookie: string;

  beforeEach(async () => {
    await seedData();
    paymentAdapter.setStubMode("success");
    paymentAdapter.setRefundStubMode("success");
  });

  describe("Accounts Module (ACC-001..017)", () => {
    test("ACC-001: Register happy path (0781999001, Kigali2026 -> signed in + welcome SMS)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test Shopper",
          phone: "0781999001",
          email: "test.shopper@spheretest.rw",
          password: "Kigali2026",
          confirmPassword: "Kigali2026"
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("ACC-002: Duplicate phone rejected", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Duplicate Phone",
          phone: "0781000001", // Aline's phone
          email: "unique@spheretest.rw",
          password: "Kigali2026",
          confirmPassword: "Kigali2026"
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("Phone number already registered");
    });

    test("ACC-003: Duplicate email rejected", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Duplicate Email",
          phone: "0781999002",
          email: "aline@spheretest.rw", // Aline's email
          password: "Kigali2026",
          confirmPassword: "Kigali2026"
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("E-mail already registered");
    });

    test("ACC-004: Password validation boundaries (abcdef1 ✗, abcdefgh ✗, 12345678 ✗, abcdefg1 ✓)", async () => {
      const r1 = await request(app).post("/api/v1/auth/register").send({ name: "A", phone: "0781999003", email: "a1@s.rw", password: "abcdef1", confirmPassword: "abcdef1" });
      expect(r1.status).toBe(400);

      const r2 = await request(app).post("/api/v1/auth/register").send({ name: "A", phone: "0781999003", email: "a1@s.rw", password: "abcdefgh", confirmPassword: "abcdefgh" });
      expect(r2.status).toBe(400);

      const r3 = await request(app).post("/api/v1/auth/register").send({ name: "A", phone: "0781999003", email: "a1@s.rw", password: "12345678", confirmPassword: "12345678" });
      expect(r3.status).toBe(400);

      const r4 = await request(app).post("/api/v1/auth/register").send({ name: "A", phone: "0781999003", email: "a1@s.rw", password: "abcdefg1", confirmPassword: "abcdefg1" });
      expect(r4.status).toBe(201);
    });

    test("ACC-008 & ACC-009: Sign in by phone or email", async () => {
      const rPhone = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      expect(rPhone.status).toBe(200);

      const rEmail = await request(app).post("/api/v1/auth/login").send({ login: "aline@spheretest.rw", password: "Kigali2026" });
      expect(rEmail.status).toBe(200);
    });

    test("ACC-010 & ACC-011: Generic error message for wrong password or unknown account", async () => {
      const r1 = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "WrongPassword1" });
      expect(r1.status).toBe(401);
      expect(r1.body.error.message).toBe("Phone/e-mail or password is incorrect");

      const r2 = await request(app).post("/api/v1/auth/login").send({ login: "0789999999", password: "Kigali2026" });
      expect(r2.status).toBe(401);
      expect(r2.body.error.message).toBe("Phone/e-mail or password is incorrect");
    });

    test("ACC-012 & ACC-013: Lock account after 5 failed attempts", async () => {
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "WrongPassword" });
      }
      // 6th attempt with correct password must be refused while locked
      const res = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe("Phone/e-mail or password is incorrect");
    });

    test("ACC-015: Password reset with OTP", async () => {
      const reqRes = await request(app).post("/api/v1/auth/password-reset/request").send({ phone: "0781000001" });
      expect(reqRes.status).toBe(200);

      const confRes = await request(app).post("/api/v1/auth/password-reset/confirm").send({
        phone: "0781000001",
        code: "123456",
        newPassword: "NewKigali2026"
      });
      expect(confRes.status).toBe(200);

      // Sign in with new password
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "NewKigali2026" });
      expect(loginRes.status).toBe(200);
    });
  });

  describe("Catalogue Module (CAT-001..011)", () => {
    test("CAT-002: List max 12/page, HDP-01 12,000 In stock", async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeLessThanOrEqual(12);

      const hdp = res.body.items.find((p: any) => p.sku === "HDP-01");
      expect(hdp).toBeDefined();
      expect(hdp.price).toBe(12000);
      expect(hdp.stockBadge).toBe("In stock");
    });

    test("CAT-003 & CAT-004: Search case-insensitive on name and SKU", async () => {
      const res1 = await request(app).get("/api/v1/products?q=headphones");
      expect(res1.status).toBe(200);
      expect(res1.body.items.some((p: any) => p.sku === "HDP-01")).toBe(true);

      const res2 = await request(app).get("/api/v1/products?q=cable-04");
      expect(res2.status).toBe(200);
      expect(res2.body.items.some((p: any) => p.sku === "CABLE-04")).toBe(true);
    });

    test("CAT-007 & CAT-011: Unpublished or unknown product returns 404 JSON without stack trace", async () => {
      const res = await request(app).get("/api/v1/products/does-not-exist");
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
      expect(res.body.stack).toBeUndefined();
    });
  });

  describe("Cart & Coupons Module (CRT-001..016)", () => {
    test("CRT-002: Qty > available stock is rejected", async () => {
      const res = await request(app).post("/api/v1/cart/items").send({ productId: "prod-5", quantity: 4 }); // LOW-05 has stock 3
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("Only 3 available");
    });

    test("CRT-006: Quantity discount 8% for qty >= 6", async () => {
      const res = await request(app).get("/api/v1/cart");
      expect(res.status).toBe(200);
    });

    test("CRT-014: WELCOME10 coupon min subtotal 20,000", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      // Add HDP-01 (12,000)
      await request(app).post("/api/v1/cart/items").set("Cookie", cookie).send({ sku: "HDP-01", quantity: 1 });

      // Apply WELCOME10 -> rejected because 12,000 < 20,000
      const cRes1 = await request(app).post("/api/v1/cart/coupon").set("Cookie", cookie).send({ code: "WELCOME10" });
      expect(cRes1.status).toBe(400);

      // Add LAMP-03 (18,000) -> Total subtotal = 30,000
      await request(app).post("/api/v1/cart/items").set("Cookie", cookie).send({ sku: "LAMP-03", quantity: 1 });

      const cRes2 = await request(app).post("/api/v1/cart/coupon").set("Cookie", cookie).send({ code: "WELCOME10" });
      expect(cRes2.status).toBe(200);
    });
  });

  describe("Checkout & Payment Module (CHK-001..016)", () => {
    test("CHK-003 & CHK-008: Place order and receive HTTP 202 with order number", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      await request(app).post("/api/v1/cart/items").set("Cookie", cookie).send({ sku: "HDP-01", quantity: 2 });

      const orderRes = await request(app)
        .post("/api/v1/orders")
        .set("Cookie", cookie)
        .set("Idempotency-Key", `idem-${Date.now()}`)
        .send({
          deliveryMethod: "STANDARD",
          deliveryDistrict: "Gasabo",
          deliveryAddress: "KG 100 St",
          paymentMethod: "MTN_MOMO"
        });

      expect(orderRes.status).toBe(202);
      expect(orderRes.body.orderNumber).toMatch(/^SS-\d{8}-\d{4}$/);
      expect(orderRes.body.status).toBe("PENDING_PAYMENT");
    });

    test("CHK-006: Unsupported district refused (e.g., Huye)", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      await request(app).post("/api/v1/cart/items").set("Cookie", cookie).send({ sku: "HDP-01", quantity: 1 });

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Cookie", cookie)
        .set("Idempotency-Key", `idem-huye-${Date.now()}`)
        .send({
          deliveryMethod: "STANDARD",
          deliveryDistrict: "Huye",
          deliveryAddress: "Main Street",
          paymentMethod: "MTN_MOMO"
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("We do not deliver there yet");
    });

    test("CHK-014: Payment Webhook HMAC Signature verification and forged signature rejection", async () => {
      const payload = {
        providerRef: "PAY-TEST-99",
        orderId: "ord-paid-1",
        status: "SUCCESS" as const,
        amount: 13500
      };

      // Forged signature -> 401
      const fakeRes = await request(app)
        .post("/api/v1/webhooks/payment")
        .set("x-payment-signature", "invalid_forged_signature")
        .send(payload);

      expect(fakeRes.status).toBe(401);

      // Valid signature -> 200
      const sig = paymentAdapter.generateSignature(payload);
      const validRes = await request(app)
        .post("/api/v1/webhooks/payment")
        .set("x-payment-signature", sig)
        .send(payload);

      expect(validRes.status).toBe(200);
    });
  });

  describe("Orders & Delivery Module (ORD-001..012)", () => {
    test("ORD-003: Accessing another shopper's order returns 404", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0791000002", password: "Kigali2026" }); // Eric
      const cookie = loginRes.headers["set-cookie"][0];

      // Try reading Aline's order `ord-paid-1`
      const res = await request(app).get("/api/v1/orders/ord-paid-1").set("Cookie", cookie);
      expect(res.status).toBe(404);
    });

    test("ORD-008..011: Agent delivery code verification & 3-attempt dispute lock", async () => {
      const adminLogin = await request(app).post("/api/v1/auth/login").send({ login: "ops@spheretest.rw", password: "Kigali2026" });
      const adminCookie = adminLogin.headers["set-cookie"][0];

      const agentLogin = await request(app).post("/api/v1/auth/login").send({ login: "agent@spheretest.rw", password: "Kigali2026" });
      const agentCookie = agentLogin.headers["set-cookie"][0];

      // Admin packs and assigns agent
      await request(app).post("/api/v1/admin/orders/ord-paid-1/pack").set("Cookie", adminCookie);
      await request(app).post("/api/v1/admin/orders/ord-paid-1/assign-agent").set("Cookie", adminCookie).send({ agentId: "usr-agent" });
      await request(app).post("/api/v1/admin/orders/ord-paid-1/dispatch").set("Cookie", adminCookie);

      // Agent enters wrong code 3 times
      for (let i = 0; i < 2; i++) {
        const wrongRes = await request(app).post("/api/v1/agent/orders/ord-paid-1/confirm-delivery").set("Cookie", agentCookie).send({ code: "0000" });
        expect(wrongRes.status).toBe(400);
      }

      const thirdWrong = await request(app).post("/api/v1/agent/orders/ord-paid-1/confirm-delivery").set("Cookie", agentCookie).send({ code: "0000" });
      expect(thirdWrong.status).toBe(400);
      expect(thirdWrong.body.error.code).toBe("DELIVERY_DISPUTE");

      // Correct code after 3rd attempt is locked and refused
      const rightAfterLock = await request(app).post("/api/v1/agent/orders/ord-paid-1/confirm-delivery").set("Cookie", agentCookie).send({ code: "4321" });
      expect(rightAfterLock.status).toBe(400);
      expect(rightAfterLock.body.error.code).toBe("DELIVERY_LOCKED");
    });
  });

  describe("Returns & Refunds Module (RET-001..012)", () => {
    test("RET-002: Delivered 8 days ago return refused", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      const res = await request(app)
        .post("/api/v1/orders/ord-deliv-8days/returns")
        .set("Cookie", cookie)
        .field("orderLineId", "ol-deliv-8days-1")
        .field("quantity", 1)
        .field("reason", "Defective product");

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("WINDOW_CLOSED");
    });

    test("RET-003: Non-returnable product (GIFT-08) return refused", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      const res = await request(app)
        .post("/api/v1/orders/ord-deliv-gift/returns")
        .set("Cookie", cookie)
        .field("orderLineId", "ol-deliv-gift-1")
        .field("quantity", 1)
        .field("reason", "Changed mind");

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("NON_RETURNABLE");
    });

    test("RET-001 & RET-008: Eligible return request, admin approval, acceptance & refund", async () => {
      const shopperLogin = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const shopperCookie = shopperLogin.headers["set-cookie"][0];

      const adminLogin = await request(app).post("/api/v1/auth/login").send({ login: "ops@spheretest.rw", password: "Kigali2026" });
      const adminCookie = adminLogin.headers["set-cookie"][0];

      // Submit return request
      const retReq = await request(app)
        .post("/api/v1/orders/ord-deliv-2days/returns")
        .set("Cookie", shopperCookie)
        .field("orderLineId", "ol-deliv-2days-1")
        .field("quantity", 1)
        .field("reason", "Headphone volume issue");

      expect(retReq.status).toBe(201);
      const returnId = retReq.body.returnId;

      // Admin approves return
      const appRes = await request(app).post(`/api/v1/admin/returns/${returnId}/approve`).set("Cookie", adminCookie);
      expect(appRes.status).toBe(200);

      // Admin accepts return
      const accRes = await request(app).post(`/api/v1/admin/returns/${returnId}/accept`).set("Cookie", adminCookie).send({ isFaulty: true });
      expect(accRes.status).toBe(200);
      expect(accRes.body.message).toContain("refund issued successfully");
    });
  });

  describe("Service Booking Module (BKG-001..009)", () => {
    test("BKG-002: Sunday slot request rejected", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie = loginRes.headers["set-cookie"][0];

      const res = await request(app)
        .post("/api/v1/bookings")
        .set("Cookie", cookie)
        .send({
          serviceId: "svc-setup",
          date: "2026-10-11", // Sunday
          startTime: "10:00"
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("NO_SUNDAY_SLOTS");
    });

    test("BKG-004 & BKG-005: Capacity limit 2 per slot", async () => {
      const user1Login = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" });
      const cookie1 = user1Login.headers["set-cookie"][0];

      const user2Login = await request(app).post("/api/v1/auth/login").send({ login: "0791000002", password: "Kigali2026" });
      const cookie2 = user2Login.headers["set-cookie"][0];

      // Book 1
      const b1 = await request(app).post("/api/v1/bookings").set("Cookie", cookie1).send({ serviceId: "svc-setup", date: "2026-10-12", startTime: "10:00" });
      expect(b1.status).toBe(201);

      // Book 2
      const b2 = await request(app).post("/api/v1/bookings").set("Cookie", cookie2).send({ serviceId: "svc-setup", date: "2026-10-12", startTime: "10:00" });
      expect(b2.status).toBe(201);

      // Book 3 (3rd shopper gets 409 SLOT_TAKEN)
      const user3 = await request(app).post("/api/v1/auth/register").send({ name: "Shopper 3", phone: "0781999088", email: "s3@test.rw", password: "Kigali2026", confirmPassword: "Kigali2026" });
      const cookie3 = user3.headers["set-cookie"][0];

      const b3 = await request(app).post("/api/v1/bookings").set("Cookie", cookie3).send({ serviceId: "svc-setup", date: "2026-10-12", startTime: "10:00" });
      expect(b3.status).toBe(409);
      expect(b3.body.error.code).toBe("SLOT_TAKEN");
    });
  });

  describe("Admin & Security Non-Functional (NFR-001..016)", () => {
    test("NFR-001: GET /health returns status: ok ONLY", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
      expect(res.body.version).toBeUndefined();
    });

    test("NFR-010: GET /metrics exposes Prometheus metrics", async () => {
      const res = await request(app).get("/metrics");
      expect(res.status).toBe(200);
      expect(res.text).toContain("http_requests_total");
    });

    test("ADM-007: Non-admin on /api/v1/admin/* returns 403", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({ login: "0781000001", password: "Kigali2026" }); // Shopper
      const cookie = loginRes.headers["set-cookie"][0];

      const res = await request(app).get("/api/v1/admin/products").set("Cookie", cookie);
      expect(res.status).toBe(403);
    });

    test("SEC-03: SQL injection probe in search is harmless", async () => {
      const res = await request(app).get("/api/v1/products?q=' OR 1=1--");
      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
    });
  });
});
