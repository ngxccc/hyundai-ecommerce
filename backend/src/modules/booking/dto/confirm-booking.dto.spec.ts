import { describe, expect, it } from "bun:test";
import { ConfirmBookingDto, confirmBookingSchema } from "./confirm-booking.dto";

describe("ConfirmBookingDto Validation", () => {
  const getValidPayload = () => ({
    bookingId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    orderCode: 123456,
    paymentMethod: "PAYOS",
    transactionId: "TXN-123456789",
    amount: 200000,
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = confirmBookingSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ConfirmBookingDto.zodSchema).toBe(confirmBookingSchema);
    });
  });

  describe("bookingId field", () => {
    it("should fail validation when bookingId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), bookingId: "invalid-uuid" };
      expect(confirmBookingSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("orderCode field", () => {
    it("should fail validation when orderCode is not a positive integer", () => {
      expect(
        confirmBookingSchema.safeParse({ ...getValidPayload(), orderCode: 0 })
          .success,
      ).toBe(false);
      expect(
        confirmBookingSchema.safeParse({
          ...getValidPayload(),
          orderCode: -123,
        }).success,
      ).toBe(false);
    });
  });

  describe("paymentMethod field", () => {
    it("should pass validation when paymentMethod is one of the supported enum values", () => {
      const validMethods = [
        "MOMO",
        "VNPAY",
        "Credit_Card",
        "ShopeePay",
        "PAYOS",
      ];
      for (const method of validMethods) {
        const payload = { ...getValidPayload(), paymentMethod: method };
        expect(confirmBookingSchema.safeParse(payload).success).toBe(true);
      }
    });

    it("should fail validation when paymentMethod is not a supported enum value", () => {
      const payload = { ...getValidPayload(), paymentMethod: "BITCOIN" };
      expect(confirmBookingSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("transactionId field", () => {
    it("should fail validation when transactionId is empty string", () => {
      const payload = { ...getValidPayload(), transactionId: "" };
      expect(confirmBookingSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("amount field", () => {
    it("should fail validation when amount is non-positive or not an integer", () => {
      expect(
        confirmBookingSchema.safeParse({ ...getValidPayload(), amount: 0 })
          .success,
      ).toBe(false);
      expect(
        confirmBookingSchema.safeParse({ ...getValidPayload(), amount: -50000 })
          .success,
      ).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = { ...getValidPayload(), unexpectedKey: "invalid" };
      expect(confirmBookingSchema.safeParse(payload).success).toBe(false);
    });
  });
});
