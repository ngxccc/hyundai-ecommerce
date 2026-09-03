import { describe, expect, it } from "bun:test";
import { PayOSWebhookDto, payOSWebhookSchema } from "./payos-webhook.dto";

describe("PayOSWebhookDto Validation", () => {
  const getValidPayload = () => ({
    code: "00",
    desc: "success",
    data: {
      orderCode: 123456,
      amount: 200000,
      description: "Payment for order 123456",
      accountNumber: "1234567890",
      reference: "FT2401019999",
      transactionDateTime: "2026-08-30 10:00:00",
      currency: "VND",
      paymentLinkId: "plink_123456",
      code: "00",
      desc: "success",
      counterAccountBankId: null,
      counterAccountBankName: null,
      counterAccountName: null,
      counterAccountNumber: null,
      virtualAccountName: null,
      virtualAccountNumber: null,
    },
    signature:
      "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = payOSWebhookSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(PayOSWebhookDto.zodSchema).toBe(payOSWebhookSchema);
    });
  });

  describe("data nested object", () => {
    it("should fail validation when nested data is missing required orderCode", () => {
      const valid = getValidPayload();
      const { orderCode: _omitted, ...incompleteData } = valid.data;
      const payload = {
        ...valid,
        data: incompleteData,
      };
      expect(payOSWebhookSchema.safeParse(payload).success).toBe(false);
    });
    it("should fail validation when nested data contains unrecognized keys", () => {
      const payload = {
        ...getValidPayload(),
        data: {
          ...getValidPayload().data,
          extraField: "disallowed",
        },
      };
      expect(payOSWebhookSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("signature field", () => {
    it("should fail validation when signature is empty string", () => {
      const payload = { ...getValidPayload(), signature: "" };
      expect(payOSWebhookSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present at root level", () => {
      const payload = { ...getValidPayload(), unexpectedRootKey: "invalid" };
      expect(payOSWebhookSchema.safeParse(payload).success).toBe(false);
    });
  });
});
