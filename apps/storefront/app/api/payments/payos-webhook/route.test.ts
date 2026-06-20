import { describe, expect, it, vi, beforeEach } from "bun:test";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import {
  generatePayOSSignature,
  type PayOSWebhookData,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
} from "@nhatnang/shared";
import { env } from "@/env";
import { mockConfirmPayOSPayment } from "@nhatnang/shared/testing/action-mocks";

// Static import cannot work here because we must register mock.module first before importing the route handler.
const { POST } = await import("./route");

describe("POST /api/payments/payos-webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const checksumKey = env.PAYOS_CHECKSUM_KEY;
    const signature = generatePayOSSignature(validData, checksumKey);

    mockConfirmPayOSPayment.mockResolvedValue(true);

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
    expect(mockConfirmPayOSPayment).toHaveBeenCalledWith(
      "12345678",
      20000,
      "REF-123",
    );
  });

  it("does not call confirmPayOSPayment but returns 200 when code is not 00", async () => {
    const checksumKey = env.PAYOS_CHECKSUM_KEY;
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
    expect(mockConfirmPayOSPayment).not.toHaveBeenCalled();
  });

  it("returns 200 even when order is already processed or not found", async () => {
    const checksumKey = env.PAYOS_CHECKSUM_KEY;
    const signature = generatePayOSSignature(validData, checksumKey);

    mockConfirmPayOSPayment.mockResolvedValue(false); // already processed or not found

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
    expect(mockConfirmPayOSPayment).toHaveBeenCalledWith(
      "12345678",
      20000,
      "REF-123",
    );
  });

  it("returns 500 when confirmPayOSPayment throws database error", async () => {
    const checksumKey = env.PAYOS_CHECKSUM_KEY;
    const signature = generatePayOSSignature(validData, checksumKey);

    mockConfirmPayOSPayment.mockRejectedValue(
      new Error("Database connection lost"),
    );

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
  });
});
