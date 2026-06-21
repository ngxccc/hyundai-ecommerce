import type { CreateOrderDTO, CreateOrderItemDTO } from "../../dtos";
import type {
  OrderService,
  DashboardMetrics,
  MonthlyRevenue,
} from "../interfaces";
import {
  and,
  eq,
  ne,
  gte,
  lt,
  sql,
  inArray,
  gt,
  asc,
  desc,
  type SQL,
} from "drizzle-orm";
import { type IDatabase } from "../../client";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { isPostgresError, POSTGRES_ERROR_CODES } from "../../utils";
import {
  orders,
  orderItems,
  cartItems,
  shippingBids,
  products,
  users,
  outboxEvents,
  payments,
  paymentTransactions,
  type TOrder,
  type TNewShippingBid,
  type OrderStatus,
  type PaymentTransactionType,
  type PaymentMethod,
  type ApprovalStatus,
} from "../../schemas";

const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["PROCESSING", "CANCELLED", "SUSPICIOUS_PAYMENT_HOLD"] as const,
  PROCESSING: ["SHIPPED", "CANCELLED", "CANCELLATION_REQUESTED"] as const,
  SHIPPED: ["DELIVERED", "REFUND_PENDING", "CANCELLATION_REQUESTED"] as const,
  DELIVERED: ["REFUND_PENDING"] as const,
  CANCELLED: [] as const,
  REFUNDED: [] as const,
  REFUND_PENDING: ["REFUNDED", "CANCELLED"] as const,
  SUSPICIOUS_PAYMENT_HOLD: ["CANCELLED", "PROCESSING"] as const,
  CANCELLATION_REQUESTED: [
    "CANCELLED",
    "PROCESSING",
    "REFUND_PENDING",
  ] as const,
} as const;

export class DbOrderService implements OrderService {
  constructor(protected readonly db: IDatabase) {}

