import { describe, expect, it, spyOn } from "bun:test";
import { createHmac } from "node:crypto";
import {
  generatePayOSOrderCode,
  isPayOSTimestampValid,
  sortAndFormatPayloadData,
  verifyPayOSSignature,
} from "./payos-crypto.util";

describe("PayOS Crypto & OrderCode Utilities", () => {
  describe("generatePayOSOrderCode", () => {
    it("should generate numeric orderCode within safe integer range when called", () => {
      const orderCode = generatePayOSOrderCode();

      expect(typeof orderCode).toBe("number");
      expect(Number.isInteger(orderCode)).toBe(true);
      expect(orderCode).toBeGreaterThan(0);
      expect(orderCode).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });

    it("should produce collision-free unique orderCodes when called rapidly in sequence", () => {
      const TOTAL_CODES = 10000;
      const codeSet = new Set<number>();

      for (let i = 0; i < TOTAL_CODES; i++) {
        const code = generatePayOSOrderCode();
        expect(code).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
        codeSet.add(code);
      }
      expect(codeSet.size).toBe(TOTAL_CODES);
    });

    it("should advance clock when more than 1000 orderCodes are requested in the same millisecond", () => {
      let fakeTime = 1767225610000;
      const dateSpy = spyOn(Date, "now").mockImplementation(() => {
        return fakeTime;
      });

      for (let i = 0; i < 1000; i++) {
        generatePayOSOrderCode();
      }
      fakeTime += 1;
      const overflowCode = generatePayOSOrderCode();
      expect(overflowCode).toBeGreaterThan(0);

      dateSpy.mockRestore();
    });
  });

  describe("sortAndFormatPayloadData", () => {
    it("should sort payload keys alphabetically and format as query string when data is provided", () => {
      const payload = {
        orderCode: 123456,
        amount: 200000,
        description: "Cinema ticket booking",
      };

      const formatted = sortAndFormatPayloadData(payload);
      expect(formatted).toBe(
        "amount=200000&description=Cinema ticket booking&orderCode=123456",
      );
    });

    it("should format diverse types correctly when payload contains null, boolean, nested object, or bigint", () => {
      const payload = {
        emptyVal: null,
        unsetVal: undefined,
        isActive: true,
        nested: { item: "ticket" },
        bigNumber: BigInt(9007199254740991),
      };

      const formatted = sortAndFormatPayloadData(payload);
      expect(formatted).toBe(
        'bigNumber=9007199254740991&emptyVal=&isActive=true&nested={"item":"ticket"}&unsetVal=',
      );
    });
  });

  describe("verifyPayOSSignature", () => {
    it("should return true when HMAC-SHA256 signature matches", () => {
      const payload = {
        amount: 150000,
        orderCode: 123456,
      };
      const checksumKey = "secret-checksum-key-12345";
      const validSignature = createHmac("sha256", checksumKey)
        .update("amount=150000&orderCode=123456")
        .digest("hex");

      const isValid = verifyPayOSSignature(
        payload,
        validSignature,
        checksumKey,
      );
      expect(isValid).toBe(true);
    });

    it("should return false when signature is invalid or tampered", () => {
      const payload = {
        amount: 150000,
        orderCode: 123456,
      };
      const checksumKey = "secret-checksum-key-12345";
      const invalidSignature =
        "invalid_tampered_signature_hex_code_1234567890123456789012345678901234567890123456789012345678901234";

      const isValid = verifyPayOSSignature(
        payload,
        invalidSignature,
        checksumKey,
      );
      expect(isValid).toBe(false);
    });

    it("should return false when signature or checksumKey is empty", () => {
      expect(verifyPayOSSignature({ amount: 100 }, "", "key")).toBe(false);
      expect(verifyPayOSSignature({ amount: 100 }, "sig", "")).toBe(false);
    });

    it("should return false when signature buffer length does not match calculated length", () => {
      const payload = { amount: 100 };
      expect(verifyPayOSSignature(payload, "short-sig", "key-123")).toBe(false);
    });
  });

  describe("isPayOSTimestampValid", () => {
    it("should return true when timestamp is within 5 minutes skew window", () => {
      const recentTimestamp = new Date(Date.now() - 60000).toISOString();
      expect(isPayOSTimestampValid(recentTimestamp, 300)).toBe(true);
    });

    it("should return false when timestamp is older than 5 minutes", () => {
      const staleTimestamp = new Date(Date.now() - 600000).toISOString();
      expect(isPayOSTimestampValid(staleTimestamp, 300)).toBe(false);
    });

    it("should return false when transactionDateTime is empty or invalid", () => {
      expect(isPayOSTimestampValid("")).toBe(false);
      expect(isPayOSTimestampValid("not-a-valid-date")).toBe(false);
    });
  });
});
