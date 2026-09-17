import {
  Inject,
  Injectable,
  Optional,
  type OnModuleDestroy,
} from "@nestjs/common";
import { aliasedTable, and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type Redis from "ioredis";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  categories,
  categoryTranslations,
  orders,
  orderItems,
  products,
  productTranslations,
  users,
} from "@/database/schemas";
import { createRedisClient } from "@/config/redis.config";
import { env } from "@/env";
import type {
  DashboardAnalyticsQueryDtoType,
  DashboardAnalyticsResponseDtoType,
} from "./dto";
import {
  ANALYTICS_CACHE,
  buildAnalyticsCacheKey,
  calcGrowth,
  getYearBounds,
  toSafeNumber,
} from "./analytics.constant";

const viCategoryTranslations = aliasedTable(
  categoryTranslations,
  "vi_category_translations",
);

const viProductTranslations = aliasedTable(
  productTranslations,
  "vi_product_translations",
);

/**
 * Domain service computing consolidated business metrics, monthly revenue aggregations,
 * category distributions, and top selling products for enterprise dashboard views.
 * Implements a multi-layered caching strategy backed by Redis and PostgreSQL aggregations.
 */
@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly redisClient?: Redis;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    @Optional()
    redisClient?: Redis,
  ) {
    if (redisClient) {
      this.redisClient = redisClient;
    } else if (env.NODE_ENV !== "test") {
      try {
        this.redisClient = createRedisClient();
        this.redisClient.on("error", () => undefined);
      } catch {
        // Fail-open strategy: proceed with un-cached PostgreSQL execution if Redis fails to initialize.
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisClient?.quit();
    } catch {
      // Ignore disconnect errors during process teardown.
    }
  }

  /**
   * Computes consolidated dashboard analytics for the specified calendar year and locale.
   * Checks the Redis cache first; on cache miss, executes parallel analytical SQL queries
   * with multi-tier translation fallbacks (requested locale -> "vi" -> slug) and populates the cache.
   *
   * @param query - Query filter containing target calendar year and optional locale
   * @returns Consolidated analytics response containing metrics, time series, category breakdown, and top products
   */
  async getDashboardAnalytics(
    query: DashboardAnalyticsQueryDtoType,
  ): Promise<DashboardAnalyticsResponseDtoType> {
    const targetYear = query.year ?? new Date().getFullYear();
    const targetLocale = query.locale ?? "vi";
    const cacheKey = buildAnalyticsCacheKey(targetYear, targetLocale);

    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached) as DashboardAnalyticsResponseDtoType;
        }
      } catch {
        // Fail-open resilience: proceed to database computation when Redis encounters network faults.
      }
    }

    const currYearRange = getYearBounds(targetYear);
    const prevYearRange = getYearBounds(targetYear - 1);

    // Execute independent analytical aggregations in parallel to minimize overall HTTP latency.
    const [
      currYearOrdersRes,
      prevYearOrdersRes,
      productsCountRes,
      currYearUsersRes,
      prevYearUsersRes,
      monthlyRevenueRes,
      categoryRevenueRes,
      topProductsRes,
    ] = await Promise.all([
      this.db
        .select({
          totalRevenue: sql<
            string | number
          >`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
          totalOrders: sql<string | number>`count(${orders.id})`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, currYearRange.start),
            lte(orders.createdAt, currYearRange.end),
          ),
        ),

      this.db
        .select({
          totalRevenue: sql<
            string | number
          >`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
          totalOrders: sql<string | number>`count(${orders.id})`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, prevYearRange.start),
            lte(orders.createdAt, prevYearRange.end),
          ),
        ),

      this.db
        .select({
          totalProducts: sql<string | number>`count(${products.id})`,
        })
        .from(products),

      this.db
        .select({
          newCustomers: sql<string | number>`count(${users.id})`,
        })
        .from(users)
        .where(
          and(
            gte(users.createdAt, currYearRange.start),
            lte(users.createdAt, currYearRange.end),
          ),
        ),

      this.db
        .select({
          newCustomers: sql<string | number>`count(${users.id})`,
        })
        .from(users)
        .where(
          and(
            gte(users.createdAt, prevYearRange.start),
            lte(users.createdAt, prevYearRange.end),
          ),
        ),

      this.db
        .select({
          month: sql<
            string | number
          >`extract(month from ${orders.createdAt})::int`,
          revenue: sql<
            string | number
          >`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
          orders: sql<string | number>`count(${orders.id})::int`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, currYearRange.start),
            lte(orders.createdAt, currYearRange.end),
          ),
        )
        .groupBy(sql`extract(month from ${orders.createdAt})`)
        .orderBy(sql`extract(month from ${orders.createdAt})`),

      this.db
        .select({
          categoryName: sql<string>`coalesce(${categoryTranslations.name}, ${viCategoryTranslations.name}, ${categories.slug})`,
          revenue: sql<
            string | number
          >`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}::numeric), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.locale, targetLocale),
          ),
        )
        .leftJoin(
          viCategoryTranslations,
          and(
            eq(viCategoryTranslations.categoryId, categories.id),
            eq(viCategoryTranslations.locale, "vi"),
          ),
        )
        .where(
          and(
            gte(orders.createdAt, currYearRange.start),
            lte(orders.createdAt, currYearRange.end),
          ),
        )
        .groupBy(
          categories.id,
          categories.slug,
          categoryTranslations.name,
          viCategoryTranslations.name,
        )
        .orderBy(
          desc(
            sql`sum(${orderItems.quantity} * ${orderItems.unitPrice}::numeric)`,
          ),
        ),

      this.db
        .select({
          id: products.id,
          name: sql<string>`coalesce(${productTranslations.name}, ${viProductTranslations.name}, ${products.slug})`,
          price: sql<string>`${products.price}::text`,
          images: products.images,
          sold: sql<
            string | number
          >`coalesce(sum(${orderItems.quantity}), 0)::int`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.locale, targetLocale),
          ),
        )
        .leftJoin(
          viProductTranslations,
          and(
            eq(viProductTranslations.productId, products.id),
            eq(viProductTranslations.locale, "vi"),
          ),
        )
        .where(
          and(
            gte(orders.createdAt, currYearRange.start),
            lte(orders.createdAt, currYearRange.end),
          ),
        )
        .groupBy(
          products.id,
          products.slug,
          products.price,
          products.images,
          productTranslations.name,
          viProductTranslations.name,
        )
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5),
    ]);

    const currTotalRev = toSafeNumber(currYearOrdersRes[0]?.totalRevenue);
    const prevTotalRev = toSafeNumber(prevYearOrdersRes[0]?.totalRevenue);
    const currTotalOrders = toSafeNumber(currYearOrdersRes[0]?.totalOrders);
    const prevTotalOrders = toSafeNumber(prevYearOrdersRes[0]?.totalOrders);
    const totalProducts = toSafeNumber(productsCountRes[0]?.totalProducts);
    const currNewCust = toSafeNumber(currYearUsersRes[0]?.newCustomers);
    const prevNewCust = toSafeNumber(prevYearUsersRes[0]?.newCustomers);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const found = monthlyRevenueRes.find((m) => Number(m.month) === monthNum);
      return {
        year: targetYear,
        month: monthNum,
        revenue: found ? toSafeNumber(found.revenue) : 0,
        orders: found ? toSafeNumber(found.orders) : 0,
      };
    });

    const totalCatRevenue = categoryRevenueRes.reduce(
      (acc, curr) => acc + toSafeNumber(curr.revenue),
      0,
    );

    const categoryDistribution =
      categoryRevenueRes.length > 0 && totalCatRevenue > 0
        ? categoryRevenueRes.map((cat) => ({
            category: cat.categoryName,
            revenue: toSafeNumber(cat.revenue),
            share: Math.round(
              (toSafeNumber(cat.revenue) / totalCatRevenue) * 100,
            ),
          }))
        : [];

    const topProducts = topProductsRes.map((prod) => ({
      id: prod.id,
      name: prod.name,
      sold: toSafeNumber(prod.sold),
      price: prod.price,
      image: prod.images.length > 0 ? prod.images[0] : undefined,
    }));

    const result: DashboardAnalyticsResponseDtoType = {
      year: targetYear,
      metrics: {
        totalRevenue: currTotalRev,
        totalOrders: currTotalOrders,
        totalProducts,
        newCustomers: currNewCust,
        revenueGrowth: calcGrowth(currTotalRev, prevTotalRev),
        ordersGrowth: calcGrowth(currTotalOrders, prevTotalOrders),
        customersGrowth: calcGrowth(currNewCust, prevNewCust),
      },
      monthlyRevenue,
      categoryDistribution,
      topProducts,
    };

    if (this.redisClient) {
      try {
        await this.redisClient.set(
          cacheKey,
          JSON.stringify(result),
          "EX",
          ANALYTICS_CACHE.TTL_SECONDS,
        );
      } catch {
        // Fail-open resilience: ignore cache write errors.
      }
    }

    return result;
  }
}