  async listOrders(filters?: {
    status?: TOrder["status"];
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
            companyName: true, // dùng cho bộ lọc tìm kiếm
          },
        },
        items: {
          columns: {
            productName: true,
            quantity: true, // dùng để hiển thị tên sản phẩm đầu tiên + số lượng
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
  }

  async listUserOrders(userId: string): Promise<ComplexOrder[]> {
    return (await this.db.query.orders.findMany({
      where: { userId: { eq: userId } },
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
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
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
    });

    // Sort hydratedRows to match the order of orderIds
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

    return (await this.db.query.orders.findMany({
      where: { userId: { in: userIds } },
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
      orderBy: { createdAt: "desc" },
    })) as unknown as ComplexOrder[];
  }
  async listCompanyOrdersPaginated(
    companyName: string,
    limit = 10,
    options?: {
      after?: string | undefined;
      before?: string | undefined;
      excludeUserId?: string | undefined;
      approvalStatus?: ApprovalStatus | undefined;
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
    });

    // Sort hydratedRows to match the order of orderIds
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

  async createOrder(data: CreateOrderDTO): Promise<{ id: string } | undefined> {
    const [order] = await this.db
      .insert(orders)
      .values(data)
      .returning({ id: orders.id });
    return order;
  }

  async createOrderWithItems(
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartIdToClear?: string,
  ): Promise<{ id: string }> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values(orderData)
        .returning({ id: orders.id });
      if (!order) {
        throw new Error("errors.createOrderFailed");
      }

      if (items.length > 0) {
        const finalItems = items.map((item) => ({
          ...item,
          orderId: order.id,
        }));
        await tx.insert(orderItems).values(finalItems);
      }

      if (cartIdToClear) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, cartIdToClear));
      }

      return order;
    });
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<{ id: string } | undefined> {
    return await this.db.transaction(async (tx) => {
      // get current order
      const currentOrder = await tx.query.orders.findFirst({
        columns: { status: true },
        where: { id },
        with: {
          items: {
            columns: { productId: true, quantity: true },
          },
        },
      });

      if (!currentOrder) throw new Error("errors.orderNotFound");

      const oldStatus = currentOrder.status;

      // Strict transition validation (Single Source of Truth)
      // Cast needed because terminal states (CANCELLED, REFUNDED) have empty transition arrays (never[])
      const allowedNext = ORDER_STATUS_TRANSITIONS[
        oldStatus
      ] as readonly string[];

      if (status !== oldStatus && !allowedNext.includes(status)) {
        throw new Error("errors.invalidStatusTransition");
      }

      // update order status
      const [updated] = await tx
        .update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning({ id: orders.id });

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
  }

  async createShippingBid(
    data: TNewShippingBid,
  ): Promise<{ id: string } | undefined> {
    const [bid] = await this.db.insert(shippingBids).values(data).returning({
      id: shippingBids.id,
    });
    return bid;
  }

  async selectWinningBid(
    orderId: string,
    bidId: string,
  ): Promise<{
    updatedOrder: { id: string; shippingFee: string | null };
    selectedBid: { id: string };
  }> {
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
        .returning({
          id: shippingBids.id,
          quotedPrice: shippingBids.quotedPrice,
        });
      if (!selectedBid) {
        throw new Error("errors.shippingBidNotFound");
      }

      // 3. Update order shippingFee
      const [updatedOrder] = await tx
        .update(orders)
        .set({ shippingFee: selectedBid.quotedPrice, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning({ id: orders.id, shippingFee: orders.shippingFee });
      if (!updatedOrder) {
        throw new Error("errors.orderNotFound");
      }

      return { updatedOrder, selectedBid: { id: selectedBid.id } };
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [productsRes, [ordersMetrics], [usersMetrics]] = await Promise.all([
      // 1. Total products (separate table)
      this.db.select({ count: sql<number>`count(*)` }).from(products),

      // 2. Orders metrics (aggregated in a single query)
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

      // 3. Customers/Users metrics (aggregated in a single query)
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

  async approveDealerOrder(
    orderId: string,
  ): Promise<{ id: string } | undefined> {
    return await this.db.transaction(async (tx) => {
      // 1. Fetch the order
      const [order] = await tx
        .select({
          id: orders.id,
          approvalStatus: orders.approvalStatus,
          paymentMethod: orders.paymentMethod,
          userId: orders.userId,
          totalAmount: orders.totalAmount,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        return undefined;
      }

      // If already approved, return it
      if (order.approvalStatus === "APPROVED") {
        return { id: order.id };
      }

      // 2. If it is Trade Credit, check and update the user's credit limit
      if (order.paymentMethod === "TRADE_CREDIT") {
        // Lock the user row
        let user;
        try {
          const [lockedUser] = await tx
            .select({
              creditLimit: users.creditLimit,
              currentDebt: users.currentDebt,
            })
            .from(users)
            .where(eq(users.id, order.userId))
            .for("update", { noWait: true });
          user = lockedUser;
        } catch (err) {
          if (
            (isPostgresError(err) &&
              err.code === POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE) ||
            (err instanceof Error &&
              err.message.includes("could not obtain lock"))
          ) {
            throw new Error("errors.lockAcquisitionFailed", { cause: err });
          }
          throw err;
        }

        if (!user) {
          throw new Error("errors.userNotFound");
        }

        const creditLimit = parseFloat(user.creditLimit || "0");
        const currentDebt = parseFloat(user.currentDebt || "0");
        const orderTotal = parseFloat(order.totalAmount || "0");
        const availableCredit = creditLimit - currentDebt;

        if (availableCredit < orderTotal) {
          throw new Error("errors.insufficientCreditLimit");
        }

        // Increment user's currentDebt
        await tx
          .update(users)
          .set({
            currentDebt: String(currentDebt + orderTotal),
          })
          .where(eq(users.id, order.userId));
      }

      // 3. Set approval status to APPROVED
      const [updatedOrder] = await tx
        .update(orders)
        .set({ approvalStatus: "APPROVED" })
        .where(eq(orders.id, orderId))
        .returning({ id: orders.id });

      return updatedOrder;
    });
  }

  async approveOrderCancellation(
    orderId: string,
  ): Promise<{ id: string } | undefined> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select({
          userId: orders.userId,
          paymentMethod: orders.paymentMethod,
          totalAmount: orders.totalAmount,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);
      if (!order) {
        return undefined;
      }

      if (order.paymentMethod === "TRADE_CREDIT") {
        const [user] = await tx
          .select({ currentDebt: users.currentDebt })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);
        if (user) {
          const newDebt = (
            parseFloat(user.currentDebt) - parseFloat(order.totalAmount)
          ).toFixed(2);
          await tx
            .update(users)
            .set({ currentDebt: newDebt })
            .where(eq(users.id, order.userId));
        }
        const [updatedOrder] = await tx
          .update(orders)
          .set({ status: "CANCELLED" })
          .where(eq(orders.id, orderId))
          .returning({ id: orders.id });
        return updatedOrder;
      } else {
        const [updatedOrder] = await tx
          .update(orders)
          .set({ status: "REFUND_PENDING" })
          .where(eq(orders.id, orderId))
          .returning({ id: orders.id });
        return updatedOrder;
      }
    });
  }

  async requestOrderCancellation(
    orderId: string,
  ): Promise<{ id: string } | undefined> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select({
          id: orders.id,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          userId: orders.userId,
          totalAmount: orders.totalAmount,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) return undefined;

      if (order.status === "PENDING") {
        if (order.paymentMethod === "TRADE_CREDIT") {
          const [user] = await tx
            .select({ currentDebt: users.currentDebt })
            .from(users)
            .where(eq(users.id, order.userId))
            .limit(1);
          if (user) {
            const newDebt = (
              parseFloat(user.currentDebt) - parseFloat(order.totalAmount)
            ).toFixed(2);
            await tx
              .update(users)
              .set({ currentDebt: newDebt })
              .where(eq(users.id, order.userId));
          }
        }
        const [updated] = await tx
          .update(orders)
          .set({ status: "CANCELLED" })
          .where(eq(orders.id, orderId))
          .returning({ id: orders.id });
        return updated;
      } else if (order.status === "PROCESSING" || order.status === "SHIPPED") {
        const [updated] = await tx
          .update(orders)
          .set({ status: "CANCELLATION_REQUESTED" })
          .where(eq(orders.id, orderId))
          .returning({ id: orders.id });
        return updated;
      } else {
        throw new Error("errors.cannotCancelInCurrentStatus");
      }
    });
  }

  async checkoutWithTradeCredit(
    userId: string,
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartId: string,
  ): Promise<{ id: string }> {
    return await this.db.transaction(async (tx) => {
      // 1. Lock the user row (pessimistic lock NOWAIT)
      let user;
      try {
        const [lockedUser] = await tx
          .select({
            role: users.role,
            creditLimit: users.creditLimit,
            currentDebt: users.currentDebt,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, userId))
          .for("update", { noWait: true });
        user = lockedUser;
      } catch (err) {
        if (
          (isPostgresError(err) &&
            err.code === POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE) ||
          (err instanceof Error &&
            err.message.includes("could not obtain lock"))
        ) {
          throw new Error("errors.lockAcquisitionFailed", { cause: err });
        }
        throw err;
      }

      if (!user) {
        throw new Error("errors.userNotFound");
      }

      // 2. Recalculate order total from DB product catalog prices
      let subtotal = 0;
      for (const item of items) {
        const [product] = await tx
          .select({ price: products.price })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);
        if (!product) {
          throw new Error("errors.productNotFound");
        }
        subtotal += parseFloat(product.price) * item.quantity;
      }
      const recalculatedTotal = subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE);

      // 3. Check B2B role and verify limit availability
      const isPurchaser = user.role === "DEALER_PURCHASER";
      const approvalStatus = isPurchaser ? "PENDING_APPROVAL" : "APPROVED";

      if (!isPurchaser) {
        const creditLimit = parseFloat(user.creditLimit || "0");
        const currentDebt = parseFloat(user.currentDebt || "0");
        const availableCredit = creditLimit - currentDebt;

        if (availableCredit < recalculatedTotal) {
          throw new Error("errors.insufficientCreditLimit");
        }

        // Increment currentDebt
        await tx
          .update(users)
          .set({
            currentDebt: String(currentDebt + recalculatedTotal),
          })
          .where(eq(users.id, userId));
      }

      // 4. Create the order
      const [order] = await tx
        .insert(orders)
        .values({
          ...orderData,
          totalAmount: String(recalculatedTotal),
          paymentMethod: "TRADE_CREDIT",
          paymentStatus: "UNPAID",
          approvalStatus,
        })
        .returning({ id: orders.id });

      if (!order) {
        throw new Error("errors.createOrderFailed");
      }

      // 5. Create order items
      if (items.length > 0) {
        const finalItems = items.map((item) => ({
          ...item,
          orderId: order.id,
        }));
        await tx.insert(orderItems).values(finalItems);
      }

      // 6. Clear cart items
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

      // 7. Insert outbox events inside the SAME transaction
      if (isPurchaser) {
        await tx.insert(outboxEvents).values({
          eventType: "SEND_TELEGRAM_ALERT",
          payload: {
            message: `🔔 [XÉT DUYỆT] Đơn hàng B2B mới cần phê duyệt!\n- Mã đơn hàng: ${order.id}\n- Người đặt: ${user.name} (dealer_purchaser)\n- Số tiền: ${recalculatedTotal.toLocaleString("vi-VN")} VND\n- Trạng thái: Chờ Dealer Approver duyệt hạn mức tín dụng.`,
            metadata: {
              orderId: order.id,
              userId,
              totalAmount: recalculatedTotal,
            },
          },
          status: "PENDING",
        });
      } else {
        await tx.insert(outboxEvents).values([
          {
            eventType: "SEND_MAIL",
            payload: {
              to: user.email,
              subject: `Hóa đơn mua hàng bảo lãnh (Trade Credit) - Đơn hàng ${order.id}`,
              body: `Xin chào ${user.name},\n\nĐơn hàng ${order.id} trị giá ${recalculatedTotal.toLocaleString("vi-VN")} VND đã được thanh toán thành công bằng Hạn mức tín dụng B2B (Trade Credit - Net 30/60).\nSố dư nợ hiện tại: ${(parseFloat(user.currentDebt || "0") + recalculatedTotal).toLocaleString("vi-VN")} VND.`,
            },
            status: "PENDING",
          },
          {
            eventType: "SEND_TELEGRAM_ALERT",
            payload: {
              message: `💼 [TRADE CREDIT] Đơn hàng B2B thanh toán bằng hạn mức tín dụng thành công!\n- Mã đơn hàng: ${order.id}\n- Khách hàng: ${user.name}\n- Số tiền: ${recalculatedTotal.toLocaleString("vi-VN")} VND\n- Trạng thái: Tự động trừ hạn mức, duyệt giao hàng.`,
            },
            status: "PENDING",
          },
        ]);
      }

      return order;
    });
  }

  async createPendingPaymentTransaction(
    orderId: string,
    amount: number,
    transactionType: PaymentTransactionType,
    referenceCode: number,
    method: Exclude<PaymentMethod, "TRADE_CREDIT"> = "PAYOS",
  ): Promise<void> {
    const [transaction] = await this.db
      .insert(paymentTransactions)
      .values({
        orderId,
        amount: amount.toFixed(2),
        paymentMethod: method,
        transactionType,
        status: "PENDING",
        orderCode: referenceCode,
      })
      .returning({ id: paymentTransactions.id });

    if (!transaction) {
      throw new Error("errors.createPaymentTransactionFailed");
    }

    return;
  }
  async expirePendingOrders(
    expirationWindowMinutes = 15,
  ): Promise<{ expiredCount: number }> {
    return await this.db.transaction(async (tx) => {
      const expirationThreshold = new Date(
        Date.now() - expirationWindowMinutes * 60 * 1000,
      );

      const expiredOrders = await tx
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.status, "PENDING"),
            eq(orders.paymentStatus, "UNPAID"),
            lt(orders.createdAt, expirationThreshold),
          ),
        );

      if (expiredOrders.length === 0) {
        return { expiredCount: 0 };
      }

      const expiredIds = expiredOrders.map((o) => o.id);

      await tx
        .update(orders)
        .set({ status: "CANCELLED" })
        .where(inArray(orders.id, expiredIds));

      await tx
        .update(paymentTransactions)
        .set({ status: "FAILED" })
        .where(
          and(
            inArray(paymentTransactions.orderId, expiredIds),
            eq(paymentTransactions.status, "PENDING"),
          ),
        );

      await tx
        .update(payments)
        .set({ status: "FAILED" })
        .where(
          and(
            inArray(payments.orderId, expiredIds),
            eq(payments.status, "PENDING"),
          ),
        );

      return { expiredCount: expiredIds.length };
    });
  }
}

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof DbOrderService.prototype.getComplexOrder>>
>;
