import { validateStateTransition, canTransition, IllegalStateTransitionError, OrderStatus } from "../../domain/orderStateMachine";

describe("Order State Machine", () => {
  test("Legal transition path PENDING_PAYMENT -> PAID -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED -> RETURN_REQUESTED -> RETURNED -> REFUNDED", () => {
    expect(() => validateStateTransition("PENDING_PAYMENT", "PAID")).not.toThrow();
    expect(() => validateStateTransition("PAID", "PACKED")).not.toThrow();
    expect(() => validateStateTransition("PACKED", "OUT_FOR_DELIVERY")).not.toThrow();
    expect(() => validateStateTransition("OUT_FOR_DELIVERY", "DELIVERED")).not.toThrow();
    expect(() => validateStateTransition("DELIVERED", "RETURN_REQUESTED")).not.toThrow();
    expect(() => validateStateTransition("RETURN_REQUESTED", "RETURNED")).not.toThrow();
    expect(() => validateStateTransition("RETURNED", "REFUNDED")).not.toThrow();
  });

  test("Payment failure and retry legal path", () => {
    expect(() => validateStateTransition("PENDING_PAYMENT", "PAYMENT_FAILED")).not.toThrow();
    expect(() => validateStateTransition("PAYMENT_FAILED", "PENDING_PAYMENT")).not.toThrow();
  });

  test("Payment expiration and late success legal path", () => {
    expect(() => validateStateTransition("PENDING_PAYMENT", "PAYMENT_EXPIRED")).not.toThrow();
    expect(() => validateStateTransition("PAYMENT_EXPIRED", "PAID")).not.toThrow();
    expect(() => validateStateTransition("PAYMENT_EXPIRED", "REFUND_DUE")).not.toThrow();
  });

  test("Illegal transitions throw 409 IllegalStateTransitionError", () => {
    const illegalTransitions: Array<[OrderStatus, OrderStatus]> = [
      ["PAID", "DELIVERED"],
      ["DELIVERED", "PAID"],
      ["PAYMENT_FAILED", "PACKED"],
      ["PENDING_PAYMENT", "DELIVERED"],
      ["OUT_FOR_DELIVERY", "PAID"],
      ["REFUNDED", "PAID"]
    ];

    for (const [from, to] of illegalTransitions) {
      expect(canTransition(from, to)).toBe(false);
      expect(() => validateStateTransition(from, to)).toThrow(IllegalStateTransitionError);
    }
  });
});
