import { describe, expect, it, mock } from "bun:test";
import { AnalyticsService } from "./analytics.service";
import type { DrizzleDB } from "@/database/database.module";
import type Redis from "ioredis";
import type { DashboardAnalyticsResponseDtoType } from "./dto";

interface QueryMockChain {
  from: () => QueryMockChain;
  where: () => QueryMockChain;
  innerJoin: () => QueryMockChain;
  leftJoin: () => QueryMockChain;
  groupBy: () => QueryMockChain;
  orderBy: () => QueryMockChain;
  limit: () => Promise<unknown>;
  then: (
    resolve: (val: unknown) => unknown,
    reject?: (err: unknown) => unknown,
  ) => Promise<unknown>;
}

describe("AnalyticsService", () => {
  const createMockDb = (responses: unknown[][]) => {
    let callIdx = 0;
    return {
      select: () => {
        const currentData = responses[callIdx] ?? [];
        callIdx++;

        const chain: QueryMockChain = {
          from: () => chain,
          where: () => chain,
          innerJoin: () => chain,
          leftJoin: () => chain,
          groupBy: () => chain,
          orderBy: () => chain,
          limit: () => Promise.resolve(currentData),
          then: (resolve, reject) =>
            Promise.resolve(currentData).then(resolve, reject),
        };
        return chain;
      },
    } as unknown as DrizzleDB;
  };

  it("should calculate and aggregate analytics when database contains orders", async () => {
    const mockDb = createMockDb([
      [{ totalRevenue: "500000000", totalOrders: "10" }], // 1. Current year orders
      [{ totalRevenue: "400000000", totalOrders: "8" }], // 2. Prev year orders
      [{ newCustomers: "15" }], // 3. Curr year customers
      [{ newCustomers: "10" }], // 4. Prev year customers
      [
        { month: 1, revenue: "200000000", orders: 4 },
        { month: 2, revenue: "300000000", orders: 6 },
      ], // 5. Monthly revenue
      [
        { categoryName: "Máy phát điện", revenue: "350000000" },
        { categoryName: "Phụ tùng", revenue: "150000000" },
      ], // 6. Category revenue
      [
        {
          id: "prod-1",
          name: "Máy phát 10kVA",
          price: "165000000",
          images: ["https://example.com/p1.jpg"],
          sold: 10,
        },
      ], // 7. Top products
    ]);

    const service = new AnalyticsService(mockDb);
    const result = await service.getDashboardAnalytics({ year: 2026 });

    expect(result.year).toBe(2026);
    expect(result.metrics.totalRevenue).toBe(500000000);
    expect(result.metrics.totalOrders).toBe(10);
    expect(result.metrics.averageOrderValue).toBe(50000000); // 500m / 10 orders
    expect(result.metrics.newCustomers).toBe(15);
    expect(result.metrics.revenueGrowth).toBe(25); // ((500 - 400) / 400) * 100
    expect(result.metrics.ordersGrowth).toBe(25); // ((10 - 8) / 8) * 100
    expect(result.metrics.aovGrowth).toBe(0); // 50m vs (400m / 8 = 50m) -> 0%
    expect(result.metrics.customersGrowth).toBe(50); // ((15 - 10) / 10) * 100

    expect(result.monthlyRevenue).toHaveLength(12);
    expect(result.monthlyRevenue[0]?.month).toBe(1);
    expect(result.monthlyRevenue[0]?.revenue).toBe(200000000);
    expect(result.monthlyRevenue[0]?.orders).toBe(4);
    expect(result.monthlyRevenue[1]?.month).toBe(2);
    expect(result.monthlyRevenue[1]?.revenue).toBe(300000000);
    expect(result.monthlyRevenue[2]?.revenue).toBe(0);

    expect(result.categoryDistribution).toHaveLength(2);
    expect(result.categoryDistribution[0]?.category).toBe("Máy phát điện");
    expect(result.categoryDistribution[0]?.share).toBe(70);

    expect(result.topProducts).toHaveLength(1);
    expect(result.topProducts[0]?.name).toBe("Máy phát 10kVA");
  });

  it("should handle empty database gracefully with zero metrics", async () => {
    const mockDb = createMockDb([[], [], [], [], [], [], []]);

    const service = new AnalyticsService(mockDb);
    const result = await service.getDashboardAnalytics({});

    const currentYear = new Date().getFullYear();
    expect(result.year).toBe(currentYear);
    expect(result.metrics.totalRevenue).toBe(0);
    expect(result.metrics.totalOrders).toBe(0);
    expect(result.metrics.averageOrderValue).toBe(0);
    expect(result.metrics.revenueGrowth).toBe(0);
    expect(result.metrics.aovGrowth).toBe(0);
    expect(result.monthlyRevenue).toHaveLength(12);
    expect(result.monthlyRevenue[0]?.revenue).toBe(0);
    expect(result.categoryDistribution).toHaveLength(0);
    expect(result.topProducts).toHaveLength(0);
  });

  it("should serve cached result from Redis without executing database queries on cache hit", async () => {
    const cachedData: DashboardAnalyticsResponseDtoType = {
      year: 2026,
      metrics: {
        totalRevenue: 888000000,
        totalOrders: 40,
        averageOrderValue: 22200000,
        newCustomers: 20,
        revenueGrowth: 30,
        ordersGrowth: 20,
        aovGrowth: 8.3,
        customersGrowth: 10,
      },
      monthlyRevenue: [
        { year: 2026, month: 1, revenue: 888000000, orders: 40 },
      ],
      categoryDistribution: [
        { category: "Máy phát điện", revenue: 888000000, share: 100 },
      ],
      topProducts: [],
    };

    const getMock = mock(() => Promise.resolve(JSON.stringify(cachedData)));
    const setMock = mock(() => Promise.resolve("OK"));
    const selectMock = mock(() => {
      throw new Error("Database should not be queried on cache hit");
    });

    const mockRedis = {
      get: getMock,
      set: setMock,
    } as unknown as Redis;

    const mockDb = {
      select: selectMock,
    } as unknown as DrizzleDB;

    const service = new AnalyticsService(mockDb, mockRedis);
    const result = await service.getDashboardAnalytics({ year: 2026 });

    expect(result).toEqual(cachedData);
    expect(getMock).toHaveBeenCalledWith("analytics:dashboard:2026:vi");
    expect(selectMock).not.toHaveBeenCalled();
  });

  it("should write to Redis cache on cache miss", async () => {
    const mockDb = createMockDb([[], [], [], [], [], [], []]);
    const getMock = mock(() => Promise.resolve(null));
    const setMock = mock(() => Promise.resolve("OK"));

    const mockRedis = {
      get: getMock,
      set: setMock,
    } as unknown as Redis;

    const service = new AnalyticsService(mockDb, mockRedis);
    const result = await service.getDashboardAnalytics({ year: 2026 });

    expect(result.year).toBe(2026);
    expect(getMock).toHaveBeenCalledWith("analytics:dashboard:2026:vi");
    expect(setMock).toHaveBeenCalledWith(
      "analytics:dashboard:2026:vi",
      JSON.stringify(result),
      "EX",
      60,
    );
  });

  it("should fail-open and query database when Redis throws an error", async () => {
    const mockDb = createMockDb([[], [], [], [], [], [], []]);
    const getMock = mock(() =>
      Promise.reject(new Error("Redis connection refused")),
    );

    const mockRedis = {
      get: getMock,
      set: mock(() => Promise.resolve("OK")),
    } as unknown as Redis;

    const service = new AnalyticsService(mockDb, mockRedis);
    const result = await service.getDashboardAnalytics({ year: 2026 });

    expect(result.year).toBe(2026);
    expect(result.metrics.totalRevenue).toBe(0);
  });
});
