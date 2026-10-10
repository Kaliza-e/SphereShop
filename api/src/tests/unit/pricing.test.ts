import { calculatePricing, CouponInput } from "../../domain/pricing";
import { Clock } from "../../domain/clock";

describe("Pricing Engine - 10 Worked Examples & Boundaries", () => {
  afterEach(() => {
    Clock.setMockedTime(null);
  });

  test("Example 1: 2 × HDP-01 (12,000), Standard -> 25,500", () => {
    const res = calculatePricing({
      lines: [{ price: 12000, qty: 2 }],
      deliveryMethod: "STANDARD"
    });
    expect(res.subtotal).toBe(24000);
    expect(res.lineDiscount).toBe(0);
    expect(res.net).toBe(24000);
    expect(res.deliveryFee).toBe(1500);
    expect(res.total).toBe(25500);
  });

  test("Example 2: 6 × CABLE-04 (2,500), Standard -> 15,300", () => {
    const res = calculatePricing({
      lines: [{ price: 2500, qty: 6 }],
      deliveryMethod: "STANDARD"
    });
    expect(res.subtotal).toBe(15000);
    expect(res.lineDiscount).toBe(1200); // 8% of 15,000
    expect(res.net).toBe(13800);
    expect(res.deliveryFee).toBe(1500);
    expect(res.total).toBe(15300);
  });

  test("Example 3: HDP-01 + LAMP-03 (30,000), WELCOME10, Standard -> 28,500", () => {
    const welcome10: CouponInput = {
      code: "WELCOME10",
      percent: 10,
      minSubtotal: 20000,
      maxDiscount: 5000,
      active: true
    };
    const res = calculatePricing({
      lines: [
        { price: 12000, qty: 1 },
        { price: 18000, qty: 1 }
      ],
      coupon: welcome10,
      deliveryMethod: "STANDARD"
    });
    expect(res.subtotal).toBe(30000);
    expect(res.couponDiscount).toBe(3000);
    expect(res.netAfterCoupon).toBe(27000);
    expect(res.deliveryFee).toBe(1500);
    expect(res.total).toBe(28500);
  });

  test("Example 4: 5 × HDP-01 (60,000), WELCOME10 (10% capped 5000) -> 55,000 (free delivery)", () => {
    const welcome10: CouponInput = {
      code: "WELCOME10",
      percent: 10,
      minSubtotal: 20000,
      maxDiscount: 5000,
      active: true
    };
    const res = calculatePricing({
      lines: [{ price: 12000, qty: 5 }],
      coupon: welcome10,
      deliveryMethod: "STANDARD"
    });
    expect(res.subtotal).toBe(60000);
    expect(res.couponDiscount).toBe(5000); // capped
    expect(res.netAfterCoupon).toBe(55000); // >= 40,000
    expect(res.deliveryFee).toBe(0);
    expect(res.total).toBe(55000);
  });

  test("Example 5: 1 × HDP-01, loyal shopper Eric, Standard -> 12,000", () => {
    const res = calculatePricing({
      lines: [{ price: 12000, qty: 1 }],
      deliveryMethod: "STANDARD",
      isLoyal: true
    });
    expect(res.subtotal).toBe(12000);
    expect(res.deliveryFee).toBe(0); // Loyal shopper gets free standard delivery
    expect(res.total).toBe(12000);
  });

  test("Example 6: 3×HDP-01 + 1×CASE-02 (39,500), Standard -> 41,000", () => {
    const res = calculatePricing({
      lines: [
        { price: 12000, qty: 3 },
        { price: 3500, qty: 1 }
      ],
      deliveryMethod: "STANDARD"
    });
    expect(res.netAfterCoupon).toBe(39500);
    expect(res.deliveryFee).toBe(1500); // < 40,000
    expect(res.total).toBe(41000);
  });

  test("Example 7: 3×HDP-01 + CASE-02 + CABLE-04 (42,000), Standard -> 42,000", () => {
    const res = calculatePricing({
      lines: [
        { price: 12000, qty: 3 },
        { price: 3500, qty: 1 },
        { price: 2500, qty: 1 }
      ],
      deliveryMethod: "STANDARD"
    });
    expect(res.netAfterCoupon).toBe(42000);
    expect(res.deliveryFee).toBe(0); // >= 40,000
    expect(res.total).toBe(42000);
  });

  test("Example 8: 4×CABLE-04 + HDP-01 + LAMP-03 (40,000 exactly), Standard -> 40,000", () => {
    const res = calculatePricing({
      lines: [
        { price: 2500, qty: 4 },
        { price: 12000, qty: 1 },
        { price: 18000, qty: 1 }
      ],
      deliveryMethod: "STANDARD"
    });
    expect(res.netAfterCoupon).toBe(40000);
    expect(res.deliveryFee).toBe(0); // exactly 40,000 is free delivery
    expect(res.total).toBe(40000);
  });

  test("Example 9: 1 × HDP-01, Express before 14:00 -> 15,500", () => {
    Clock.setMockedTime("2026-10-10T10:00:00.000Z"); // UTC 10:00 = Kigali 12:00
    const res = calculatePricing({
      lines: [{ price: 12000, qty: 1 }],
      deliveryMethod: "EXPRESS"
    });
    expect(res.deliveryFee).toBe(3500);
    expect(res.total).toBe(15500);
  });

  test("Example 10: 1 × HDP-01, WELCOME10 (min 20,000 rejected), Standard -> 13,500", () => {
    const welcome10: CouponInput = {
      code: "WELCOME10",
      percent: 10,
      minSubtotal: 20000,
      maxDiscount: 5000,
      active: true
    };
    const res = calculatePricing({
      lines: [{ price: 12000, qty: 1 }],
      coupon: welcome10,
      deliveryMethod: "STANDARD"
    });
    expect(res.couponApplied).toBe(false);
    expect(res.couponDiscount).toBe(0);
    expect(res.netAfterCoupon).toBe(12000);
    expect(res.deliveryFee).toBe(1500);
    expect(res.total).toBe(13500);
  });

  test("Boundary: Line discount applies at qty = 6 but not at qty = 5", () => {
    const res5 = calculatePricing({ lines: [{ price: 1000, qty: 5 }] });
    expect(res5.lineDiscount).toBe(0);

    const res6 = calculatePricing({ lines: [{ price: 1000, qty: 6 }] });
    expect(res6.lineDiscount).toBe(480); // 6000 * 0.08
  });

  test("Boundary: Express after 14:00 Kigali time throws error", () => {
    Clock.setMockedTime("2026-10-10T13:00:00.000Z"); // UTC 13:00 = Kigali 15:00
    expect(() => {
      calculatePricing({
        lines: [{ price: 12000, qty: 1 }],
        deliveryMethod: "EXPRESS"
      });
    }).toThrow("Express delivery is only available for orders placed before 14:00 Kigali time");
  });
});
