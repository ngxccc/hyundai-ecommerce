import type {
  OrderService,
  DashboardMetrics,
  MonthlyRevenue,
} from "../interfaces";
import { and, eq, ne, gte, lt, sql } from "drizzle-orm";
import { type IDatabase } from "../../client";
import {
  orders,
  shippingBids,
  products,
  users,
  type TNewOrder,
  type TOrder,
  type TShippingBid,
  type TNewShippingBid,
} from "../../schemas";

const complexOrderQueryConfig = {
  with: {
    items: {
      with: {
        product: true, // product ở order-item
      },
    },
    bids: true,
    user: true,
  },
} as const; // khoá cứng cấy ATS, không bị xuy luận thành any

export class DbOrderService implements OrderService {
  constructor(protected readonly db: IDatabase) {}

  // NORMAL QUERIES
  async list(filters?: { status?: TOrder["status"] }): Promise<ComplexOrder[]> {
    const whereConditions: Record<string, { eq: string }> = {};
    if (filters?.status) {
      whereConditions["status"] = { eq: filters.status };
    }

    return await this.db.query.orders.findMany({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      ...complexOrderQueryConfig,
      orderBy: { createdAt: "desc" },
    });
  }

  async createOrder(data: TNewOrder) {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: TOrder["status"]) {
    return await this.db.transaction(async (tx) => {
      // get current order
      const currentOrder = await tx.query.orders.findFirst({
        where: {
          id,
        },
        with: {
          items: true,
        },
      });

      // throw error if cant find order
      if (!currentOrder) throw new Error("errors.orderNotFound");

      const oldStatus = currentOrder.status;

      // update order status
      const [updated] = await tx
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      const isSoldStatus = (s: TOrder["status"]) =>
        s === "PROCESSING" || s === "SHIPPED" || s === "DELIVERED";
      // trước đó đã bán hay chưa?
      const wasSold = isSoldStatus(oldStatus);
      // trước đó chuwa bán, giờ mới bán
      const isNowSold = isSoldStatus(status);

      // trước đó chưa bán giờ update thành đã bán
      if (!wasSold && isNowSold) {
        // from PENDING -> PROCESSING,...
        for (const item of currentOrder.items) {
          await tx
            .update(products)
            .set({
              totalSalesCache: sql`${products.totalSalesCache} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }
      } else if (wasSold && !isNowSold) {
        // đã bán giờ huỷ hoặc refund
        // from PROCESSING -> CANCELLED or REFUNDED
        for (const item of currentOrder.items) {
          await tx
            .update(products)
            .set({
              totalSalesCache: sql`GREATEST(${products.totalSalesCache} - ${item.quantity}, 0)`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      return updated;
    });
  }

  async getComplexOrder(orderId: string) {
    return await this.db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      ...complexOrderQueryConfig,
    });
  }
  async createShippingBid(data: TNewShippingBid) {
    const [bid] = await this.db.insert(shippingBids).values(data).returning();
    return bid;
  }
  async selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<{ updatedOrder: TOrder; selectedBid: TShippingBid }> {
    return await this.db.transaction(async (tx) => {
      // 1. Deselect all bids for this order
      await tx
        .update(shippingBids)
        .set({ isSelected: false })
        .where(eq(shippingBids.orderId, orderId));
      // 2. Select the winning bid
      const [selectedBid] = await tx
        .update(shippingBids)
        .set({ isSelected: true })
        .where(
          and(eq(shippingBids.id, bidId), eq(shippingBids.orderId, orderId)),
        )
        .returning();
      if (!selectedBid) {
        throw new Error("errors.shippingBidNotFound");
      }
      // 3. Update order shippingFee
      const [updatedOrder] = await tx
        .update(orders)
        .set({ shippingFee: selectedBid.quotedPrice, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
      if (!updatedOrder) {
        throw new Error("errors.orderNotFound");
      }
      return { updatedOrder, selectedBid };
    });
  }
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // 1. Total products
    const productsRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    const totalProducts = productsRes[0]?.count ?? 0;

    // 2. Total orders
    const ordersRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const totalOrders = ordersRes[0]?.count ?? 0;

    // 3. Total revenue
    const totalRevenueRes = await this.db
      .select({ sum: sql<string | null>`sum(${orders.totalAmount})` })
      .from(orders)
      .where(ne(orders.status, "CANCELLED"));
    const totalRevenue = totalRevenueRes[0]?.sum ?? "0";

    // 4. Current 30 days revenue & count
    const currentRes = await this.db
      .select({
        sum: sql<string | null>`sum(${orders.totalAmount})`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          ne(orders.status, "CANCELLED"),
          gte(orders.createdAt, thirtyDaysAgo),
        ),
      );
    const currentRevenueRaw = currentRes[0]?.sum ?? "0";
    const currentOrders = currentRes[0]?.count ?? 0;

    // 5. Previous 30 days (30-60 days ago) revenue & count
    const previousRes = await this.db
      .select({
        sum: sql<string | null>`sum(${orders.totalAmount})`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          ne(orders.status, "CANCELLED"),
          gte(orders.createdAt, sixtyDaysAgo),
          lt(orders.createdAt, thirtyDaysAgo),
        ),
      );
    const previousRevenueRaw = previousRes[0]?.sum ?? "0";
    const previousOrders = previousRes[0]?.count ?? 0;

    const currentRevenue = parseFloat(currentRevenueRaw);
    const previousRevenue = parseFloat(previousRevenueRaw);

    const revenueGrowth =
      previousRevenue === 0
        ? currentRevenue > 0
          ? 100
          : 0
        : Math.round(
            ((currentRevenue - previousRevenue) / previousRevenue) * 10000,
          ) / 100;

    const ordersGrowth =
      previousOrders === 0
        ? currentOrders > 0
          ? 100
          : 0
        : Math.round(
            ((currentOrders - previousOrders) / previousOrders) * 10000,
          ) / 100;

    // 6. New customers count & growth
    const newCustomersRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          ne(users.role, "SUPER_ADMIN"),
          ne(users.role, "SALES_REPRESENTATIVE"),
          ne(users.role, "ACCOUNTANT"),
          ne(users.role, "WAREHOUSE_MANAGER"),
          gte(users.createdAt, thirtyDaysAgo),
        ),
      );
    const newCustomers = newCustomersRes[0]?.count ?? 0;

    const previousCustomersRes = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          ne(users.role, "SUPER_ADMIN"),
          ne(users.role, "SALES_REPRESENTATIVE"),
          ne(users.role, "ACCOUNTANT"),
          ne(users.role, "WAREHOUSE_MANAGER"),
          gte(users.createdAt, sixtyDaysAgo),
          lt(users.createdAt, thirtyDaysAgo),
        ),
      );
    const previousCustomers = previousCustomersRes[0]?.count ?? 0;
    const customersGrowth =
      previousCustomers === 0
        ? newCustomers > 0
          ? 100
          : 0
        : Math.round(
            ((newCustomers - previousCustomers) / previousCustomers) * 10000,
          ) / 100;

    return {
      totalRevenue,
      totalOrders: Number(totalOrders),
      totalProducts: Number(totalProducts),
      newCustomers: Number(newCustomers),
      revenueGrowth,
      ordersGrowth,
      customersGrowth,
    };
  }

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const result = await this.db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'MM')`,
        revenue: sql<string>`sum(${orders.totalAmount})`,
        orderCount: sql<number>`count(*)::integer`,
      })
      .from(orders)
      .where(
        and(
          ne(orders.status, "CANCELLED"),
          gte(orders.createdAt, startOfYear),
          lt(orders.createdAt, endOfYear),
        ),
      )
      .groupBy(sql`to_char(${orders.createdAt}, 'MM')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'MM')`);

    const monthlyMap = new Map(result.map((r) => [r.month, r]));
    const fullYearData: MonthlyRevenue[] = [];

    for (let i = 1; i <= 12; i++) {
      const monthStr = i.toString().padStart(2, "0");
      const existing = monthlyMap.get(monthStr);
      fullYearData.push(
        existing ?? {
          month: monthStr,
          revenue: "0",
          orderCount: 0,
        },
      );
    }

    return fullYearData;
  }
}

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof DbOrderService.prototype.getComplexOrder>>
>;
