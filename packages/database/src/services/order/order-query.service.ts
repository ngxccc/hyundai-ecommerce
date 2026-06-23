import {
  and,
  eq,
  ne,
  gte,
  lt,
  sql,
  gt,
  asc,
  desc,
  type SQL,
} from "drizzle-orm";
import { type IDatabase } from "../../client";
import { orders, products, users } from "../../schemas";
import type {
  OrderQueryService,
  ComplexOrder,
  DashboardMetrics,
  MonthlyRevenue,
  OrderStatusDetails,
} from "./order.interface";

export const COMPLEX_ORDER_SELECT = {
  columns: {
    id: true,
    status: true,
    paymentStatus: true,
    paymentMethod: true,
    shippingFee: true,
    shippingAddress: true,
    totalAmount: true,
    createdAt: true,
    userId: true,
    approvalStatus: true,
  },
  with: {
    user: {
      columns: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        taxId: true,
        phone: true,
        businessType: true,
        parentId: true,
      },
    },
    items: {
      columns: {
        id: true,
        productName: true,
        productSku: true,
        quantity: true,
        unitPrice: true,
      },
    },
  },
} as const;

export class DbOrderQueryService implements OrderQueryService {
  constructor(protected readonly db: IDatabase) {}

  async listOrders(filters?: {
    status?: (typeof orders.$inferSelect)["status"];
  }): Promise<ComplexOrder[]> {
    return (await this.db.query.orders.findMany({
      where: filters?.status ? { status: { eq: filters.status } } : undefined,
      columns: {
        id: true,
        status: true,
        createdAt: true,
        totalAmount: true,
      },
      with: {
        user: {
          columns: {
            name: true,
            email: true,
            companyName: true,
          },
        },
        items: {
          columns: {
            productName: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
  }

  async listUserOrders(userId: string): Promise<ComplexOrder[]> {
    return await this.db.query.orders.findMany({
      where: { userId: { eq: userId } },
      ...COMPLEX_ORDER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async listUserOrdersPaginated(
    userId: string,
    limit = 10,
    options?: {
      after?: string | undefined;
      before?: string | undefined;
      last?: boolean | undefined;
    },
  ): Promise<{
    orders: ComplexOrder[];
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  }> {
    const isGoingBack = !!options?.before || !!options?.last;
    const cursorId = options?.after ?? options?.before;

    const clauses: (SQL | undefined)[] = [eq(orders.userId, userId)];
    if (cursorId) {
      clauses.push(
        isGoingBack ? gt(orders.id, cursorId) : lt(orders.id, cursorId),
      );
    }

    let targetLimit = limit;
    if (options?.last) {
      const [countResult] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.userId, userId));
      const totalCount = Number(countResult?.count ?? 0);
      const rem = totalCount % limit;
      targetLimit = rem === 0 && totalCount > 0 ? limit : rem;
    }

    const orderRows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(and(...clauses))
      .orderBy(isGoingBack ? asc(orders.id) : desc(orders.id))
      .limit(targetLimit + 1);

    const hasMore = orderRows.length > targetLimit;
    let finalOrderRows = orderRows.slice(0, targetLimit);

    if (isGoingBack) {
      finalOrderRows = [...finalOrderRows].reverse();
    }
    const orderIds = finalOrderRows.map((r) => r.id);
    if (orderIds.length === 0) {
      return {
        orders: [],
        nextCursor: undefined,
        prevCursor: undefined,
        hasMore,
      };
    }

    const hydratedRows = await this.db.query.orders.findMany({
      where: { id: { in: orderIds } },
      ...COMPLEX_ORDER_SELECT,
    });

    const rowsMap = new Map(hydratedRows.map((row) => [row.id, row]));
    const finalOrders = orderIds
      .map((id) => rowsMap.get(id))
      .filter((row): row is (typeof hydratedRows)[number] => !!row);

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;
    if (finalOrders.length > 0) {
      const firstItem = finalOrders[0]!;
      const lastItem = finalOrders[finalOrders.length - 1]!;

      if (options?.last) {
        nextCursor = undefined;
        prevCursor = hasMore ? firstItem.id : undefined;
      } else {
        nextCursor =
          (hasMore && !isGoingBack) || isGoingBack ? lastItem.id : undefined;

        prevCursor =
          (isGoingBack && hasMore) || (!isGoingBack && options?.after)
            ? firstItem.id
            : undefined;
      }
    }

    return {
      orders: finalOrders as unknown as ComplexOrder[],
      nextCursor,
      prevCursor,
      hasMore,
    };
  }

  async listCompanyOrders(companyName: string): Promise<ComplexOrder[]> {
    const companyUsers = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.companyName, companyName));

    const userIds = companyUsers.map((u) => u.id);
    if (userIds.length === 0) return [];

    return await this.db.query.orders.findMany({
      where: { userId: { in: userIds } },
      ...COMPLEX_ORDER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async listCompanyOrdersPaginated(
    companyName: string,
    limit = 10,
    options?: {
      after?: string | undefined;
      before?: string | undefined;
      excludeUserId?: string | undefined;
      approvalStatus?:
        | (typeof orders.$inferSelect)["approvalStatus"]
        | undefined;
      last?: boolean | undefined;
    },
  ): Promise<{
    orders: ComplexOrder[];
    nextCursor?: string | undefined;
    prevCursor?: string | undefined;
    hasMore: boolean;
  }> {
    const isGoingBack = !!options?.before || !!options?.last;
    const cursorId = options?.after ?? options?.before;

    const clauses: (SQL | undefined)[] = [eq(users.companyName, companyName)];
    if (options?.excludeUserId) {
      clauses.push(ne(orders.userId, options.excludeUserId));
    }
    if (options?.approvalStatus) {
      clauses.push(eq(orders.approvalStatus, options.approvalStatus));
    }
    if (cursorId) {
      clauses.push(
        isGoingBack ? gt(orders.id, cursorId) : lt(orders.id, cursorId),
      );
    }

    let targetLimit = limit;
    if (options?.last) {
      const [countResult] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .where(and(...clauses));
      const totalCount = Number(countResult?.count ?? 0);
      const rem = totalCount % limit;
      targetLimit = rem === 0 && totalCount > 0 ? limit : rem;
    }

    const orderRows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(and(...clauses))
      .orderBy(isGoingBack ? asc(orders.id) : desc(orders.id))
      .limit(targetLimit + 1);

    const hasMore = orderRows.length > targetLimit;
    let finalOrderRows = orderRows.slice(0, targetLimit);

    if (isGoingBack) {
      finalOrderRows = [...finalOrderRows].reverse();
    }
    const orderIds = finalOrderRows.map((r) => r.id);
    if (orderIds.length === 0) {
      return {
        orders: [],
        nextCursor: undefined,
        prevCursor: undefined,
        hasMore,
      };
    }

    const hydratedRows = await this.db.query.orders.findMany({
      where: { id: { in: orderIds } },
      ...COMPLEX_ORDER_SELECT,
    });

    const rowsMap = new Map(hydratedRows.map((row) => [row.id, row]));
    const finalOrders = orderIds
      .map((id) => rowsMap.get(id))
      .filter((row): row is (typeof hydratedRows)[number] => !!row);

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (finalOrders.length > 0) {
      const firstItem = finalOrders[0]!;
      const lastItem = finalOrders[finalOrders.length - 1]!;

      if (options?.last) {
        nextCursor = undefined;
        prevCursor = hasMore ? firstItem.id : undefined;
      } else {
        nextCursor =
          (hasMore && !isGoingBack) || isGoingBack ? lastItem.id : undefined;

        prevCursor =
          (isGoingBack && hasMore) || (!isGoingBack && options?.after)
            ? firstItem.id
            : undefined;
      }
    }

    return {
      orders: finalOrders as unknown as ComplexOrder[],
      nextCursor,
      prevCursor,
      hasMore,
    };
  }

  async getOrderStatus(
    orderId: string,
    userId?: string,
  ): Promise<OrderStatusDetails | undefined> {
    const whereCondition = userId
      ? and(eq(orders.id, orderId), eq(orders.userId, userId))
      : eq(orders.id, orderId);

    const [order] = await this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
      })
      .from(orders)
      .where(whereCondition)
      .limit(1);
    return order;
  }

  async getComplexOrder(
    orderId: string,
    userId?: string,
  ): Promise<ComplexOrder | undefined> {
    const order = await this.db.query.orders.findFirst({
      where: userId ? { id: orderId, userId } : { id: orderId },
      columns: COMPLEX_ORDER_SELECT.columns,
      with: {
        ...COMPLEX_ORDER_SELECT.with,
        bids: {
          columns: {
            id: true,
            vendorName: true,
            quotedPrice: true,
            internalNote: true,
            isSelected: true,
          },
        },
        paymentTransactions: {
          columns: {
            id: true,
            status: true,
            paymentMethod: true,
            transactionType: true,
            amount: true,
            referenceCode: true,
            createdAt: true,
          },
        },
      },
    });
    return order as unknown as ComplexOrder;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [productsRes, [ordersMetrics], [usersMetrics]] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(products),
      this.db
        .select({
          totalOrders: sql<number>`count(*)::integer`,
          totalRevenue: sql<string>`coalesce(sum(case when ${orders.status} != 'CANCELLED' then ${orders.totalAmount} else 0 end), '0')`,
          currentRevenue: sql<string>`coalesce(sum(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${thirtyDaysAgo} then ${orders.totalAmount} else 0 end), '0')`,
          currentOrders: sql<number>`count(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${thirtyDaysAgo} then 1 else null end)::integer`,
          previousRevenue: sql<string>`coalesce(sum(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${sixtyDaysAgo} and ${orders.createdAt} < ${thirtyDaysAgo} then ${orders.totalAmount} else 0 end), '0')`,
          previousOrders: sql<number>`count(case when ${orders.status} != 'CANCELLED' and ${orders.createdAt} >= ${sixtyDaysAgo} and ${orders.createdAt} < ${thirtyDaysAgo} then 1 else null end)::integer`,
        })
        .from(orders),
      this.db
        .select({
          newCustomers: sql<number>`count(case when ${users.createdAt} >= ${thirtyDaysAgo} then 1 else null end)::integer`,
          previousCustomers: sql<number>`count(case when ${users.createdAt} >= ${sixtyDaysAgo} and ${users.createdAt} < ${thirtyDaysAgo} then 1 else null end)::integer`,
        })
        .from(users)
        .where(
          and(
            ne(users.role, "SUPER_ADMIN"),
            ne(users.role, "SALES_REPRESENTATIVE"),
            ne(users.role, "ACCOUNTANT"),
            ne(users.role, "WAREHOUSE_MANAGER"),
          ),
        ),
    ]);

    const totalProducts = productsRes[0]?.count ?? 0;
    const totalOrders = ordersMetrics?.totalOrders ?? 0;
    const totalRevenue = ordersMetrics?.totalRevenue ?? "0";
    const currentRevenueRaw = ordersMetrics?.currentRevenue ?? "0";
    const currentOrders = ordersMetrics?.currentOrders ?? 0;
    const previousRevenueRaw = ordersMetrics?.previousRevenue ?? "0";
    const previousOrders = ordersMetrics?.previousOrders ?? 0;
    const newCustomers = usersMetrics?.newCustomers ?? 0;
    const previousCustomers = usersMetrics?.previousCustomers ?? 0;

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
      totalOrders,
      totalProducts,
      newCustomers,
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
