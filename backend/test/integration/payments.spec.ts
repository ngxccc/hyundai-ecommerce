import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import request from "supertest";
import { type INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { createAuthenticatedUser } from "../helpers/auth.helper";
import { type DrizzleDB } from "@/database/database.module";
import {
  debtRepayments,
  orderItems,
  orders,
  outboxEvents,
  payments,
  paymentTransactions,
  products,
  users,
} from "@/database/schemas";
import { generatePayOSSignature } from "@/modules/payments/payos.util";
import { env } from "@/env";
import type { components } from "../generated/api-schema";

type CheckoutLinkData = components["schemas"]["CheckoutLinkResponseDto"];
type OrderPaymentSummaryData = components["schemas"]["OrderPaymentSummaryDto"];
type DebtRepaymentData = components["schemas"]["DebtRepaymentResponseDto"];

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe("Payments Module Integration", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  let jwtService: JwtService;

  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
    jwtService = app.get(JwtService);
  }, 30000);

  afterAll(async () => {
    await teardownTestApp(setup);
  }, 30000);

  beforeEach(async () => {
    await db.delete(outboxEvents);
    await db.delete(debtRepayments);
    await db.delete(paymentTransactions);
    await db.delete(payments);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(users);
  }, 15000);

  describe("PayOS Checkout Link & VietQR Generation", () => {
    it("should generate PayOS checkout link, record pending transaction, and return details", async () => {
      // 1. Seed product and pending order
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: "ORD-20260904-1001",
          customerName: "Nguyễn Văn Khách",
          customerPhone: "0901234567",
          shippingAddress: "Số 10 Hai Bà Trưng, Hà Nội",
          totalAmount: "25000000.00",
          paymentMethod: "PAYOS",
          paymentStatus: "PENDING",
          status: "PENDING",
        })
        .returning();

      const orderId = order?.id ?? "";

      // 2. Customer initiates PayOS payment link generation
      const linkRes = await request(getHttpServer())
        .post("/payments/checkout-link")
        .send({
          orderId,
          transactionType: "FULL_PAYMENT",
        });

      expect(linkRes.status).toBe(201);
      const linkData = (
        linkRes.body as unknown as GenericSuccessResponse<CheckoutLinkData>
      ).data;

      expect(linkData.amount).toBe(25000000);
      expect(linkData.orderCode).toBeGreaterThan(0);
      expect(linkData.checkoutUrl).toContain("pay.payos.vn/web/");

      // 3. Verify pending records persisted in database
      const [tx] = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderId, orderId));

      expect(tx?.status).toBe("PENDING");
      expect(tx?.orderCode).toBe(linkData.orderCode);
      expect(tx?.amount).toBe("25000000.00");

      const [pay] = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, orderId));

      expect(pay?.status).toBe("PENDING");
      expect(pay?.method).toBe("PAYOS");
    }, 25000);
  });

  describe("PayOS Webhook Verification & Idempotent Processing", () => {
    it("should verify HMAC-SHA256 signature, mark order PROCESSING/FULLY_PAID, and emit outbox events", async () => {
      // 1. Seed pending order and transaction
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: "ORD-20260904-1002",
          customerName: "Trần Thị Mai",
          customerPhone: "0912345678",
          shippingAddress: "Đà Nẵng",
          totalAmount: "50000000.00",
          paymentMethod: "PAYOS",
          paymentStatus: "PENDING",
          status: "PENDING",
        })
        .returning();

      const orderId = order?.id ?? "";
      const orderCode = 1725450001002;

      await db.insert(paymentTransactions).values({
        orderId,
        amount: "50000000.00",
        paymentMethod: "PAYOS",
        transactionType: "FULL_PAYMENT",
        status: "PENDING",
        orderCode,
      });

      await db.insert(payments).values({
        orderId,
        amount: "50000000.00",
        method: "PAYOS",
        status: "PENDING",
      });

      // 2. PayOS invokes webhook with authentic signature
      const webhookData = {
        orderCode,
        amount: 50000000,
        description: "ORD-20260904-1002",
        reference: "BANK-REF-999888",
      };
      const signature = generatePayOSSignature(
        webhookData,
        env.PAYOS_CHECKSUM_KEY,
      );

      const webhookRes = await request(getHttpServer())
        .post("/payments/payos-webhook")
        .send({
          code: "00",
          desc: "Success",
          success: true,
          data: webhookData,
          signature,
        });

      expect(webhookRes.status).toBe(200);

      // 3. Verify order status transitioned to PROCESSING and paymentStatus to FULLY_PAID
      const [updatedOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      expect(updatedOrder?.status).toBe("PROCESSING");
      expect(updatedOrder?.paymentStatus).toBe("FULLY_PAID");

      // 4. Verify transaction marked COMPLETED
      const [updatedTx] = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderCode, orderCode));

      expect(updatedTx?.status).toBe("COMPLETED");
      expect(updatedTx?.referenceCode).toBe("BANK-REF-999888");

      // 5. Verify Outbox events recorded
      const outboxList = await db.select().from(outboxEvents);
      expect(outboxList.length).toBeGreaterThanOrEqual(2);
      const eventTypes = outboxList.map((e) => e.eventType);
      expect(eventTypes).toContain("payment.completed");
      expect(eventTypes).toContain("order.confirmed");

      // 6. Test Idempotency: Re-sending identical webhook returns 200 without error
      const repeatRes = await request(getHttpServer())
        .post("/payments/payos-webhook")
        .send({
          code: "00",
          desc: "Success",
          success: true,
          data: webhookData,
          signature,
        });

      expect(repeatRes.status).toBe(200);
    }, 25000);

    it("should reject tampered or invalid webhook signatures with 400 Bad Request", async () => {
      const webhookRes = await request(getHttpServer())
        .post("/payments/payos-webhook")
        .send({
          code: "00",
          desc: "Success",
          success: true,
          data: {
            orderCode: 999999,
            amount: 1000000,
            description: "Spoofed payment",
          },
          signature: "tampered_fake_signature_abc123",
        });

      expect(webhookRes.status).toBe(400);
    }, 25000);
  });

  describe("Accountant & Admin Offline Cash Verification", () => {
    it("should verify cash payment and update order to PROCESSING and FULLY_PAID", async () => {
      const { authHeader: adminAuth, user: adminUser } =
        await createAuthenticatedUser(db, jwtService, {
          email: "accountant@hyundai.vn",
          role: "ADMIN",
        });

      // 1. Seed pending order
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: "ORD-20260904-CASH-1",
          customerName: "Công ty Cơ Điện X",
          customerPhone: "0933445566",
          shippingAddress: "Kho Đà Nẵng",
          totalAmount: "30000000.00",
          paymentMethod: "CASH",
          paymentStatus: "PENDING",
          status: "PENDING",
        })
        .returning();

      const orderId = order?.id ?? "";

      // 2. Admin verifies cash collection
      const verifyRes = await request(getHttpServer())
        .post(`/payments/${orderId}/verify-cash`)
        .set(adminAuth)
        .send({
          amount: 30000000,
          note: "Đã thu đủ 30 triệu đồng tiền mặt tại phòng kế toán",
        });

      expect(verifyRes.status).toBe(200);
      const summary = (
        verifyRes.body as unknown as GenericSuccessResponse<OrderPaymentSummaryData>
      ).data;

      expect(summary.paymentStatus).toBe("FULLY_PAID");
      expect(summary.transactions.length).toBe(1);
      expect(summary.transactions[0]?.status).toBe("COMPLETED");
      expect(summary.transactions[0]?.verifiedBy).toBe(adminUser.id);

      // 3. Verify order in DB
      const [dbOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      expect(dbOrder?.status).toBe("PROCESSING");
      expect(dbOrder?.paymentStatus).toBe("FULLY_PAID");
    }, 25000);
  });

  describe("B2B Dealer Debt Repayment & Credit Limit Adjustment", () => {
    it("should record debt repayment and atomically decrease dealer currentDebt", async () => {
      const { authHeader: adminAuth, user: adminUser } =
        await createAuthenticatedUser(db, jwtService, {
          email: "admin.debt@hyundai.vn",
          role: "ADMIN",
        });

      // 1. Seed dealer user with 80,000,000 debt
      const { user: dealerUser } = await createAuthenticatedUser(
        db,
        jwtService,
        {
          email: "dealer.central@hyundai.vn",
          role: "SALES",
        },
      );

      await db
        .update(users)
        .set({
          creditLimit: "500000000.00",
          currentDebt: "80000000.00",
        })
        .where(eq(users.id, dealerUser.id));

      // 2. Process cash debt repayment of 30,000,000
      const repayRes = await request(getHttpServer())
        .post("/payments/repay-debt")
        .set(adminAuth)
        .send({
          userId: dealerUser.id,
          amount: 30000000,
          paymentMethod: "CASH",
          note: "Thanh toán công nợ đợt 1",
        });

      expect(repayRes.status).toBe(201);
      const repayData = (
        repayRes.body as unknown as GenericSuccessResponse<DebtRepaymentData>
      ).data;

      expect(repayData.status).toBe("COMPLETED");
      expect(repayData.amount).toBe("30000000.00");
      expect(repayData.verifiedBy).toBe(adminUser.id);

      // 3. Verify dealer's currentDebt decreased from 80,000,000 to 50,000,000
      const [updatedDealer] = await db
        .select()
        .from(users)
        .where(eq(users.id, dealerUser.id));

      expect(updatedDealer?.currentDebt).toBe("50000000.00");

      // 4. Verify debt.repaid outbox event
      const outboxList = await db.select().from(outboxEvents);
      const debtEvents = outboxList.filter(
        (e) => e.eventType === "debt.repaid",
      );
      expect(debtEvents.length).toBe(1);
    }, 25000);
  });
});
