import { describe, expect, it } from "bun:test";
import {
  getAvailableYears,
  aggregateRevenueByMonth,
  aggregateRevenueByDays,
  formatMonthLabel,
} from "./analytics";
import type { AdminOrder } from "@/types/api";

describe("Dashboard Analytics Utilities", () => {
  describe("getAvailableYears", () => {
    it("should extract unique descending years from order creation timestamps", () => {
      const currentYear = new Date().getFullYear();
      const mockOrders = [
        { createdAt: "2026-03-01T00:00:00.000Z" },
        { createdAt: "2025-05-10T00:00:00.000Z" },
        { createdAt: "2024-11-20T00:00:00.000Z" },
      ] as unknown as AdminOrder[];

      const years = getAvailableYears(mockOrders);

      expect(years).toContain(2026);
      expect(years).toContain(2025);
      expect(years).toContain(2024);
      expect(years).toContain(currentYear);
      expect(years[0]).toBeGreaterThanOrEqual(years[1] ?? 0);
    });

    it("should return active calendar year when order list is empty", () => {
      const currentYear = new Date().getFullYear();
      const years = getAvailableYears([]);

      expect(years).toEqual([currentYear]);
    });
  });

  describe("formatMonthLabel", () => {
    it("should format Vietnamese month labels as T1..T12", () => {
      expect(formatMonthLabel(1, "vi")).toBe("T1");
      expect(formatMonthLabel(12, "vi")).toBe("T12");
      expect(formatMonthLabel("T5", "vi")).toBe("T5");
    });

    it("should format English month labels as Jan..Dec", () => {
      expect(formatMonthLabel(1, "en")).toBe("Jan");
      expect(formatMonthLabel(2, "en")).toBe("Feb");
      expect(formatMonthLabel(12, "en")).toBe("Dec");
      expect(formatMonthLabel("T1", "en")).toBe("Jan");
    });
  });

  describe("aggregateRevenueByMonth", () => {
    it("should aggregate total amount and count for matching months in target year", () => {
      const mockOrders = [
        {
          createdAt: "2026-01-10T10:00:00.000Z",
          totalAmount: 150000000,
        },
        {
          createdAt: "2026-01-20T10:00:00.000Z",
          totalAmount: 50000000,
        },
        {
          createdAt: "2026-03-05T10:00:00.000Z",
          totalAmount: 80000000,
        },
        {
          createdAt: "2025-01-15T10:00:00.000Z", // Different year, should be ignored
          totalAmount: 99999999,
        },
      ] as unknown as AdminOrder[];

      const result = aggregateRevenueByMonth(mockOrders, 2026);

      expect(result).toHaveLength(12);
      expect(result[0]?.month).toBe(1);
      expect(result[0]?.revenue).toBe(200000000);
      expect(result[0]?.orders).toBe(2);

      expect(result[2]?.month).toBe(3);
      expect(result[2]?.revenue).toBe(80000000);
      expect(result[2]?.orders).toBe(1);

      expect(result[1]?.month).toBe(2);
      expect(result[1]?.revenue).toBe(0);
      expect(result[1]?.orders).toBe(0);
    });

    it("should return honest zero values when no orders exist for target year", () => {
      const result = aggregateRevenueByMonth([], 2026);

      expect(result).toHaveLength(12);
      expect(result[0]?.year).toBe(2026);
      expect(result[0]?.revenue).toBe(0);
      expect(result[0]?.orders).toBe(0);
      expect(result[11]?.month).toBe(12);
      expect(result[11]?.revenue).toBe(0);
    });
  });

  describe("aggregateRevenueByDays", () => {
    it("should generate 7 daily points with honest zeros when order list is empty", () => {
      const result = aggregateRevenueByDays([], 7);

      expect(result).toHaveLength(7);
      expect(result[0]?.revenue).toBe(0);
      expect(result[0]?.orders).toBe(0);
    });

    it("should generate 30 daily points for 30d range", () => {
      const result = aggregateRevenueByDays([], 30);

      expect(result).toHaveLength(30);
      expect(result[0]?.revenue).toBe(0);
      expect(result[0]?.orders).toBe(0);
    });
  });
});
