import { describe, expect, it } from "bun:test";
import {
  parseDuration,
  getExpiryDate,
  getPastDate,
  minutesToMs,
  daysToMs,
  getTimezoneDateParts,
  formatTimezoneDate,
  getFutureTimezoneDate,
  getTimezoneDayRange,
} from "./date.util";
import { TIME_IN_MS } from "@/common/constants/time.constant";

describe("Date Utilities", () => {
  describe("parseDuration", () => {
    it("should return milliseconds when duration unit is days", () => {
      expect(parseDuration("7d")).toBe(7 * TIME_IN_MS.DAY);
    });

    it("should return milliseconds when duration unit is hours", () => {
      expect(parseDuration("2h")).toBe(2 * TIME_IN_MS.HOUR);
    });

    it("should return milliseconds when duration unit is minutes", () => {
      expect(parseDuration("15m")).toBe(15 * TIME_IN_MS.MINUTE);
    });

    it("should return milliseconds when duration unit is seconds", () => {
      expect(parseDuration("30s")).toBe(30 * TIME_IN_MS.SECOND);
    });

    it("should return default milliseconds when input is not a number", () => {
      expect(parseDuration("abc")).toBe(7 * TIME_IN_MS.DAY);
    });

    it("should return default milliseconds when unit is unrecognized", () => {
      expect(parseDuration("10x")).toBe(7 * TIME_IN_MS.DAY);
    });

    it("should return custom default milliseconds when fallback is provided", () => {
      expect(parseDuration("invalid", 1000)).toBe(1000);
    });
  });

  describe("getExpiryDate", () => {
    it("should return future date for duration", () => {
      const now = Date.now();
      const expiry = getExpiryDate("15m");
      const diff = expiry.getTime() - now;
      expect(diff).toBeGreaterThanOrEqual(15 * TIME_IN_MS.MINUTE - 100);
      expect(diff).toBeLessThanOrEqual(15 * TIME_IN_MS.MINUTE + 100);
    });

    it("should use default fallback when duration is invalid", () => {
      const now = Date.now();
      const expiry = getExpiryDate("invalid");
      const diff = expiry.getTime() - now;
      expect(diff).toBeGreaterThanOrEqual(7 * TIME_IN_MS.DAY - 100);
    });
  });

  describe("getPastDate", () => {
    it("should return past date for duration", () => {
      const now = Date.now();
      const past = getPastDate("15m");
      const diff = now - past.getTime();
      expect(diff).toBeGreaterThanOrEqual(15 * TIME_IN_MS.MINUTE - 100);
      expect(diff).toBeLessThanOrEqual(15 * TIME_IN_MS.MINUTE + 100);
    });

    it("should use default fallback when duration is invalid", () => {
      const now = Date.now();
      const past = getPastDate("invalid");
      const diff = now - past.getTime();
      expect(diff).toBeGreaterThanOrEqual(7 * TIME_IN_MS.DAY - 100);
    });
  });

  describe("minutesToMs and daysToMs", () => {
    it("should convert minutes to milliseconds", () => {
      expect(minutesToMs(5)).toBe(5 * TIME_IN_MS.MINUTE);
    });

    it("should convert days to milliseconds", () => {
      expect(daysToMs(3)).toBe(3 * TIME_IN_MS.DAY);
    });
  });

  describe("getTimezoneDateParts", () => {
    it("should extract year, month, and day in target timezone", () => {
      const date = new Date("2026-09-02T18:00:00.000Z"); // 01:00 AM Sept 3 in Asia/Ho_Chi_Minh (+7)
      const parts = getTimezoneDateParts(date, "Asia/Ho_Chi_Minh");
      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(9);
      expect(parts.day).toBe(3);
    });

    it("should use default date and timezone when parameters are omitted", () => {
      const parts = getTimezoneDateParts();
      expect(parts.year).toBeGreaterThanOrEqual(2024);
      expect(parts.month).toBeGreaterThanOrEqual(1);
      expect(parts.day).toBeGreaterThanOrEqual(1);
    });
  });

  describe("formatTimezoneDate", () => {
    it("should format date as YYYY-MM-DD in target timezone", () => {
      const date = new Date("2026-09-02T18:00:00.000Z");
      expect(formatTimezoneDate(date, "Asia/Ho_Chi_Minh")).toBe("2026-09-03");
    });

    it("should use default parameters when omitted", () => {
      expect(formatTimezoneDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getFutureTimezoneDate", () => {
    it("should compute formatted future calendar date", () => {
      const futureDateStr = getFutureTimezoneDate(7, "Asia/Ho_Chi_Minh");
      expect(futureDateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should use default timezone when omitted", () => {
      const futureDateStr = getFutureTimezoneDate(1);
      expect(futureDateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getTimezoneDayRange", () => {
    it("should compute exact UTC start and end bounds for Asia/Ho_Chi_Minh calendar day", () => {
      const { startUtc, endUtc } = getTimezoneDayRange(
        "2026-09-02",
        "Asia/Ho_Chi_Minh",
      );
      expect(startUtc.toISOString()).toBe("2026-09-01T17:00:00.000Z");
      expect(endUtc.toISOString()).toBe("2026-09-02T16:59:59.999Z");
    });

    it("should compute UTC bounds for other timezones", () => {
      const { startUtc, endUtc } = getTimezoneDayRange("2026-09-02", "UTC");
      expect(startUtc.toISOString()).toBe("2026-09-02T00:00:00.000Z");
      expect(endUtc.toISOString()).toBe("2026-09-02T23:59:59.999Z");
    });
  });
});
