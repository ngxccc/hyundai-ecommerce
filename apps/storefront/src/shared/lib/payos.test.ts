import { describe, expect, it } from "bun:test";
import { generatePayOSSignature, verifyPayOSSignature } from "./payos";

describe("PayOS Signature Utilities", () => {
  const checksumKey = "demo_checksum_key_123456";
  const mockWebhookData = {
    orderCode: 123456,
    amount: 500000,
    description: "Hyundai Nhat Nang payment test",
    accountNumber: "VNTB1234567",
    reference: "PAYOS123",
    transactionDateTime: "2026-06-15T15:00:00Z",
    currency: "VND",
    paymentLinkId: "LINK123",
  };

  it("should generate a valid HMAC-SHA256 signature from sorted data keys", () => {
    const signature = generatePayOSSignature(mockWebhookData, checksumKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe("string");
    expect(signature.length).toBe(64); // SHA-256 hex is 64 chars
  });

  it("should successfully verify a correct signature", () => {
    const signature = generatePayOSSignature(mockWebhookData, checksumKey);
    const isValid = verifyPayOSSignature(
      mockWebhookData,
      signature,
      checksumKey,
    );
    expect(isValid).toBe(true);
  });

  it("should fail verification if signature is tampered", () => {
    const signature = generatePayOSSignature(mockWebhookData, checksumKey);
    const tamperedSignature = signature.replace(
      signature.charAt(0),
      signature.startsWith("a") ? "b" : "a",
    );
    const isValid = verifyPayOSSignature(
      mockWebhookData,
      tamperedSignature,
      checksumKey,
    );
    expect(isValid).toBe(false);
  });

  it("should fail verification if data is modified", () => {
    const signature = generatePayOSSignature(mockWebhookData, checksumKey);
    const modifiedData = { ...mockWebhookData, amount: 999999 };
    const isValid = verifyPayOSSignature(modifiedData, signature, checksumKey);
    expect(isValid).toBe(false);
  });
});
