import crypto from "crypto";

export type PaymentMethod = "MTN_MOMO" | "AIRTEL_MONEY" | "CARD";
export type StubMode = "success" | "decline" | "silent" | "late-success";
export type RefundStubMode = "success" | "fail";

export interface ChargeRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  phoneNumber?: string;
  idempotencyKey?: string;
}

export interface ChargeResponse {
  providerRef: string;
  status: "PENDING" | "DECLINED";
  message: string;
}

export interface RefundRequest {
  providerRef: string;
  amount: number;
  reason?: string;
}

export interface RefundResponse {
  refundRef: string;
  status: "SUCCESS" | "FAILED";
}

export interface WebhookPayload {
  providerRef: string;
  orderId: string;
  status: "SUCCESS" | "FAILED";
  amount: number;
}

class PaymentAdapterService {
  private stubMode: StubMode = "success";
  private refundStubMode: RefundStubMode = "success";
  private webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "default_webhook_secret_key_12345";

  public setStubMode(mode: StubMode) {
    this.stubMode = mode;
  }

  public getStubMode(): StubMode {
    return this.stubMode;
  }

  public setRefundStubMode(mode: RefundStubMode) {
    this.refundStubMode = mode;
  }

  public getRefundStubMode(): RefundStubMode {
    return this.refundStubMode;
  }

  public generateSignature(payload: WebhookPayload): string {
    const data = `${payload.providerRef}:${payload.orderId}:${payload.status}:${payload.amount}`;
    return crypto.createHmac("sha256", this.webhookSecret).update(data).digest("hex");
  }

  public verifySignature(payload: WebhookPayload, signature: string): boolean {
    if (!signature) return false;
    const expected = this.generateSignature(payload);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  public async charge(req: ChargeRequest): Promise<ChargeResponse> {
    const providerRef = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (this.stubMode === "decline") {
      return {
        providerRef,
        status: "DECLINED",
        message: "Payment declined by provider"
      };
    }

    // For 'success', 'silent', and 'late-success', the charge initiated successfully
    return {
      providerRef,
      status: "PENDING",
      message: "Charge initiated, waiting for provider confirmation"
    };
  }

  public async refund(req: RefundRequest): Promise<RefundResponse> {
    const refundRef = `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    if (this.refundStubMode === "fail") {
      return { refundRef, status: "FAILED" };
    }
    return { refundRef, status: "SUCCESS" };
  }
}

export const paymentAdapter = new PaymentAdapterService();
