import { describe, expect, it } from "bun:test";
import {
  formatPayOSDescription,
  generatePayOSOrderCode,
  generatePayOSSignature,
  sortAndStringifyPayOSData,
  verifyPayOSSignature,
} from "./payos.util";
import {
  PAYOS_RESPONSE_CODE,
  buildPaymentLockKey,
} from "./constants/payment.constant";

describe("PayOS Utilities & Constants", () => {
  describe("PAYOS_RESPONSE_CODE", () => {
    it("should define SUCCESS as '00'", () => {
      expect(PAYOS_RESPONSE_CODE.SUCCESS).toBe("00");
    });
  });

  describe("buildPaymentLockKey", () => {
    it("should format redis lock key with prefix and orderCode", () => {
      expect(buildPaymentLockKey(123456789)).toBe(
        "lock:payment:orderCode:123456789",
      );
      expect(buildPaymentLockKey("987654321")).toBe(
        "lock:payment:orderCode:987654321",
      );
    });
  });

  describe("formatPayOSDescription", () => {
    it("should use orderNumber directly if present and truncate to 25 chars", () => {
      const orderNumber = "ORD-20260906-8A3B1C4D2E5F";
      const desc = formatPayOSDescription(
        orderNumber,
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(desc).toBe(orderNumber.slice(0, 25));
      expect(desc.length).toBeLessThanOrEqual(25);
    });

    it("should fallback to prefix and clean orderId when orderNumber is null", () => {
      const orderId = "550e8400-e29b-41d4-a716-446655440000";
      const desc = formatPayOSDescription(null, orderId);
      expect(desc.startsWith("ORD-")).toBe(true);
      expect(desc.length).toBeLessThanOrEqual(25);
      expect(desc).toBe("ORD-550e8400e29b41d4a7164");
    });

    it("should fallback when orderNumber is empty string", () => {
      const orderId = "550e8400-e29b-41d4-a716-446655440000";
      const desc = formatPayOSDescription("   ", orderId);
      expect(desc.startsWith("ORD-")).toBe(true);
      expect(desc.length).toBeLessThanOrEqual(25);
    });
  });

  describe("sortAndStringifyPayOSData", () => {
    it("should sort keys alphabetically and ignore undefined", () => {
      const data = {
        orderCode: 123,
        amount: 50000,
        cancelUrl: "https://cancel.com",
        extra: undefined,
      };
      const result = sortAndStringifyPayOSData(data);
      expect(result).toBe(
        "amount=50000&cancelUrl=https://cancel.com&orderCode=123",
      );
    });
  });

  describe("generatePayOSSignature & verifyPayOSSignature", () => {
    const checksumKey = "secret-checksum-key-32-characters";
    const payload = {
      amount: 50000,
      orderCode: 123456,
    };

    it("should generate valid HMAC-SHA256 signature", () => {
      const sig = generatePayOSSignature(payload, checksumKey);
      expect(sig).toBeDefined();
      expect(typeof sig).toBe("string");
      expect(sig.length).toBe(64);
    });

    it("should throw if checksumKey is empty", () => {
      expect(() => generatePayOSSignature(payload, "")).toThrow(
        "PayOS Checksum Key is required",
      );
    });

    it("should verify valid signature as true", () => {
      const sig = generatePayOSSignature(payload, checksumKey);
      const isValid = verifyPayOSSignature(payload, sig, checksumKey);
      expect(isValid).toBe(true);
    });

    it("should verify invalid signature as false", () => {
      const isValid = verifyPayOSSignature(payload, "invalid-sig", checksumKey);
      expect(isValid).toBe(false);
    });

    it("should verify with empty signature or checksumKey as false", () => {
      expect(verifyPayOSSignature(payload, "", checksumKey)).toBe(false);
      expect(verifyPayOSSignature(payload, "sig", "")).toBe(false);
    });
  });

  describe("generatePayOSOrderCode", () => {
    it("should generate numeric order code within safe integer range", () => {
      const code = generatePayOSOrderCode();
      expect(typeof code).toBe("number");
      expect(code).toBeGreaterThan(0);
      expect(code).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });
  });
});
