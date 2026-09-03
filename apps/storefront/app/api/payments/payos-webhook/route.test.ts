import { describe, expect, it, vi, beforeEach, spyOn } from "bun:test";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import {
  generatePayOSSignature,
  type PayOSWebhookData,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
} from "@nhatnang/shared";
import { env } from "@/env";
import { paymentService } from "@nhatnang/database/services";
import { POST } from "./route";

describe("POST /api/payments/payos-webhook", () => {
  const testChecksumKey = "test_payos_checksum_key_12345";

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Ensure checksum key exists in test environment
    env.PAYOS_CHECKSUM_KEY = env.PAYOS_CHECKSUM_KEY || testChecksumKey;
  });

  const validData = {
    orderCode: 12345678,
    amount: 20000,
    description: makePayOSDescription("full", 12345678),
    reference: "REF-123",
  } as unknown as PayOSWebhookData;

  it("returns 400 when signature is missing", async () => {
    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: PAYOS_SUCCESS_CODE,
        desc: "success",
        data: validData,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.missingRequiredFields");
  });

  it("returns 400 when signature is invalid", async () => {
    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: PAYOS_SUCCESS_CODE,
        desc: "success",
        data: validData,
        signature: "invalid_signature",
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.invalidSignature");
  });

  it("calls confirmPayOSPayment and returns 200 on successful signature verification", async () => {
    const confirmSpy = spyOn(
      paymentService,
      "confirmPayOSPayment",
    ).mockResolvedValue(true);
    const checksumKey = env.PAYOS_CHECKSUM_KEY || testChecksumKey;
    const signature = generatePayOSSignature(validData, checksumKey);

    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: PAYOS_SUCCESS_CODE,
        desc: "success",
        data: validData,
        signature,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      message: string;
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.message).toBe("Webhook processed successfully");
    expect(confirmSpy).toHaveBeenCalledWith("12345678", 20000, "REF-123");
    confirmSpy.mockRestore();
  });

  it("does not call confirmPayOSPayment but returns 200 when code is not 00", async () => {
    const confirmSpy = spyOn(paymentService, "confirmPayOSPayment");
    const checksumKey = env.PAYOS_CHECKSUM_KEY || testChecksumKey;
    const signature = generatePayOSSignature(validData, checksumKey);

    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: "01", // failed/cancelled payment
        desc: "payment failed",
        data: validData,
        signature,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      message: string;
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.message).toBe("Webhook processed successfully");
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("returns 200 even when order is already processed or not found", async () => {
    const confirmSpy = spyOn(
      paymentService,
      "confirmPayOSPayment",
    ).mockResolvedValue(false);
    const debtSpy = spyOn(
      paymentService,
      "confirmDebtRepayment",
    ).mockResolvedValue(false);
    const checksumKey = env.PAYOS_CHECKSUM_KEY || testChecksumKey;
    const signature = generatePayOSSignature(validData, checksumKey);

    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: PAYOS_SUCCESS_CODE,
        desc: "success",
        data: validData,
        signature,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      message: string;
    };

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(json.success).toBe(true);
    expect(json.message).toBe("Webhook processed successfully");
    expect(confirmSpy).toHaveBeenCalledWith("12345678", 20000, "REF-123");
    confirmSpy.mockRestore();
    debtSpy.mockRestore();
  });

  it("returns 500 when confirmPayOSPayment throws database error", async () => {
    const confirmSpy = spyOn(
      paymentService,
      "confirmPayOSPayment",
    ).mockRejectedValue(new Error("Database connection lost"));
    const checksumKey = env.PAYOS_CHECKSUM_KEY || testChecksumKey;
    const signature = generatePayOSSignature(validData, checksumKey);

    const request = new Request("http://localhost/api/payments/payos-webhook", {
      method: "POST",
      body: JSON.stringify({
        code: PAYOS_SUCCESS_CODE,
        desc: "success",
        data: validData,
        signature,
      }),
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      error: string;
    };

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.success).toBe(false);
    expect(json.error).toBe("errors.internalServerError");
    confirmSpy.mockRestore();
  });
});
