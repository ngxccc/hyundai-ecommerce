import { and, eq } from "drizzle-orm";
import { type IDatabase } from "../../client";
import {
  orders,
  payments,
  paymentTransactions,
  outboxEvents,
  debtRepayments,
  users,
  type TPayment,
  type TNewPaymentTransaction,
  type OrderPaymentStatus,
  type PaymentTransactionType,
  type PaymentTransactionStatus,
} from "../../schemas";
import type {
  CreatePaymentDTO,
  DebtRepaymentDTO,
  CreateDebtRepaymentDTO,
  UpdateDebtRepaymentDTO,
} from "../../dtos";
import type { PaymentService } from "../interfaces";

export class DbPaymentService implements PaymentService {
  constructor(protected readonly db: IDatabase) {}

  async verifyCashPayment(
    orderId: string,
    verifiedById: string,
  ): Promise<{ id: string } | undefined> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx
        .select({ totalAmount: orders.totalAmount })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);
      if (!order) {
        return undefined;
      }

      const [updatedOrder] = await tx
        .update(orders)
        .set({ paymentStatus: "FULLY_PAID" })
        .where(eq(orders.id, orderId))
        .returning({ id: orders.id });

      // Update manual payment status to COMPLETED
      await tx
        .update(payments)
        .set({ status: "COMPLETED" })
        .where(and(eq(payments.orderId, orderId), eq(payments.method, "CASH")));

      await tx.insert(paymentTransactions).values({
        orderId,
        amount: order.totalAmount,
        paymentMethod: "CASH",
        transactionType: "FULL",
        status: "SUCCESS",
        referenceCode: "CASH-" + orderId,
        verifiedBy: verifiedById,
      });

      return updatedOrder;
    });
  }

  async createPayment(data: CreatePaymentDTO): Promise<{ id: string }> {
    const [payment] = await this.db
      .insert(payments)
      .values(data)
      .returning({ id: payments.id });
    if (!payment) {
      throw new Error("errors.createPaymentFailed");
    }
    return payment;
  }

  async createPaymentTransaction(
    data: TNewPaymentTransaction,
  ): Promise<{ id: string }> {
    const [transaction] = await this.db
      .insert(paymentTransactions)
      .values(data)
      .returning({ id: paymentTransactions.id });
    if (!transaction) {
      throw new Error("errors.createPaymentTransactionFailed");
    }
    return transaction;
  }

  async getPaymentTransactionByReferenceCode(
    referenceCode: string,
  ): Promise<{ id: string }> {
    const [paymentTransaction] = await this.db
      .select({ id: paymentTransactions.id })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.referenceCode, referenceCode))
      .limit(1);
    if (!paymentTransaction) {
      throw new Error("errors.paymentTransactionNotFound");
    }
    return paymentTransaction;
  }

  async updatePayment(
    id: string,
    data: Partial<TPayment>,
  ): Promise<{ id: string } | undefined> {
    const [updated] = await this.db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning({ id: payments.id });
    return updated;
  }

  async getPendingPayOSTransactionByOrderId(orderId: string): Promise<
    | {
        id: string;
        orderCode: number | null;
        amount: string;
        status: PaymentTransactionStatus;
      }
    | undefined
  > {
    const [pendingTx] = await this.db
      .select({
        id: paymentTransactions.id,
        orderCode: paymentTransactions.orderCode,
        amount: paymentTransactions.amount,
        status: paymentTransactions.status,
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.orderId, orderId),
          eq(paymentTransactions.status, "PENDING"),
          eq(paymentTransactions.paymentMethod, "PAYOS"),
        ),
      )
      .limit(1);
    return pendingTx;
  }

  async updatePaymentTransactionStatus(
    id: string,
    status: PaymentTransactionStatus,
  ): Promise<void> {
    await this.db
      .update(paymentTransactions)
      .set({ status })
      .where(eq(paymentTransactions.id, id));
  }

  async confirmPayOSPayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      // 1. Get the payment transaction by orderCode
      const [paymentTransaction] = await tx
        .select({
          id: paymentTransactions.id,
          orderId: paymentTransactions.orderId,
          amount: paymentTransactions.amount,
          status: paymentTransactions.status,
          transactionType: paymentTransactions.transactionType,
        })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderCode, Number(orderCode)))
        .limit(1);
      if (!paymentTransaction || paymentTransaction.status === "SUCCESS") {
        return false;
      }

      // 2. Get the order
      const [order] = await tx
        .select({
          id: orders.id,
          userId: orders.userId,
          paymentStatus: orders.paymentStatus,
        })
        .from(orders)
        .where(eq(orders.id, paymentTransaction.orderId))
        .limit(1);
      if (!order) {
        return false;
      }

      // Check for amount mismatch
      const expectedAmount = parseFloat(paymentTransaction.amount);
      const tolerance = 0.01;
      const isMismatch = Math.abs(amount - expectedAmount) > tolerance;

      if (isMismatch) {
        // Update the existing payment_transaction to FAILED
        await tx
          .update(paymentTransactions)
          .set({ status: "FAILED" })
          .where(eq(paymentTransactions.id, paymentTransaction.id));

        // Set order status to "SUSPICIOUS_PAYMENT_HOLD" and paymentStatus to "UNPAID"
        await tx
          .update(orders)
          .set({
            status: "SUSPICIOUS_PAYMENT_HOLD",
            paymentStatus: "UNPAID",
          })
          .where(eq(orders.id, order.id));

        // Insert high-priority TELEGRAM alert event to outbox_event
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
      // 3. Update payment_transaction status to SUCCESS & set bank referenceCode
      await tx
        .update(paymentTransactions)
        .set({ status: "SUCCESS", referenceCode })
        .where(eq(paymentTransactions.id, paymentTransaction.id));

      // 4. Determine order paymentStatus and transaction type
      let paymentStatus: OrderPaymentStatus;
      let transactionType: PaymentTransactionType;

      if (
        paymentTransaction.transactionType === "REMAINDER" ||
        order.paymentStatus === "DEPOSIT_PAID"
      ) {
        paymentStatus = "FULLY_PAID";
        transactionType = "REMAINDER";
      } else if (paymentTransaction.transactionType === "DEPOSIT") {
        paymentStatus = "DEPOSIT_PAID";
        transactionType = "DEPOSIT";
      } else {
        paymentStatus = "FULLY_PAID";
        transactionType = "FULL";
      }

      await tx
        .update(orders)
        .set({ paymentStatus })
        .where(eq(orders.id, order.id));

      // Get customer email
      const [customer] = await tx
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);
      const customerEmail = customer?.email ?? "customer@example.com";

      // 6. Insert outbox events for background jobs:
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

  async createDebtRepayment(
    data: CreateDebtRepaymentDTO,
  ): Promise<{ id: string }> {
    const [repayment] = await this.db
      .insert(debtRepayments)
      .values(data)
      .returning({
        id: debtRepayments.id,
      });
    if (!repayment) {
      throw new Error("errors.createDebtRepaymentFailed");
    }
    return repayment;
  }

  async getDebtRepaymentByReferenceCode(
    referenceCode: string,
  ): Promise<DebtRepaymentDTO | undefined> {
    const [repayment] = await this.db
      .select({
        id: debtRepayments.id,
        userId: debtRepayments.userId,
        amount: debtRepayments.amount,
        paymentMethod: debtRepayments.paymentMethod,
        status: debtRepayments.status,
        orderCode: debtRepayments.orderCode,
        referenceCode: debtRepayments.referenceCode,
        verifiedBy: debtRepayments.verifiedBy,
      })
      .from(debtRepayments)
      .where(eq(debtRepayments.referenceCode, referenceCode))
      .limit(1);
    return repayment;
  }

  async getDebtRepaymentByOrderCode(
    orderCode: number,
  ): Promise<DebtRepaymentDTO | undefined> {
    const [repayment] = await this.db
      .select({
        id: debtRepayments.id,
        userId: debtRepayments.userId,
        amount: debtRepayments.amount,
        paymentMethod: debtRepayments.paymentMethod,
        status: debtRepayments.status,
        orderCode: debtRepayments.orderCode,
        referenceCode: debtRepayments.referenceCode,
        verifiedBy: debtRepayments.verifiedBy,
      })
      .from(debtRepayments)
      .where(eq(debtRepayments.orderCode, orderCode))
      .limit(1);
    return repayment;
  }

  async updateDebtRepayment(
    id: string,
    data: UpdateDebtRepaymentDTO,
  ): Promise<DebtRepaymentDTO> {
    const [updated] = await this.db
      .update(debtRepayments)
      .set(data)
      .where(eq(debtRepayments.id, id))
      .returning({
        id: debtRepayments.id,
        userId: debtRepayments.userId,
        amount: debtRepayments.amount,
        paymentMethod: debtRepayments.paymentMethod,
        status: debtRepayments.status,
        orderCode: debtRepayments.orderCode,
        referenceCode: debtRepayments.referenceCode,
        verifiedBy: debtRepayments.verifiedBy,
      });
    if (!updated) {
      throw new Error("errors.debtRepaymentNotFound");
    }
    return updated;
  }

  async confirmDebtRepayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      // 1. Get the debt repayment by orderCode
      const [repayment] = await tx
        .select({
          id: debtRepayments.id,
          userId: debtRepayments.userId,
          amount: debtRepayments.amount,
          status: debtRepayments.status,
        })
        .from(debtRepayments)
        .where(eq(debtRepayments.orderCode, Number(orderCode)))
        .limit(1);

      if (!repayment || repayment.status === "COMPLETED") {
        return false;
      }

      // Check amount mismatch
      const expectedAmount = parseFloat(repayment.amount);
      const tolerance = 0.01;
      const isMismatch = Math.abs(amount - expectedAmount) > tolerance;

      if (isMismatch) {
        await tx
          .update(debtRepayments)
          .set({ status: "FAILED" })
          .where(eq(debtRepayments.id, repayment.id));
        return false;
      }

      // 2. Lock the user row (pessimistic lock SELECT FOR UPDATE)
      const [user] = await tx
        .select({
          id: users.id,
          currentDebt: users.currentDebt,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, repayment.userId))
        .for("update", { noWait: true });

      if (!user) {
        throw new Error("errors.userNotFound");
      }

      // 3. Deduct debt: currentDebt = currentDebt - amount
      const currentDebtNum = parseFloat(user.currentDebt || "0");
      const newDebt = Math.max(0, currentDebtNum - amount).toFixed(2);

      await tx
        .update(users)
        .set({ currentDebt: newDebt })
        .where(eq(users.id, user.id));

      // 4. Update debt repayment status to COMPLETED and set referenceCode
      await tx
        .update(debtRepayments)
        .set({ status: "COMPLETED", referenceCode })
        .where(eq(debtRepayments.id, repayment.id));

      // 5. Delete Redis block key for overdue lock
      try {
        const { clearOverdueLock } = await import("@nhatnang/shared");
        await clearOverdueLock(user.id);
      } catch (e) {
        console.warn("Failed to delete Redis overdue lock key:", e);
      }

      // 6. Write outbox alert/mail events
      await tx.insert(outboxEvents).values([
        {
          eventType: "SEND_MAIL",
          payload: {
            to: user.email,
            subject: `Xác nhận thanh toán công nợ`,
            body: `Xin chào ${user.name},\n\nYêu cầu thanh toán công nợ trị giá ${amount.toLocaleString("vi-VN")} VND đã được hoàn tất.\nSố dư nợ hiện tại của bạn là: ${parseFloat(newDebt).toLocaleString("vi-VN")} VND.`,
          },
          status: "PENDING",
        },
        {
          eventType: "SEND_TELEGRAM_ALERT",
          payload: {
            message: `💼 [CÔNG NỢ] Khách hàng ${user.name} đã thanh toán dư nợ thành công!\n- Số tiền: ${amount.toLocaleString("vi-VN")} VND\n- Số dư nợ còn lại: ${parseFloat(newDebt).toLocaleString("vi-VN")} VND\n- Cổng: PayOS\n- Mã GD: ${referenceCode}`,
          },
          status: "PENDING",
        },
      ]);

      return true;
    });
  }

  async getDebtRepaymentsByUserId(userId: string): Promise<DebtRepaymentDTO[]> {
    return await this.db
      .select({
        id: debtRepayments.id,
        userId: debtRepayments.userId,
        amount: debtRepayments.amount,
        paymentMethod: debtRepayments.paymentMethod,
        status: debtRepayments.status,
        orderCode: debtRepayments.orderCode,
        referenceCode: debtRepayments.referenceCode,
        verifiedBy: debtRepayments.verifiedBy,
      })
      .from(debtRepayments)
      .where(eq(debtRepayments.userId, userId));
  }
}
