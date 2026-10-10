import { redactSensitiveData } from "../../middleware/logger";

describe("Log Redaction Layer (SEC-08)", () => {
  test("redacts sensitive fields in nested objects", () => {
    const payload = {
      user: "aline@spheretest.rw",
      password: "SecretPassword123",
      payment: {
        method: "CARD",
        cardNumber: "4111222233334444",
        cvv: "123",
        pin: "9999"
      },
      otp: "123456",
      deliveryCode: "4321",
      normalField: "visible"
    };

    const redacted = redactSensitiveData(payload);
    expect(redacted.user).toBe("aline@spheretest.rw");
    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.payment.cardNumber).toBe("[REDACTED]");
    expect(redacted.payment.cvv).toBe("[REDACTED]");
    expect(redacted.payment.pin).toBe("[REDACTED]");
    expect(redacted.otp).toBe("[REDACTED]");
    expect(redacted.deliveryCode).toBe("[REDACTED]");
    expect(redacted.normalField).toBe("visible");
  });
});
