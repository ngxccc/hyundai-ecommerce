import { Inject, Injectable, Optional } from "@nestjs/common";
import {
  I18nBadRequestException,
  I18nForbiddenException,
  I18nNotFoundException,
} from "@/common/exceptions";
import { eq, sql } from "drizzle-orm";
import {
  DATABASE_CONNECTION,
  type DrizzleDB,
} from "@/database/database.module";
import {
  debtRepayments,
  orders,
  outboxEvents,
  payments,
  paymentTransactions,
  users,
} from "@/database/schemas";
import { env } from "@/env";
import { OUTBOX_EVENT_TYPE } from "@/common/constants/event.constant";
import {
  formatPayOSDescription,
  generatePayOSOrderCode,
  verifyPayOSSignature,
} from "./payos.util";
import {
  PAYOS_RESPONSE_CODE,
  PAYMENT_LOCK,
  buildPaymentLockKey,
  buildPayOSCheckoutUrl,
  buildSimulatedVietQR,
} from "./constants/payment.constant";
import {
  PAYMENT_GATEWAY_TOKEN,
  type PaymentGateway,
} from "./interfaces/payment-gateway.interface";
import { RedlockService } from "@/common/services/redlock.service";
import type {
  CheckoutLinkResponseDto,
  CreateCheckoutLinkDto,
  DebtRepaymentResponseDto,
  OrderPaymentSummaryDto,
  PaymentTransactionResponseDto,
  PayOSWebhookDto,
  PayOSWebhookResponseDto,
  RepayDebtDto,
  VerifyCashPaymentDto,
} from "./dto";

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
    @Optional()
    private readonly redlockService?: RedlockService,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway?: PaymentGateway,
  ) {}

  /**
   * Generates a PayOS checkout payment link and dynamic VietQR code for an order.
   *
   * @param dto - Payment link configuration including order ID and transaction type.
   * @returns Generated PayOS checkout details including redirect URL and QR code.
   * @throws NotFoundException if order does not exist.
   * @throws BadRequestException if order is cancelled or already fully paid.
   */
  async createCheckoutLink(
    dto: CreateCheckoutLinkDto,
  ): Promise<CheckoutLinkResponseDto> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, dto.orderId))
      .limit(1);

    if (!order) {
      throw new I18nNotFoundException("payments.ORDER_NOT_FOUND");
    }

    if (order.status === "CANCELLED") {
      throw new I18nBadRequestException("orders.ORDER_CANNOT_BE_CANCELLED");
    }

    if (order.paymentStatus === "FULLY_PAID") {
      throw new I18nBadRequestException("payments.ORDER_ALREADY_PAID");
    }

    const totalAmountNum = Number(order.totalAmount);
    let payableAmount: number;

    if (dto.transactionType === "DEPOSIT") {
      const rate = env.DEPOSIT_RATE || 0.2;
      payableAmount = Math.round(totalAmountNum * rate);
    } else if (dto.transactionType === "REMAINING") {
      const depositNum = Number(order.depositAmount);
      payableAmount = Math.max(0, Math.round(totalAmountNum - depositNum));
    } else {
      payableAmount = Math.round(totalAmountNum);
    }

    const orderCode = generatePayOSOrderCode();
    const formattedAmount = payableAmount.toFixed(2);

    // Save pending payment transaction
    await this.db.insert(paymentTransactions).values({
      orderId: order.id,
      amount: formattedAmount,
      paymentMethod: "PAYOS",
      transactionType: dto.transactionType,
      status: "PENDING",
      orderCode,
    });

    // Save or update base payment record
    const [existingPayment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    if (existingPayment) {
      await this.db
        .update(payments)
        .set({
          amount: formattedAmount,
          method: "PAYOS",
          status: "PENDING",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await this.db.insert(payments).values({
        orderId: order.id,
        amount: formattedAmount,
        method: "PAYOS",
        status: "PENDING",
      });
    }

    const description = formatPayOSDescription(order.orderNumber, order.id);
    const returnUrl = dto.returnUrl ?? `${env.FRONTEND_URL}/checkout/success`;
    const cancelUrl = dto.cancelUrl ?? `${env.FRONTEND_URL}/checkout/cancel`;

    const { checkoutUrl, qrCode, paymentLinkId } = this.paymentGateway
      ? await this.paymentGateway.createPaymentLink({
          amount: payableAmount,
          cancelUrl,
          description,
          orderCode,
          returnUrl,
        })
      : {
          checkoutUrl: buildPayOSCheckoutUrl(orderCode),
          qrCode: buildSimulatedVietQR(orderCode),
          paymentLinkId: `plink_${orderCode.toString()}`,
        };

    return {
      checkoutUrl,
      qrCode,
      orderCode,
      amount: payableAmount,
      paymentLinkId,
    };
  }

  /**
   * Cryptographically verifies and idempotently processes incoming PayOS webhook events.
   *
   * @param webhookDto - Full webhook payload with HMAC-SHA256 signature.
   * @returns Processing result acknowledgment.
   * @throws BadRequestException if signature is invalid or payment amount does not match.
   */
  async handlePayOSWebhook(
    webhookDto: PayOSWebhookDto,
  ): Promise<PayOSWebhookResponseDto> {
    const isAuthentic = verifyPayOSSignature(
      webhookDto.data,
      webhookDto.signature,
      env.PAYOS_CHECKSUM_KEY,
    );

    if (!isAuthentic) {
      throw new I18nBadRequestException("payments.INVALID_PAYMENT_SIGNATURE");
    }

    // Acknowledge non-success webhook codes (cancelled, expired) without error
    if (webhookDto.code !== PAYOS_RESPONSE_CODE.SUCCESS) {
      return { processed: false, reason: "Non-success code acknowledged" };
    }

    const { orderCode, amount, reference } = webhookDto.data;

    // Acquire distributed lock to defend against concurrent duplicate webhook deliveries.
    const lockKey = buildPaymentLockKey(orderCode);
    const lock = this.redlockService
      ? await this.redlockService.acquireLock([lockKey], PAYMENT_LOCK.TTL_MS)
      : null;

    try {
      const [tx] = await this.db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderCode, orderCode))
        .limit(1);

      if (tx) {
        if (tx.status === "COMPLETED") {
          return {
            processed: true,
            reason: "Transaction already processed",
          };
        }

        // Validate payment amount
        const expectedAmount = Number(tx.amount);
        if (amount < expectedAmount) {
          await this.db
            .update(paymentTransactions)
            .set({ status: "FAILED", updatedAt: new Date() })
            .where(eq(paymentTransactions.id, tx.id));

          throw new I18nBadRequestException("payments.PAYMENT_AMOUNT_MISMATCH");
        }

        const [order] = await this.db
          .select()
          .from(orders)
          .where(eq(orders.id, tx.orderId))
          .limit(1);

        await this.db.transaction(async (dbTx) => {
          // Update transaction status
          await dbTx
            .update(paymentTransactions)
            .set({
              status: "COMPLETED",
              referenceCode: reference ?? null,
              updatedAt: new Date(),
            })
            .where(eq(paymentTransactions.id, tx.id));

          // Update payment status
          await dbTx
            .update(payments)
            .set({
              status: "COMPLETED",
              rawPayload: JSON.stringify(webhookDto.data),
              updatedAt: new Date(),
            })
            .where(eq(payments.orderId, tx.orderId));

          // Update order status based on transaction type
          if (order) {
            const isDeposit = tx.transactionType === "DEPOSIT";
            const newPaymentStatus = isDeposit ? "DEPOSIT_PAID" : "FULLY_PAID";
            const newStatus =
              order.status === "PENDING" ? "PROCESSING" : order.status;

            const depositAmt = isDeposit ? tx.amount : order.totalAmount;
            const remainingAmt = isDeposit
              ? Math.max(
                  0,
                  Number(order.totalAmount) - Number(tx.amount),
                ).toFixed(2)
              : "0.00";

            await dbTx
              .update(orders)
              .set({
                paymentStatus: newPaymentStatus,
                status: newStatus,
                depositAmount: depositAmt,
                remainingAmount: remainingAmt,
                updatedAt: new Date(),
              })
              .where(eq(orders.id, order.id));

            if (order.status === "PENDING") {
              await dbTx.insert(outboxEvents).values({
                eventType: OUTBOX_EVENT_TYPE.ORDER_CONFIRMED,
                payload: {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                },
              });
            }
          }

          // Emit payment completed outbox event
          await dbTx.insert(outboxEvents).values({
            eventType: OUTBOX_EVENT_TYPE.PAYMENT_COMPLETED,
            payload: {
              orderId: tx.orderId,
              orderCode,
              amount,
              transactionType: tx.transactionType,
              referenceCode: reference ?? null,
            },
          });
        });

        return { processed: true };
      }
      const [debt] = await this.db
        .select()
        .from(debtRepayments)
        .where(eq(debtRepayments.orderCode, orderCode))
        .limit(1);

      if (debt) {
        if (debt.status === "COMPLETED") {
          return {
            processed: true,
            reason: "Debt repayment already processed",
          };
        }
        await this.db.transaction(async (dbTx) => {
          await dbTx
            .update(debtRepayments)
            .set({
              status: "COMPLETED",
              referenceCode: reference ?? null,
              updatedAt: new Date(),
            })
            .where(eq(debtRepayments.id, debt.id));

          // Atomically decrease dealer debt
          await dbTx
            .update(users)
            .set({
              currentDebt: sql`GREATEST(0, ${users.currentDebt} - ${debt.amount})`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, debt.userId));

          await dbTx.insert(outboxEvents).values({
            eventType: OUTBOX_EVENT_TYPE.DEBT_REPAID,
            payload: {
              userId: debt.userId,
              amount: debt.amount,
              orderCode,
              referenceCode: reference ?? null,
            },
          });
        });

        return { processed: true };
      }

      return {
        processed: false,
        reason: "Order code not recognized",
      };
    } finally {
      if (lock && this.redlockService) {
        await this.redlockService.releaseLock(lock);
      }
    }
  }
  /**
   * Confirms offline cash payment receipt for an order by Admin or Accountant.
   *
   * @param orderId - Order UUID identifier.
   * @param dto - Collected cash amount and receipt notes.
   * @param adminUserId - Authenticated admin user performing cash verification.
   * @returns Updated order payment summary.
   * @throws NotFoundException if order does not exist.
   * @throws BadRequestException if order is cancelled or already paid.
   */
  async verifyCashPayment(
    orderId: string,
    dto: VerifyCashPaymentDto,
    adminUserId: string,
  ): Promise<OrderPaymentSummaryDto> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new I18nNotFoundException("payments.ORDER_NOT_FOUND");
    }

    if (order.status === "CANCELLED") {
      throw new I18nBadRequestException("orders.ORDER_CANNOT_BE_CANCELLED");
    }

    if (order.paymentStatus === "FULLY_PAID") {
      throw new I18nBadRequestException("payments.ORDER_ALREADY_PAID");
    }

    const cashAmountNum = Number(dto.amount);
    const formattedAmount = cashAmountNum.toFixed(2);
    const newStatus = order.status === "PENDING" ? "PROCESSING" : order.status;

    await this.db.transaction(async (tx) => {
      // Record cash payment transaction
      await tx.insert(paymentTransactions).values({
        orderId: order.id,
        amount: formattedAmount,
        paymentMethod: "CASH",
        transactionType: "FULL_PAYMENT",
        status: "COMPLETED",
        verifiedBy: adminUserId,
      });

      // Update base payment record
      const [existingPayment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .limit(1);

      if (existingPayment) {
        await tx
          .update(payments)
          .set({
            amount: formattedAmount,
            method: "CASH",
            status: "COMPLETED",
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id));
      } else {
        await tx.insert(payments).values({
          orderId: order.id,
          amount: formattedAmount,
          method: "CASH",
          status: "COMPLETED",
        });
      }

      // Update order status
      const updatedNote = dto.note
        ? `${order.note ?? ""} [Cash Verified: ${dto.note}]`.trim()
        : order.note;

      await tx
        .update(orders)
        .set({
          paymentMethod: "CASH",
          paymentStatus: "FULLY_PAID",
          status: newStatus,
          depositAmount: formattedAmount,
          remainingAmount: "0.00",
          note: updatedNote,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      if (order.status === "PENDING") {
        await tx.insert(outboxEvents).values({
          eventType: OUTBOX_EVENT_TYPE.ORDER_CONFIRMED,
          payload: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });
      }

      await tx.insert(outboxEvents).values({
        eventType: OUTBOX_EVENT_TYPE.PAYMENT_COMPLETED,
        payload: {
          orderId: order.id,
          amount: formattedAmount,
          paymentMethod: "CASH",
          verifiedBy: adminUserId,
        },
      });
    });

    return this.getOrderPaymentSummary(order.id);
  }

  /**
   * Processes dealer debt repayment via PayOS online gateway or Admin cash confirmation.
   *
   * @param dto - Debt repayment specification.
   * @param currentUserId - Authenticated user initiating repayment.
   * @returns Created or completed debt repayment response.
   * @throws NotFoundException if target dealer user does not exist.
   */
  async repayDebt(
    dto: RepayDebtDto,
    currentUserId?: string,
    currentUserRole = "ADMIN",
  ): Promise<DebtRepaymentResponseDto> {
    if (dto.paymentMethod === "CASH" && currentUserRole !== "ADMIN") {
      throw new I18nForbiddenException("payments.ONLY_ADMIN_CASH_VERIFY");
    }

    if (
      dto.userId &&
      dto.userId !== currentUserId &&
      currentUserRole !== "ADMIN"
    ) {
      throw new I18nForbiddenException("payments.FORBIDDEN_REPAY_OTHER");
    }

    const targetUserId =
      currentUserRole === "ADMIN"
        ? (dto.userId ?? currentUserId)
        : currentUserId;
    if (!targetUserId) {
      throw new I18nBadRequestException("payments.DEALER_NOT_FOUND");
    }

    const [dealer] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!dealer) {
      throw new I18nNotFoundException("payments.DEALER_NOT_FOUND");
    }

    const repaymentAmount = Number(dto.amount);
    const formattedAmount = repaymentAmount.toFixed(2);
    const orderCode = generatePayOSOrderCode();

    if (dto.paymentMethod === "CASH") {
      // Immediate settlement by Admin/Sales
      const [repayment] = await this.db.transaction(async (tx) => {
        const [rep] = await tx
          .insert(debtRepayments)
          .values({
            userId: dealer.id,
            amount: formattedAmount,
            paymentMethod: "CASH",
            status: "COMPLETED",
            orderCode,
            verifiedBy: currentUserId ?? null,
          })
          .returning();

        await tx
          .update(users)
          .set({
            currentDebt: sql`GREATEST(0, ${users.currentDebt} - ${formattedAmount})`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, dealer.id));

        await tx.insert(outboxEvents).values({
          eventType: OUTBOX_EVENT_TYPE.DEBT_REPAID,
          payload: {
            userId: dealer.id,
            amount: formattedAmount,
            paymentMethod: "CASH",
            verifiedBy: currentUserId ?? null,
          },
        });

        return [rep];
      });

      if (!repayment) {
        throw new I18nBadRequestException("payments.DEBT_REPAYMENT_FAILED");
      }

      return {
        id: repayment.id,
        userId: repayment.userId,
        amount: repayment.amount,
        paymentMethod: repayment.paymentMethod,
        status: repayment.status,
        orderCode: repayment.orderCode,
        referenceCode: repayment.referenceCode,
        verifiedBy: repayment.verifiedBy,
        createdAt: repayment.createdAt,
        updatedAt: repayment.updatedAt,
      };
    }

    // PayOS online debt repayment
    const [repayment] = await this.db
      .insert(debtRepayments)
      .values({
        userId: dealer.id,
        amount: formattedAmount,
        paymentMethod: "PAYOS",
        status: "PENDING",
        orderCode,
      })
      .returning();

    if (!repayment) {
      throw new I18nBadRequestException("payments.DEBT_REGISTER_FAILED");
    }
    const paymentLink = this.paymentGateway
      ? await this.paymentGateway.createPaymentLink({
          amount: repaymentAmount,
          cancelUrl: `${env.FRONTEND_URL}/dealer/debt`,
          description: `DEBT-${dealer.id.replace(/-/g, "").slice(0, 20)}`,
          orderCode,
          returnUrl: `${env.FRONTEND_URL}/dealer/debt?status=success`,
        })
      : {
          checkoutUrl: buildPayOSCheckoutUrl(orderCode),
          qrCode: buildSimulatedVietQR(orderCode),
        };

    const checkoutUrl = paymentLink.checkoutUrl;
    const qrCode = paymentLink.qrCode;

    return {
      id: repayment.id,
      userId: repayment.userId,
      amount: repayment.amount,
      paymentMethod: repayment.paymentMethod,
      status: repayment.status,
      orderCode: repayment.orderCode,
      referenceCode: repayment.referenceCode,
      verifiedBy: repayment.verifiedBy,
      checkoutUrl,
      qrCode,
      createdAt: repayment.createdAt,
      updatedAt: repayment.updatedAt,
    };
  }

  /**
   * Retrieves summary of order payment status and associated transactions.
   *
   * @param orderId - Order UUID identifier.
   * @returns Order payment status summary and transaction list.
   * @throws NotFoundException if order does not exist.
   */
  async getOrderPaymentSummary(
    orderId: string,
  ): Promise<OrderPaymentSummaryDto> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new I18nNotFoundException("payments.ORDER_NOT_FOUND");
    }

    const txList = await this.db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.orderId, orderId));

    const transactions: PaymentTransactionResponseDto[] = txList.map((t) => ({
      id: t.id,
      orderId: t.orderId,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      transactionType: t.transactionType,
      status: t.status,
      orderCode: t.orderCode,
      referenceCode: t.referenceCode,
      verifiedBy: t.verifiedBy,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      depositAmount: order.depositAmount,
      remainingAmount: order.remainingAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactions,
    };
  }
}
