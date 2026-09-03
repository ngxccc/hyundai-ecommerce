import { describe, expect, it } from "bun:test";
import { CreateShowDto, createShowSchema } from "./create-show.dto";

describe("CreateShowDto Validation", () => {
  const getValidPayload = () => ({
    movieId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    hallId: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    startTime: "2026-09-01T10:00:00.000Z",
    basePrice: 100000,
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = createShowSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(CreateShowDto.zodSchema).toBe(createShowSchema);
    });
  });

  describe("movieId field", () => {
    it("should fail validation when movieId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), movieId: "invalid-uuid" };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("hallId field", () => {
    it("should fail validation when hallId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), hallId: "invalid-uuid" };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("startTime field", () => {
    it("should fail validation when startTime is not a valid ISO 8601 timestamp", () => {
      const payload = {
        ...getValidPayload(),
        startTime: "invalid-date-string",
      };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("basePrice field", () => {
    it("should pass validation when basePrice is non-negative integer", () => {
      expect(
        createShowSchema.safeParse({ ...getValidPayload(), basePrice: 0 })
          .success,
      ).toBe(true);
      expect(
        createShowSchema.safeParse({ ...getValidPayload(), basePrice: 150000 })
          .success,
      ).toBe(true);
    });

    it("should fail validation when basePrice is negative", () => {
      const payload = { ...getValidPayload(), basePrice: -1 };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when basePrice is not an integer", () => {
      const payload = { ...getValidPayload(), basePrice: 99.99 };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = { ...getValidPayload(), unexpectedKey: "disallowed" };
      expect(createShowSchema.safeParse(payload).success).toBe(false);
    });
  });
});
