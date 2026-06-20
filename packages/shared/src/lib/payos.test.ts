import { describe, expect, it } from "bun:test";
import {
  generatePayOSSignature,
  verifyPayOSSignature,
  makePayOSDescription,
  payosAddInfo,
  kindFromTxType,
} from "./payos";

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

describe("PayOS Description Utilities", () => {

  it("should generate correct description format for each kind", () => {
    expect(makePayOSDescription("full", "123456")).toBe("Thanh toan GD 123456");
    expect(makePayOSDescription("deposit", "123456")).toBe("Coc 20% DH 123456");
    expect(makePayOSDescription("repay", "123456")).toBe("Tra no CN 123456");
  });

  it("should truncate full, deposit, and repay descriptions to 25 chars", () => {
    const longCode = "12345678901234567890";
    // "Thanh toan GD 12345678901234567890" is 34 characters
    const fullDesc = makePayOSDescription("full", longCode);
    expect(fullDesc.length).toBe(25);
    expect(fullDesc).toBe("Thanh toan GD 12345678901");

    const depositDesc = makePayOSDescription("deposit", longCode);
    expect(depositDesc.length).toBe(25);
    expect(depositDesc).toBe("Coc 20% DH 12345678901234");

    const repayDesc = makePayOSDescription("repay", longCode);
    expect(repayDesc.length).toBe(25);
    expect(repayDesc).toBe("Tra no CN 123456789012345");
  });

  it("should return dynamic encoded VietQR addInfo string via payosAddInfo", () => {
    expect(payosAddInfo("full", "123456")).toBe("Thanh%20toan%20GD%20123456");
  });

  it("should correctly map, generate, and encode a deposit transaction", () => {
    const txType = "DEPOSIT";
    const kind = kindFromTxType(txType);
    expect(kind).toBe("deposit");

    const desc = makePayOSDescription(kind, "987654");
    expect(desc).toBe("Coc 20% DH 987654");

    const addInfo = payosAddInfo(kind, "987654");
    expect(addInfo).toBe("Coc%2020%25%20DH%20987654");
  });
});
