import { paymentAdapter, WebhookPayload } from "../../services/paymentAdapter";

describe("Payment Adapter & HMAC Signature Verification (SEC-06)", () => {
  test("generates and verifies correct HMAC-SHA256 signature", () => {
    const payload: WebhookPayload = {
      providerRef: "PAY-12345",
      orderId: "SS-20261010-0001",
      status: "SUCCESS",
      amount: 25500
    };

    const sig = paymentAdapter.generateSignature(payload);
    expect(typeof sig).toBe("string");
    expect(sig.length).toBeGreaterThan(0);

    const isValid = paymentAdapter.verifySignature(payload, sig);
    expect(isValid).toBe(true);
  });

  test("rejects forged / altered signature", () => {
    const payload: WebhookPayload = {
      providerRef: "PAY-12345",
      orderId: "SS-20261010-0001",
      status: "SUCCESS",
      amount: 25500
    };

    const fakeSig = "1111222233334444555566667777888899990000aaaaabbbbbcccccdddddeeff";
    const isValid = paymentAdapter.verifySignature(payload, fakeSig);
    expect(isValid).toBe(false);
  });
});
