import { describe, expect, it } from "bun:test";
import { v7 as uuidv7 } from "uuid";
import { TIME_IN_MS } from "@/common/constants/time.constant";
import {
  formatTimezoneDate,
  getFutureTimezoneDate,
} from "@/common/utils/date.util";
import { SHOWS_CONSTANTS } from "../shows.constants";
import {
  ShowScheduleQueryDto,
  showScheduleQuerySchema,
} from "./show-schedule-query.dto";

describe("ShowScheduleQueryDto Validation", () => {
  const todayDateStr = formatTimezoneDate(
    new Date(),
    SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
  );

  describe("zodSchema", () => {
    describe("when verifying schema integrity", () => {
      it("should expose static zodSchema matching showScheduleQuerySchema when inspected", () => {
        expect(ShowScheduleQueryDto.zodSchema).toBe(showScheduleQuerySchema);
      });
    });

    describe("when validating default values", () => {
      it("should populate default date to today in Vietnam timezone and default lang to vi when given empty query", () => {
        const result = showScheduleQuerySchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.date).toBe(todayDateStr);
          expect(result.data.lang).toBe("vi");
          expect(result.data.movieId).toBeUndefined();
          expect(result.data.cinemaId).toBeUndefined();
        }
      });
    });

    describe("when validating calendar date horizon", () => {
      it("should accept valid date strings within [today .. today + 14d] window when date is in allowed range", () => {
        const todayResult = showScheduleQuerySchema.safeParse({
          date: todayDateStr,
        });
        expect(todayResult.success).toBe(true);

        const day7Str = getFutureTimezoneDate(
          7,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const day7Result = showScheduleQuerySchema.safeParse({ date: day7Str });
        expect(day7Result.success).toBe(true);

        const day14Str = getFutureTimezoneDate(
          14,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const day14Result = showScheduleQuerySchema.safeParse({
          date: day14Str,
        });
        expect(day14Result.success).toBe(true);
        if (day14Result.success) {
          expect(day14Result.data.date).toBe(day14Str);
        }
      });

      it("should reject date with shows.DATE_PAST error when date is in the past", () => {
        const pastDate = new Date(Date.now() - TIME_IN_MS.DAY);
        const pastDateStr = formatTimezoneDate(
          pastDate,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const result = showScheduleQuerySchema.safeParse({ date: pastDateStr });

        expect(result.success).toBe(false);
        if (!result.success) {
          let hasDatePast = false;
          for (const issue of result.error.issues) {
            if (
              issue.path.includes("date") &&
              issue.message.includes("shows.DATE_PAST")
            ) {
              hasDatePast = true;
              break;
            }
          }
          expect(hasDatePast).toBe(true);
        }
      });

      it("should reject date with shows.DATE_HORIZON_EXCEEDED error when date is beyond 14 days in the future", () => {
        const farFutureDateStr = getFutureTimezoneDate(
          15,
          SHOWS_CONSTANTS.DEFAULT_TIMEZONE,
        );
        const result = showScheduleQuerySchema.safeParse({
          date: farFutureDateStr,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          let hasHorizonExceeded = false;
          for (const issue of result.error.issues) {
            if (
              issue.path.includes("date") &&
              issue.message.includes("shows.DATE_HORIZON_EXCEEDED")
            ) {
              hasHorizonExceeded = true;
              break;
            }
          }
          expect(hasHorizonExceeded).toBe(true);
        }
      });

      it("should reject malformed date strings when date format is not ISO YYYY-MM-DD", () => {
        expect(
          showScheduleQuerySchema.safeParse({ date: "02/09/2026" }).success,
        ).toBe(false);
        expect(
          showScheduleQuerySchema.safeParse({ date: "2026/09/02" }).success,
        ).toBe(false);
        expect(
          showScheduleQuerySchema.safeParse({ date: "today" }).success,
        ).toBe(false);
        expect(
          showScheduleQuerySchema.safeParse({ date: "2026-02-30" }).success,
        ).toBe(false);
      });
    });

    describe("when validating entity filter identifiers", () => {
      it("should accept valid RFC 9562 UUIDv7 strings when movieId and cinemaId are provided", () => {
        const validMovieId = uuidv7();
        const validCinemaId = uuidv7();
        const result = showScheduleQuerySchema.safeParse({
          movieId: validMovieId,
          cinemaId: validCinemaId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.movieId).toBe(validMovieId);
          expect(result.data.cinemaId).toBe(validCinemaId);
        }
      });

      it("should reject malformed UUID strings with validation.isUuid error when movieId or cinemaId format is invalid", () => {
        const invalidMovieResult = showScheduleQuerySchema.safeParse({
          movieId: "not-a-valid-uuid",
        });
        expect(invalidMovieResult.success).toBe(false);
        if (!invalidMovieResult.success) {
          let hasUuidError = false;
          for (const issue of invalidMovieResult.error.issues) {
            if (
              issue.path.includes("movieId") &&
              issue.message.includes("validation.isUuid")
            ) {
              hasUuidError = true;
              break;
            }
          }
          expect(hasUuidError).toBe(true);
        }

        const invalidCinemaResult = showScheduleQuerySchema.safeParse({
          cinemaId: "12345",
        });
        expect(invalidCinemaResult.success).toBe(false);
        if (!invalidCinemaResult.success) {
          let hasUuidError = false;
          for (const issue of invalidCinemaResult.error.issues) {
            if (
              issue.path.includes("cinemaId") &&
              issue.message.includes("validation.isUuid")
            ) {
              hasUuidError = true;
              break;
            }
          }
          expect(hasUuidError).toBe(true);
        }
      });
    });

    describe("when validating localization language", () => {
      it("should accept supported language codes when lang is vi or en", () => {
        const viResult = showScheduleQuerySchema.safeParse({ lang: "vi" });
        expect(viResult.success).toBe(true);
        if (viResult.success) {
          expect(viResult.data.lang).toBe("vi");
        }

        const enResult = showScheduleQuerySchema.safeParse({ lang: "en" });
        expect(enResult.success).toBe(true);
        if (enResult.success) {
          expect(enResult.data.lang).toBe("en");
        }
      });

      it("should reject unsupported language codes when lang is outside enum values", () => {
        const result = showScheduleQuerySchema.safeParse({ lang: "fr" });
        expect(result.success).toBe(false);
      });
    });

    describe("when encountering unrecognized query parameters", () => {
      it("should reject payload with unrecognized_keys issue when extraneous query parameters are passed", () => {
        const result = showScheduleQuerySchema.safeParse({
          date: todayDateStr,
          unrecognizedParam: "malicious_payload",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          let hasUnrecognized = false;
          for (const issue of result.error.issues) {
            if (issue.code === "unrecognized_keys") {
              hasUnrecognized = true;
              break;
            }
          }
          expect(hasUnrecognized).toBe(true);
        }
      });
    });
  });
});
