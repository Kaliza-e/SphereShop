import { Clock } from "./clock";

export interface CartLineInput {
  price: number;
  qty: number;
}

export interface CouponInput {
  code: string;
  percent: number; // e.g. 10 for 10%
  minSubtotal: number;
  maxDiscount: number;
  active: boolean;
  expiresAt?: Date | string | null;
}

export interface PricingOptions {
  lines: CartLineInput[];
  coupon?: CouponInput | null;
  deliveryMethod?: "STANDARD" | "EXPRESS" | "PICKUP";
  isLoyal?: boolean;
}

export interface PricingResult {
  subtotal: number;
  lineDiscount: number;
  net: number;
  couponDiscount: number;
  couponApplied: boolean;
  couponRejectionReason?: string;
  netAfterCoupon: number;
  deliveryFee: number;
  total: number;
}

export function calculatePricing(options: PricingOptions): PricingResult {
  let subtotal = 0;
  let lineDiscount = 0;

  for (const line of options.lines) {
    const itemSubtotal = line.price * line.qty;
    subtotal += itemSubtotal;
    if (line.qty >= 6) {
      lineDiscount += Math.floor(itemSubtotal * 0.08);
    }
  }

  const net = subtotal - lineDiscount;

  let couponDiscount = 0;
  let couponApplied = false;
  let couponRejectionReason: string | undefined;

  if (options.coupon) {
    const coupon = options.coupon;
    const now = Clock.now();
    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now.getTime();

    if (!coupon.active || isExpired) {
      couponRejectionReason = "Code is not valid";
    } else if (net < coupon.minSubtotal) {
      couponRejectionReason = `Minimum order amount of ${coupon.minSubtotal.toLocaleString()} RWF required`;
    } else {
      const rawDisc = Math.floor((net * coupon.percent) / 100);
      couponDiscount = Math.min(rawDisc, coupon.maxDiscount);
      couponApplied = true;
    }
  }

  const netAfterCoupon = net - couponDiscount;

  const method = options.deliveryMethod || "STANDARD";
  let deliveryFee = 0;

  if (method === "PICKUP") {
    deliveryFee = 0;
  } else if (method === "EXPRESS") {
    // Express 3500; never free, available only before 14:00 Kigali time
    const kigaliHour = Clock.getKigaliHour();
    if (kigaliHour >= 14) {
      throw new Error("Express delivery is only available for orders placed before 14:00 Kigali time");
    }
    deliveryFee = 3500;
  } else {
    // STANDARD
    if (netAfterCoupon >= 40000 || options.isLoyal) {
      deliveryFee = 0;
    } else {
      deliveryFee = 1500;
    }
  }

  const total = Math.floor(netAfterCoupon + deliveryFee);

  return {
    subtotal: Math.floor(subtotal),
    lineDiscount: Math.floor(lineDiscount),
    net: Math.floor(net),
    couponDiscount: Math.floor(couponDiscount),
    couponApplied,
    couponRejectionReason,
    netAfterCoupon: Math.floor(netAfterCoupon),
    deliveryFee: Math.floor(deliveryFee),
    total
  };
}
