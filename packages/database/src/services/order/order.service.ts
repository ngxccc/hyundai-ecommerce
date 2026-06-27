import type { CreateOrderDTO, CreateOrderItemDTO } from "../../dtos";
import type { OrderService, SelectWinningBidResult } from "./order.interface";
import { and, eq, lt, sql, inArray } from "drizzle-orm";
import { type IDatabase } from "../../client";
import { FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { isPostgresError, POSTGRES_ERROR_CODES } from "../../utils";
import {
  orders,
  orderItems,
  cartItems,
  carts,
  products,
  users,
  outboxEvents,
  payments,
  paymentTransactions,
  shippingBids,
  type TOrder,
  type TOutboxEvent,
  type TNewShippingBid,
  type OrderStatus,
  type PaymentTransactionType,
  type PaymentMethod,
  type OutboxEventStatus,
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
      if (cartIdToClear) {
        await this.validateAndLockCart(tx, cartIdToClear, items);
      }

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
  ): Promise<SelectWinningBidResult> {
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

      // 1.5. Integrity check: verify order items total recalculation matches order.totalAmount
      const orderItemsList = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      let calculatedSubtotal = 0;
      for (const item of orderItemsList) {
        calculatedSubtotal += parseFloat(item.unitPrice) * item.quantity;
      }
      const calculatedTotal =
        Math.round(
          calculatedSubtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE) * 100,
        ) / 100;
      const orderTotal = parseFloat(order.totalAmount || "0");
      if (Math.abs(orderTotal - calculatedTotal) > 0.01) {
        throw new Error("errors.invalidAmount");
      }

      // 2. If it is Trade Credit, check and update the user's credit limit
      if (order.paymentMethod === "TRADE_CREDIT") {
        const [buyer] = await tx
          .select({
            parentId: users.parentId,
          })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1);

        if (!buyer) {
          throw new Error("errors.userNotFound");
        }

        const targetUserId = buyer.parentId ?? order.userId;

        // Lock the user row
        let user;
        try {
          const [lockedUser] = await tx
            .select({
              creditLimit: users.creditLimit,
              currentDebt: users.currentDebt,
            })
            .from(users)
            .where(eq(users.id, targetUserId))
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
        const availableCredit =
          Math.round((creditLimit - currentDebt) * 100) / 100;

        if (availableCredit < orderTotal) {
          throw new Error("errors.insufficientCreditLimit");
        }

        const newDebt = Math.round((currentDebt + orderTotal) * 100) / 100;
        // Increment targetUser's currentDebt
        await tx
          .update(users)
          .set({
            currentDebt: String(newDebt.toFixed(2)),
          })
          .where(eq(users.id, targetUserId));
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
            parentId: users.parentId,
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

      // Verify user has B2B role to use Trade Credit
      if (user.role !== "DEALER_APPROVER" && user.role !== "DEALER_PURCHASER") {
        throw new Error("errors.forbidden");
      }

      // 1.5. Lock the cart row and check if cart items changed
      if (cartId) {
        await this.validateAndLockCart(tx, cartId, items);
      }

      // 2. Recalculate order total from DB product catalog prices
      const recalculatedTotal = await this.recalculateOrderTotal(tx, items);

      // 3. Check B2B role and verify limit availability
      const isPurchaser = user.role === "DEALER_PURCHASER";
      const approvalStatus = isPurchaser ? "PENDING_APPROVAL" : "APPROVED";

      if (isPurchaser) {
        if (!user.parentId) {
          throw new Error("errors.parentNotFound");
        }
        const [parent] = await tx
          .select({
            creditLimit: users.creditLimit,
            currentDebt: users.currentDebt,
          })
          .from(users)
          .where(eq(users.id, user.parentId))
          .limit(1);
        if (!parent) {
          throw new Error("errors.parentNotFound");
        }
        const creditLimit = parseFloat(parent.creditLimit || "0");
        const currentDebt = parseFloat(parent.currentDebt || "0");
        const availableCredit =
          Math.round((creditLimit - currentDebt) * 100) / 100;

        if (availableCredit < recalculatedTotal) {
          throw new Error("errors.insufficientCreditLimit");
        }
      } else {
        const creditLimit = parseFloat(user.creditLimit || "0");
        const currentDebt = parseFloat(user.currentDebt || "0");
        const availableCredit =
          Math.round((creditLimit - currentDebt) * 100) / 100;

        if (availableCredit < recalculatedTotal) {
          throw new Error("errors.insufficientCreditLimit");
        }

        const newDebt =
          Math.round((currentDebt + recalculatedTotal) * 100) / 100;
        // Increment currentDebt
        await tx
          .update(users)
          .set({
            currentDebt: String(newDebt.toFixed(2)),
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

  private async recalculateOrderTotal(
    tx: IDatabase,
    items: CreateOrderItemDTO[],
  ): Promise<number> {
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
    return (
      Math.round(subtotal * (1 + FINANCIAL_CONSTANTS.VAT_RATE) * 100) / 100
    );
  }

  private async validateAndLockCart(
    tx: IDatabase,
    cartId: string,
    items: CreateOrderItemDTO[],
  ): Promise<void> {
    try {
      await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.id, cartId))
        .for("update", { noWait: true });
    } catch (err) {
      if (
        (isPostgresError(err) &&
          err.code === POSTGRES_ERROR_CODES.LOCK_NOT_AVAILABLE) ||
        (err instanceof Error && err.message.includes("could not obtain lock"))
      ) {
        throw new Error("errors.lockAcquisitionFailed", { cause: err });
      }
      throw err;
    }

    const currentCartItems = await tx
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    if (currentCartItems.length !== items.length) {
      throw new Error("errors.cartChanged");
    }
    for (const item of items) {
      const matching = currentCartItems.find(
        (c) => c.productId === item.productId && c.quantity === item.quantity,
      );
      if (!matching) {
        throw new Error("errors.cartChanged");
      }
    }
  }

  async fetchPendingOutboxEvents(
    limit: number,
  ): Promise<
    Pick<TOutboxEvent, "id" | "eventType" | "payload" | "retryCount">[]
  > {
    return await this.db.transaction(async (tx) => {
      const events = await tx
        .select({
          id: outboxEvents.id,
          eventType: outboxEvents.eventType,
          payload: outboxEvents.payload,
          retryCount: outboxEvents.retryCount,
        })
        .from(outboxEvents)
        .where(eq(outboxEvents.status, "PENDING"))
        .limit(limit)
        .for("update", { skipLocked: true });

      if (events.length > 0) {
        const ids = events.map((e) => e.id);
        await tx
          .update(outboxEvents)
          .set({ status: "PROCESSING", updatedAt: new Date() })
          .where(inArray(outboxEvents.id, ids));
      }

      return events;
    });
  }

  async updateOutboxEventStatus(
    id: string,
    status: OutboxEventStatus,
    error?: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const updates: Partial<TOutboxEvent> = { status };
      if (status === "PROCESSED") {
        updates.processedAt = new Date();
      } else if (status === "FAILED" || status === "PENDING") {
        const [event] = await tx
          .select({ retryCount: outboxEvents.retryCount })
          .from(outboxEvents)
          .where(eq(outboxEvents.id, id))
          .limit(1);

        if (event) {
          updates.retryCount = event.retryCount + 1;
        }
        updates.lastError = error ?? null;
      }

      await tx.update(outboxEvents).set(updates).where(eq(outboxEvents.id, id));
    });
  }
}
