import { describe, expect, it } from "bun:test";
import {
  CreateShowBatchDto,
  createShowBatchSchema,
} from "./create-show-batch.dto";

describe("CreateShowBatchDto Validation", () => {
  const getValidPayload = () => ({
    movieId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
    hallId: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    timeSlots: ["10:00", "14:30", "19:00"],
    basePrice: 100000,
  });

  describe("Schema Integrity", () => {
    it("should successfully validate and expose static zodSchema when payload is valid", () => {
      const valid = getValidPayload();
      const result = createShowBatchSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(CreateShowBatchDto.zodSchema).toBe(createShowBatchSchema);
    });
  });

  describe("movieId and hallId fields", () => {
    it("should fail validation when movieId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), movieId: "invalid-uuid" };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when hallId is not a valid UUIDv7 format", () => {
      const payload = { ...getValidPayload(), hallId: "invalid-uuid" };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("startDate and endDate fields", () => {
    it("should fail validation when startDate is not in YYYY-MM-DD format", () => {
      const payload = { ...getValidPayload(), startDate: "01-09-2026" };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when endDate is not in YYYY-MM-DD format", () => {
      const payload = { ...getValidPayload(), endDate: "2026/09/03" };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("timeSlots field", () => {
    it("should pass validation when timeSlots are valid 24-hour HH:mm formats", () => {
      const payload = {
        ...getValidPayload(),
        timeSlots: ["00:00", "09:30", "15:45", "23:59"],
      };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(true);
    });

    it("should fail validation when timeSlots array is empty", () => {
      const payload = { ...getValidPayload(), timeSlots: [] };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when timeSlots array exceeds MAX_SLOTS_PER_DAY (10 slots)", () => {
      const payload = {
        ...getValidPayload(),
        timeSlots: [
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
        ],
      };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });

    it("should fail validation when an element inside timeSlots has invalid hour or minute format", () => {
      const invalidSlots = ["24:00", "12:60", "9:00", "invalid", "10:000"];
      for (const slot of invalidSlots) {
        const payload = {
          ...getValidPayload(),
          timeSlots: ["10:00", slot],
        };
        const result = createShowBatchSchema.safeParse(payload);
        expect(result.success).toBe(false);
      }
    });

    it("should format nested array error with exact bracket notation index (timeSlots[2])", () => {
      const payload = {
        ...getValidPayload(),
        timeSlots: ["10:00", "14:00", "invalid-slot"],
      };
      const result = createShowBatchSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue).toBeDefined();
        if (issue) {
          expect(issue.path).toEqual(["timeSlots", 2]);
        }
      }
    });
  });

  describe("basePrice field", () => {
    it("should pass validation when basePrice is a non-negative integer", () => {
      expect(
        createShowBatchSchema.safeParse({ ...getValidPayload(), basePrice: 0 })
          .success,
      ).toBe(true);
    });

    it("should fail validation when basePrice is negative", () => {
      const payload = { ...getValidPayload(), basePrice: -100 };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("strictness controls", () => {
    it("should fail validation when unrecognized keys are present in payload", () => {
      const payload = { ...getValidPayload(), unknownParam: "forbidden" };
      expect(createShowBatchSchema.safeParse(payload).success).toBe(false);
    });
  });
});
