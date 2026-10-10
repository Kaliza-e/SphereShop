export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED"
  | "REFUND_DUE"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_DISPUTE"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURN_REJECTED"
  | "RETURNED"
  | "REFUNDED";

const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "PAYMENT_FAILED", "PAYMENT_EXPIRED", "CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT"],
  PAYMENT_EXPIRED: ["PENDING_PAYMENT", "PAID", "REFUND_DUE"],
  REFUND_DUE: ["REFUNDED"],
  PACKED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_DISPUTE"],
  DELIVERY_DISPUTE: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: ["REFUND_DUE", "REFUNDED"],
  RETURN_REQUESTED: ["RETURN_REJECTED", "RETURNED"],
  RETURN_REJECTED: [],
  RETURNED: ["REFUNDED"],
  REFUNDED: []
};

export class IllegalStateTransitionError extends Error {
  public statusCode = 409;
  public code = "ILLEGAL_STATE_TRANSITION";

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot transition order state from '${from}' to '${to}'`);
    this.name = "IllegalStateTransitionError";
  }
}

export function validateStateTransition(current: OrderStatus, next: OrderStatus): void {
  const allowed = LEGAL_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new IllegalStateTransitionError(current, next);
  }
}

export function canTransition(current: OrderStatus, next: OrderStatus): boolean {
  const allowed = LEGAL_TRANSITIONS[current] || [];
  return allowed.includes(next);
}
