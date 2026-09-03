import { describe, expect, it } from "bun:test";
import { ReserveSeatsDto, reserveSeatsSchema } from "./reserve-seats.dto";

describe("ReserveSeatsDto Validation", () => {
  const getValidPayload = () => ({
    showId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    seatIds: [
      "019fa8bc-8f4d-7000-b366-e691f45cfb01",
      "019fa8bc-8f4d-7000-b366-e691f45cfb02",
    ],
    voucherCode: "DISCOUNT50",
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = reserveSeatsSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(ReserveSeatsDto.zodSchema).toBe(reserveSeatsSchema);
    });
  });

  describe("showId field", () => {
    it("should fail validation when showId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), showId: "invalid-not-uuid" };
      expect(reserveSeatsSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("seatIds field", () => {
    it("should pass validation when seatIds array contains between 1 and 6 UUIDv7s", () => {
      const singleSeat = {
        ...getValidPayload(),
        seatIds: ["019fa8bc-8f4d-7000-b366-e691f45cfb01"],
      };
      expect(reserveSeatsSchema.safeParse(singleSeat).success).toBe(true);

      const maxSeats = {
        ...getValidPayload(),
        seatIds: [
          "019fa8bc-8f4d-7000-b366-e691f45cfb01",
          "019fa8bc-8f4d-7000-b366-e691f45cfb02",
          "019fa8bc-8f4d-7000-b366-e691f45cfb03",
          "019fa8bc-8f4d-7000-b366-e691f45cfb04",
          "019fa8bc-8f4d-7000-b366-e691f45cfb05",
          "019fa8bc-8f4d-7000-b366-e691f45cfb06",
        ],
      };
      expect(reserveSeatsSchema.safeParse(maxSeats).success).toBe(true);
    });

    it("should fail validation when seatIds array is empty", () => {
      const payload = { ...getValidPayload(), seatIds: [] };
      expect(reserveSeatsSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when seatIds array exceeds maximum limit of 6 seats", () => {
      const payload = {
        ...getValidPayload(),
        seatIds: [
          "019fa8bc-8f4d-7000-b366-e691f45cfb01",
          "019fa8bc-8f4d-7000-b366-e691f45cfb02",
          "019fa8bc-8f4d-7000-b366-e691f45cfb03",
          "019fa8bc-8f4d-7000-b366-e691f45cfb04",
          "019fa8bc-8f4d-7000-b366-e691f45cfb05",
          "019fa8bc-8f4d-7000-b366-e691f45cfb06",
          "019fa8bc-8f4d-7000-b366-e691f45cfb07",
        ],
      };
      expect(reserveSeatsSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when an element inside seatIds is not a valid UUIDv7 format", () => {
      const payload = {
        ...getValidPayload(),
        seatIds: [
          "019fa8bc-8f4d-7000-b366-e691f45cfb01",
          "invalid-uuid-element",
        ],
      };
      const result = reserveSeatsSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["seatIds", 1]);
      }
    });
  });

  describe("voucherCode field", () => {
    it("should pass validation when voucherCode is omitted", () => {
      const payload = {
        showId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        seatIds: ["019fa8bc-8f4d-7000-b366-e691f45cfb01"],
      };
      expect(reserveSeatsSchema.safeParse(payload).success).toBe(true);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = { ...getValidPayload(), unexpectedParam: "malicious" };
      expect(reserveSeatsSchema.safeParse(payload).success).toBe(false);
    });
  });
});
