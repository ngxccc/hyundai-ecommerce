import { describe, expect, it } from "bun:test";
import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe, formatZodIssuePath } from "./zod-validation.pipe";

describe("ZodValidationPipe Specification", () => {
  describe("formatZodIssuePath", () => {
    it("should format single field name without alterations", () => {
      expect(formatZodIssuePath(["email"])).toBe("email");
    });

    it("should format array index with bracket notation", () => {
      expect(formatZodIssuePath(["timeSlots", 2])).toBe("timeSlots[2]");
    });

    it("should format nested object fields with dot notation", () => {
      expect(formatZodIssuePath(["customer", "address", "city"])).toBe(
        "customer.address.city",
      );
    });

    it("should format arrays of objects combining bracket and dot notation", () => {
      expect(formatZodIssuePath(["seats", 1, "seatCode"])).toBe(
        "seats[1].seatCode",
      );
    });
  });

  describe("ZodValidationPipe with Explicit Schema", () => {
    const testSchema = z
      .object({
        email: z.email(),
        timeSlots: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
        profile: z.object({
          age: z.number().min(18),
        }),
      })
      .strict();

    const pipe = new ZodValidationPipe(testSchema);

    it("should return validated data when payload satisfies schema", () => {
      const validPayload = {
        email: "test@example.com",
        timeSlots: ["10:00", "14:00"],
        profile: {
          age: 25,
        },
      };

      const result = pipe.transform(validPayload, {
        type: "body",
      });

      expect(result).toEqual(validPayload);
    });

    it("should throw BadRequestException with RFC 9457 invalidParams when payload is invalid", () => {
      const invalidPayload = {
        email: "invalid-email",
        timeSlots: ["10:00", "invalid_time"],
        profile: {
          age: 15,
        },
      };

      try {
        pipe.transform(invalidPayload, { type: "body" });
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const response = (err as BadRequestException).getResponse() as {
          detail: string;
          invalidParams: { name: string; reason: string }[];
        };
        expect(response.detail).toBe("common.INVALID_INPUT|{}");
        expect(Array.isArray(response.invalidParams)).toBe(true);

        const paramNames = response.invalidParams.map((p) => p.name);
        expect(paramNames).toContain("email");
        expect(paramNames).toContain("timeSlots[1]");
        expect(paramNames).toContain("profile.age");
      }
    });

    it("should reject payload with unrecognized keys when schema is strict", () => {
      const payloadWithExtra = {
        email: "test@example.com",
        timeSlots: ["10:00"],
        profile: { age: 20 },
        unrecognizedKey: "malicious_payload",
      };

      try {
        pipe.transform(payloadWithExtra, { type: "body" });
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const response = (err as BadRequestException).getResponse() as {
          invalidParams: { name: string; reason: string }[];
        };
        const extraParam = response.invalidParams.find(
          (p) => p.name === "unrecognizedKey",
        );
        expect(extraParam).toBeDefined();
      }
    });
  });

  describe("ZodValidationPipe with Metatype Inference", () => {
    class MockDtoWithZodSchema {
      public static readonly zodSchema = z.object({
        username: z.string().min(3),
      });

      public username!: string;
    }

    const pipe = new ZodValidationPipe();

    it("should extract static zodSchema from metatype and validate successfully", () => {
      const result = pipe.transform(
        { username: "alex123" },
        { type: "body", metatype: MockDtoWithZodSchema },
      );

      expect(result).toEqual({ username: "alex123" });
    });

    it("should pass through raw value untouched when metatype has no schema", () => {
      class RegularClassWithoutSchema {
        public readonly dummy = true;
      }
      const raw = { foo: "bar" };
      const result = pipe.transform(raw, {
        type: "body",
        metatype: RegularClassWithoutSchema,
      });

      expect(result).toBe(raw);
    });
  });
});
