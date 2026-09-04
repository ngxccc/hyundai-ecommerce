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
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "../helpers/app.helper";
import { createAuthenticatedUser } from "../helpers/auth.helper";
import { eq } from "drizzle-orm";
import { type DrizzleDB } from "@/database/database.module";
import {
  leadItems,
  leads,
  orderItems,
  orders,
  outboxEvents,
  products,
  warehouses,
  warehouseStocks,
} from "@/database/schemas";
import type { components } from "../generated/api-schema";

type OrderData = components["schemas"]["OrderResponseDto"];

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe("Orders Module Integration", () => {
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
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(leadItems);
    await db.delete(leads);
    await db.delete(warehouseStocks);
    await db.delete(warehouses);
    await db.delete(products);
  }, 15000);

  describe("Guest Storefront Checkout & Inventory Allocation", () => {
    it("should allow guest to checkout, deduct stock atomically, and emit outbox event", async () => {
      // 1. Seed product and warehouse stock
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Diesel Hyundai DHY65KSE",
          slug: "may-phat-dien-diesel-hyundai-dhy65kse",
          price: "245000000.00",
          totalStockCache: 5,
        })
        .returning();

      const [warehouse] = await db
        .insert(warehouses)
        .values({
          nameVi: "Kho Hà Nội",
          streetAddress: "KCN Ngọc Hồi",
          district: "Thanh Trì",
          city: "Hà Nội",
        })
        .returning();

      const productId = product?.id ?? "";
      const warehouseId = warehouse?.id ?? "";

      await db.insert(warehouseStocks).values({
        warehouseId,
        productId,
        stock: 5,
        minStockWarning: 1,
      });

      // 2. Guest places retail order for 2 units
      const checkoutRes = await request(getHttpServer())
        .post("/orders/checkout")
        .send({
          customerName: "Nguyễn Văn Khách",
          customerPhone: "0901234567",
          customerEmail: "khachhang@gmail.com",
          shippingAddress: "Số 123 Đường Láng, Hà Nội",
          paymentMethod: "PAYOS",
          note: "Giao giờ hành chính",
          items: [
            {
              productId,
              quantity: 2,
            },
          ],
        });

      expect(checkoutRes.status).toBe(201);
      const order = (
        checkoutRes.body as unknown as GenericSuccessResponse<OrderData>
      ).data;

      expect(order.status).toBe("PENDING");
      expect(order.userId).toBeNull();
      expect(order.customerName).toBe("Nguyễn Văn Khách");
      expect(order.totalAmount).toBe("490000000.00");
      expect(order.items.length).toBe(1);

      // 3. Verify stock deduction in products table (5 - 2 = 3)
      const [updatedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(updatedProduct?.totalStockCache).toBe(3);

      // 4. Verify stock deduction in warehouse_stocks table (5 - 2 = 3)
      const [updatedStock] = await db
        .select()
        .from(warehouseStocks)
        .where(eq(warehouseStocks.productId, productId));
      expect(updatedStock?.stock).toBe(3);

      // 5. Verify outbox event was recorded
      const outbox = await db.select().from(outboxEvents);
      expect(outbox.length).toBe(1);
      expect(outbox[0]?.eventType).toBe("order.created");
    }, 25000);

    it("should reject checkout when requested quantity exceeds available stock", async () => {
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện mini 3kVA",
          slug: "may-phat-dien-mini-3kva",
          price: "15000000.00",
          totalStockCache: 2,
        })
        .returning();

      const productId = product?.id ?? "";

      const checkoutRes = await request(getHttpServer())
        .post("/orders/checkout")
        .send({
          customerName: "Khách Mua Nhiều",
          customerPhone: "0909888777",
          shippingAddress: "Quận 1, TP.HCM",
          paymentMethod: "PAYOS",
          items: [
            {
              productId,
              quantity: 5, // exceeds stock of 2
            },
          ],
        });

      expect(checkoutRes.status).toBe(400);
    }, 25000);
  });

  describe("B2B Corporate Orders & Lifecycle State Machine", () => {
    it("should allow admin to create B2B order, transition status, and restock upon cancellation", async () => {
      const { authHeader: adminAuth, user: adminUser } =
        await createAuthenticatedUser(db, jwtService, {
          email: "admin.orders@hyundai-nhatnang.vn",
          role: "ADMIN",
        });

      // 1. Seed product & warehouse stock
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Hyundai 100kVA",
          slug: "may-phat-dien-hyundai-100kva",
          price: "320000000.00",
          totalStockCache: 4,
        })
        .returning();

      const [warehouse] = await db
        .insert(warehouses)
        .values({
          nameVi: "Kho Miền Trung",
          streetAddress: "KCN Hòa Khánh",
          district: "Liên Chiểu",
          city: "Đà Nẵng",
        })
        .returning();

      const productId = product?.id ?? "";
      const warehouseId = warehouse?.id ?? "";

      await db.insert(warehouseStocks).values({
        warehouseId,
        productId,
        stock: 4,
      });
      // 2. Seed CRM Lead to test sales attribution & 2-way traceability
      const [lead] = await db
        .insert(leads)
        .values({
          leadCode: "LEAD-20260904-001",
          fullName: "Nguyễn Văn Đại Lý",
          phoneNumber: "0988776655",
          companyName: "Công ty Cổ phần Cơ Điện ABC",
          city: "Đà Nẵng",
          ward: "Hòa Khánh Bắc",
          streetAddress: "KCN Hòa Khánh",
          assignedSalesId: adminUser.id,
        })
        .returning();
      const leadId = lead?.id ?? "";

      // 3. Admin creates B2B corporate order linked to lead with TRADE_CREDIT
      const b2bRes = await request(getHttpServer())
        .post("/orders/admin")
        .set(adminAuth)
        .send({
          userId: adminUser.id,
          leadId,
          customerName: "Công ty Cơ Điện ABC",
          customerPhone: "0988776655",
          companyName: "Công ty Cổ phần Cơ Điện ABC",
          shippingAddress: "Công trường Khách sạn Quốc tế Đà Nẵng",
          paymentMethod: "TRADE_CREDIT",
          shippingFee: 1000000,
          depositAmount: 50000000,
          items: [
            {
              productId,
              quantity: 1,
              unitPrice: 300000000, // custom price: 300,000,000 + 1,000,000 shipping = 301,000,000
            },
          ],
        });
      expect(b2bRes.status).toBe(201);
      const b2bOrder = (
        b2bRes.body as unknown as GenericSuccessResponse<OrderData>
      ).data;

      expect(b2bOrder.leadId).toBe(leadId);
      expect(b2bOrder.paymentMethod).toBe("TRADE_CREDIT");
      expect(b2bOrder.totalAmount).toBe("301000000.00");
      expect(b2bOrder.depositAmount).toBe("50000000.00");
      expect(b2bOrder.remainingAmount).toBe("251000000.00");

      // Verify leadId persisted in database
      const [dbOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, b2bOrder.id));
      expect(dbOrder?.leadId).toBe(leadId);

      // Verify stock decreased to 3
      const [stockAfterOrder] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(stockAfterOrder?.totalStockCache).toBe(3);

      // 3. Update status along state machine: PENDING -> PROCESSING
      const updateRes = await request(getHttpServer())
        .patch(`/orders/${b2bOrder.id}/status`)
        .set(adminAuth)
        .send({
          status: "PROCESSING",
          note: "Đã ký biên bản bảo lãnh công nợ",
        });

      expect(updateRes.status).toBe(200);
      const updatedOrder = (
        updateRes.body as unknown as GenericSuccessResponse<OrderData>
      ).data;
      expect(updatedOrder.status).toBe("PROCESSING");

      // 4. Cancel order and verify atomic restocking
      const cancelRes = await request(getHttpServer())
        .post(`/orders/${b2bOrder.id}/cancel`)
        .set(adminAuth);

      expect(cancelRes.status).toBe(200);
      const cancelledOrder = (
        cancelRes.body as unknown as GenericSuccessResponse<OrderData>
      ).data;
      expect(cancelledOrder.status).toBe("CANCELLED");

      // Verify stock is restored back to 4 in products and warehouse_stocks
      const [restockedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(restockedProduct?.totalStockCache).toBe(4);

      const [restockedWarehouse] = await db
        .select()
        .from(warehouseStocks)
        .where(eq(warehouseStocks.productId, productId));
      expect(restockedWarehouse?.stock).toBe(4);
    }, 25000);
  });

  describe("Auto-Expiration Cron Routine (ADR 0012)", () => {
    it("should cancel expired pending orders and release inventory back into stock", async () => {
      // 1. Seed product with stock 1
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện xăng 5kW",
          slug: "may-phat-dien-xang-5kw",
          price: "25000000.00",
          totalStockCache: 1,
        })
        .returning();

      const productId = product?.id ?? "";

      // 2. Create pending order via checkout (stock becomes 0)
      const checkoutRes = await request(getHttpServer())
        .post("/orders/checkout")
        .send({
          customerName: "Khách Chờ Thanh Toán",
          customerPhone: "0905556667",
          shippingAddress: "Đà Nẵng",
          paymentMethod: "PAYOS",
          items: [{ productId, quantity: 1 }],
        });

      const orderId = (
        checkoutRes.body as unknown as GenericSuccessResponse<OrderData>
      ).data.id;

      // Verify stock is now 0
      const [depleted] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(depleted?.totalStockCache).toBe(0);

      // 3. Backdate order createdAt to 25 minutes ago (> 15-minute threshold)
      const pastDate = new Date(Date.now() - 25 * 60 * 1000);
      await db
        .update(orders)
        .set({ createdAt: pastDate })
        .where(eq(orders.id, orderId));

      // 4. Trigger auto-expiration cron endpoint
      const cronRes = await request(getHttpServer()).post(
        "/orders/cron/expire",
      );

      expect(cronRes.status).toBe(200);
      const cronBody = (
        cronRes.body as unknown as GenericSuccessResponse<{
          expiredCount: number;
        }>
      ).data;
      expect(cronBody.expiredCount).toBe(1);

      // 5. Verify order is CANCELLED and stock is restored to 1
      const [cancelledOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));
      expect(cancelledOrder?.status).toBe("CANCELLED");

      const [restoredProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(restoredProduct?.totalStockCache).toBe(1);
    }, 25000);
  });
});
