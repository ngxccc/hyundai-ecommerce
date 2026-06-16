import type {
  CreateOrderDTO,
  CreateOrderItemDTO,
  CreatePaymentDTO,
  OrderPaymentStatus,
  PaymentTransactionType,
} from "../../dtos";
import type {
  OrderService,
  DashboardMetrics,
  MonthlyRevenue,
} from "../interfaces";
import { and, eq, ne, gte, lt, sql } from "drizzle-orm";
import { type IDatabase } from "../../client";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { isPostgresError, POSTGRES_ERROR_CODES } from "../../utils";
import {
  orders,
  orderItems,
  cartItems,
  payments,
  shippingBids,
  products,
  users,
  paymentTransactions,
  outboxEvents,
  type TOrder,
  type TPayment,
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

  async createOrder(data: CreateOrderDTO) {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async createOrderWithItems(
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartIdToClear?: string,
  ): Promise<TOrder> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
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

  async approveDealerOrder(orderId: string): Promise<TOrder | undefined> {
    return await this.db.transaction(async (tx) => {
      // 1. Fetch the order
      const order = await tx.query.orders.findFirst({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        return undefined;
      }

      // If already approved, return it
      if (order.approvalStatus === "APPROVED") {
        return order;
      }

      // 2. If it is Trade Credit, check and update the user's credit limit
      if (order.paymentMethod === "TRADE_CREDIT") {
        // Lock the user row
        let user;
        try {
          const [lockedUser] = await tx
            .select()
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
        .returning();

      return updatedOrder;
    });
  }

  async verifyManualBankTransfer(
    orderId: string,
    verifiedById: string,
  ): Promise<TOrder | undefined> {
    return await this.db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: { id: orderId },
      });
      if (!order) {
        return undefined;
      }

      const [updatedOrder] = await tx
        .update(orders)
        .set({ paymentStatus: "FULLY_PAID" })
        .where(eq(orders.id, orderId))
        .returning();

      // Update manual payment status to COMPLETED
      await tx
        .update(payments)
        .set({ status: "COMPLETED" })
        .where(
          and(
            eq(payments.orderId, orderId),
            eq(payments.method, "MANUAL_TRANSFER"),
          ),
        );

      await tx.insert(paymentTransactions).values({
        orderId,
        amount: order.totalAmount,
        paymentMethod: "MANUAL_TRANSFER",
        transactionType: "FULL",
        status: "SUCCESS",
        referenceCode: "MANUAL-" + orderId,
        verifiedBy: verifiedById,
      });

      return updatedOrder;
    });
  }

  async approveOrderCancellation(orderId: string): Promise<TOrder | undefined> {
    return await this.db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: { id: orderId },
      });
      if (!order) {
        return undefined;
      }

      if (order.paymentMethod === "TRADE_CREDIT") {
        const user = await tx.query.users.findFirst({
          where: { id: order.userId },
        });
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
          .returning();
        return updatedOrder;
      } else {
        const [updatedOrder] = await tx
          .update(orders)
          .set({ status: "REFUND_PENDING" })
          .where(eq(orders.id, orderId))
          .returning();
        return updatedOrder;
      }
    });
  }

  async createPayment(data: CreatePaymentDTO): Promise<TPayment> {
    const [payment] = await this.db.insert(payments).values(data).returning();
    if (!payment) {
      throw new Error("errors.createPaymentFailed");
    }
    return payment;
  }

  async getPaymentByTransactionId(
    transactionId: string,
  ): Promise<TPayment | undefined> {
    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, transactionId))
      .limit(1);
    return payment;
  }

  async updatePayment(
    id: string,
    data: Partial<TPayment>,
  ): Promise<TPayment | undefined> {
    const [updated] = await this.db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async confirmPayOSPayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      // 1. Get the payment by transactionId (which is orderCode)
      const [payment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.transactionId, orderCode))
        .limit(1);
      if (!payment || payment.status === "COMPLETED") {
        return false;
      }

      // 2. Get the order
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, payment.orderId))
        .limit(1);
      if (!order) {
        return false;
      }

      // Check for amount mismatch (Gap 4)
      const expectedAmount = parseFloat(payment.amount);
      const tolerance = 0.01;
      const isMismatch = Math.abs(amount - expectedAmount) > tolerance;

      if (isMismatch) {
        // Log transaction as FAILED
        await tx.insert(paymentTransactions).values({
          orderId: order.id,
          amount: String(amount),
          paymentMethod: "PAYOS",
          transactionType: "FULL",
          status: "FAILED",
          referenceCode,
        });

        // Set order status to "SUSPICIOUS_PAYMENT_HOLD" and paymentStatus to "UNPAID"
        await tx
          .update(orders)
          .set({
            status: "SUSPICIOUS_PAYMENT_HOLD",
            paymentStatus: "UNPAID",
          })
          .where(eq(orders.id, order.id));

        // Insert high-priority TELEGRAM alert event to outbox_event (Gap 2/4)
        await tx.insert(outboxEvents).values({
          eventType: "SEND_TELEGRAM_ALERT",
          payload: {
            message: `⚠️ [BẢO MẬT] Phát hiện lệch tiền thanh toán qua PayOS!\n- Mã đơn hàng: ${order.id}\n- Số tiền mong đợi: ${expectedAmount.toLocaleString("vi-VN")} VND\n- Số tiền thực tế: ${amount.toLocaleString("vi-VN")} VND\n- Reference: ${referenceCode}\n- Trạng thái: Đơn hàng đã bị giữ lại để kiểm tra thủ công.`,
            metadata: {
              orderId: order.id,
              expectedAmount,
              actualAmount: amount,
              referenceCode,
            },
          },
          status: "PENDING",
        });

        return true;
      }

      // If amounts match:
      // 3. Update payment status to COMPLETED
      await tx
        .update(payments)
        .set({ status: "COMPLETED" })
        .where(eq(payments.id, payment.id));

      // 4. Update order paymentStatus & determine transactionType
      const isFull =
        parseFloat(payment.amount) === parseFloat(order.totalAmount);

      let paymentStatus: OrderPaymentStatus;
      let transactionType: PaymentTransactionType;

      if (order.paymentStatus === "DEPOSIT_PAID") {
        paymentStatus = "FULLY_PAID";
        transactionType = "REMAINDER";
      } else {
        paymentStatus = isFull ? "FULLY_PAID" : "DEPOSIT_PAID";
        transactionType = isFull ? "FULL" : "DEPOSIT";
      }

      await tx
        .update(orders)
        .set({ paymentStatus })
        .where(eq(orders.id, order.id));

      // 5. Insert paymentTransaction log
      await tx.insert(paymentTransactions).values({
        orderId: order.id,
        amount: payment.amount,
        paymentMethod: "PAYOS",
        transactionType,
        status: "SUCCESS",
        referenceCode,
      });

      // Get customer email
      const [customer] = await tx
        .select()
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);
      const customerEmail = customer?.email ?? "customer@example.com";

      // 6. Insert outbox events for background jobs (Gap 3):
      // - Confirm email (SEND_MAIL)
      // - Telegram alert to sales department (SEND_TELEGRAM_ALERT)
      await tx.insert(outboxEvents).values([
        {
          eventType: "SEND_MAIL",
          payload: {
            to: customerEmail,
            subject: `Xác nhận thanh toán đơn hàng ${order.id}`,
            body: `Đơn hàng ${order.id} đã được thanh toán thành công số tiền ${amount.toLocaleString("vi-VN")} VND qua PayOS. Trạng thái: ${paymentStatus}.`,
          },
          status: "PENDING",
        },
        {
          eventType: "SEND_TELEGRAM_ALERT",
          payload: {
            message: `🎉 [THANH TOÁN] Đơn hàng mới thanh toán thành công!\n- Mã đơn hàng: ${order.id}\n- Số tiền: ${amount.toLocaleString("vi-VN")} VND\n- Cổng: PayOS\n- Loại: ${transactionType === "FULL" ? "Toàn bộ" : transactionType === "REMAINDER" ? "Phần còn lại" : "Đặt cọc (20%)"}`,
          },
          status: "PENDING",
        },
      ]);

      return true;
    });
  }

  async checkoutWithTradeCredit(
    userId: string,
    orderData: CreateOrderDTO,
    items: CreateOrderItemDTO[],
    cartId: string,
  ): Promise<TOrder> {
    return await this.db.transaction(async (tx) => {
      // 1. Lock the user row (pessimistic lock NOWAIT)
      let user;
      try {
        const [lockedUser] = await tx
          .select()
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
          .select()
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
        .returning();

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
}

// thay vì dùng BuildQueryResult thì ta lấy luôn type của hàm getComplexOrder trả về
export type ComplexOrder = NonNullable<
  Awaited<ReturnType<typeof DbOrderService.prototype.getComplexOrder>>
>;
