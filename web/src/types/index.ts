export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SHOPPER" | "ADMIN" | "AGENT";
  loyaltyOrdersCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  is_returnable: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  created_at?: string;
  stockBadge?: "In stock" | "Low stock" | "Out of stock";
  addToCartDisabled?: boolean;
  images?: string[];
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  brand?: string;
  specs?: Record<string, string>;
}

export interface CartLine {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_subtotal: number;
  line_discount: number;
  line_total: number;
  is_discounted?: boolean;
  image_url?: string;
}

export interface Cart {
  lines: CartLine[];
  subtotal: number;
  line_discount: number;
  net: number;
  coupon_code: string | null;
  coupon_discount: number;
  net_after_coupon: number;
  delivery_fee: number;
  total: number;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  is_faulty?: boolean;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  shopper_id: string;
  status:
    | "PENDING_PAYMENT"
    | "PAID"
    | "PACKED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "DELIVERY_DISPUTE"
    | "RETURN_REQUESTED"
    | "RETURN_APPROVED"
    | "RETURNED"
    | "REFUND_DUE"
    | "REFUNDED";
  subtotal: number;
  line_discount: number;
  net: number;
  coupon_code: string | null;
  coupon_discount: number;
  net_after_coupon: number;
  delivery_method: "STANDARD" | "EXPRESS" | "PICKUP";
  delivery_fee: number;
  delivery_district: string;
  delivery_address: string;
  total: number;
  payment_method?: string;
  payment_ref?: string;
  delivery_code?: string;
  assigned_agent_id?: string;
  agent_name?: string;
  created_at: string;
  lines?: OrderLine[];
  events?: Array<{ status: string; timestamp: string; note?: string }>;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration_min: number;
  price: number;
  capacity_per_slot: number;
  imageUrl?: string;
}

export interface ServiceSlot {
  slot: string; // e.g. "09:00"
  available_capacity: number;
  total_capacity: number;
  is_available: boolean;
}

export interface Booking {
  id: string;
  booking_reference: string;
  service_id: string;
  service_name?: string;
  shopper_id: string;
  date: string;
  slot: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_number?: string;
  shopper_id: string;
  shopper_name?: string;
  order_line_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
  reason: string;
  photo_url?: string;
  status: "OPEN" | "APPROVED" | "REJECTED" | "ACCEPTED" | "REFUNDED";
  return_code?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  actor_id?: string;
  actor_role?: string;
  details: string;
  ip_address?: string;
  created_at: string;
}
