import "reflect-metadata";
import { describe, expect, test, mock } from "bun:test";
import { AnalyticsController } from "./analytics.controller";
import type { AnalyticsService } from "./analytics.service";
import type { DashboardAnalyticsResponseDtoType } from "./dto";

describe("AnalyticsController", () => {
  const mockAnalyticsData: DashboardAnalyticsResponseDtoType = {
    year: 2026,
    metrics: {
      totalRevenue: 500000000,
      totalOrders: 25,
      totalProducts: 92,
      newCustomers: 10,
      revenueGrowth: 15.5,
      ordersGrowth: 10.2,
      customersGrowth: 5.0,
    },
    monthlyRevenue: [{ year: 2026, month: 1, revenue: 50000000, orders: 3 }],
    categoryDistribution: [
      { category: "Máy phát điện", revenue: 300000000, share: 60 },
    ],
    topProducts: [
      {
        id: "prod-1",
        name: "Máy phát điện Diesel 10kVA",
        sold: 10,
        price: "165000000",
      },
    ],
  };

  const mockAnalyticsService = {
    getDashboardAnalytics: mock(() => Promise.resolve(mockAnalyticsData)),
  } as unknown as AnalyticsService;

  const controller = new AnalyticsController(mockAnalyticsService);

  test("should return wrapped API response with analytics data", async () => {
    const response = await controller.getDashboardAnalytics({ year: 2026 });

    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockAnalyticsData);
    expect(response.data.year).toBe(2026);
    expect(response.data.metrics.totalRevenue).toBe(500000000);
  });
});
