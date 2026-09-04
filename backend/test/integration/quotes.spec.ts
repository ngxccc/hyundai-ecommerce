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
import { type DrizzleDB } from "@/database/database.module";
import {
  orderItems,
  orders,
  products,
  quoteItems,
  quoteMessages,
  quotes,
} from "@/database/schemas";
import type { components } from "../generated/api-schema";

type QuoteData = components["schemas"]["QuoteResponseDto"];
type QuoteMessageData = components["schemas"]["QuoteMessageResponseDto"];
type ApproveToOrderData = components["schemas"]["ApproveToOrderResponseDto"];

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe("Quotes Module Integration", () => {
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
    await db.delete(quoteMessages);
    await db.delete(quoteItems);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(quotes);
    await db.delete(products);
  }, 15000);

  describe("Customer RFQ Submission & Admin Quotation Workflow", () => {
    it("should allow customer to submit RFQ and admin to create B2B quotation with calculated metrics", async () => {
      const { authHeader: adminAuth } = await createAuthenticatedUser(
        db,
        jwtService,
        {
          email: "admin.quote@hyundai-nhatnang.vn",
          role: "ADMIN",
        },
      );

      // 1. Seed catalog product
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Hyundai 50kVA",
          slug: "may-phat-dien-hyundai-50kva",
          price: "180000000.00",
          totalStockCache: 5,
        })
        .returning();

      const productId = product?.id ?? "";

      // 2. Submit customer RFQ
      const rfqRes = await request(getHttpServer())
        .post("/quotes")
        .send({
          customerName: "Trần Văn Doanh",
          customerPhone: "0987654321",
          customerEmail: "doanh.tv@gmail.com",
          companyName: "Tập đoàn Xây Dựng Số 1",
          shippingAddress: "Chân công trình Nhà ga T3",
          items: [
            {
              productId,
              isCustomItem: false,
              itemName: "Máy phát điện Hyundai 50kVA",
              quantity: 2,
              requestedPrice: "175000000.00",
            },
          ],
        });

      expect(rfqRes.status).toBe(201);
      const rfqData = (
        rfqRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data;
      expect(rfqData.status).toBe("SUBMITTED");
      expect(rfqData.items.length).toBe(1);
      expect(rfqData.quoteNumber).toContain("QT-");

      // 3. Admin creates formal B2B quote with custom ATS item and discount
      const adminQuoteRes = await request(getHttpServer())
        .post("/quotes/admin")
        .set(adminAuth)
        .send({
          customerName: "Tập đoàn Xây Dựng Số 1",
          customerPhone: "0987654321",
          vatRate: 10,
          commercialTerms: {
            validityDays: 20,
            paymentSchedule: "Tạm ứng 30%, 70% sau khi bàn giao",
          },
          items: [
            {
              productId,
              isCustomItem: false,
              itemName: "Máy phát điện Hyundai 50kVA",
              quantity: 1,
              unitPrice: 180000000,
              discountPercent: 10, // 10% discount -> 162,000,000
            },
            {
              isCustomItem: true,
              itemName: "Tủ chuyển nguồn tự động ATS 100A",
              quantity: 1,
              unitPrice: 18000000,
              discountPercent: 0, // 18,000,000
            },
          ],
        });

      expect(adminQuoteRes.status).toBe(201);
      const adminQuote = (
        adminQuoteRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data;
      expect(adminQuote.status).toBe("DRAFT");
      expect(adminQuote.items.length).toBe(2);

      // Financial calculations: Subtotal = 162,000,000 + 18,000,000 = 180,000,000
      // VAT 10% = 18,000,000
      // Total = 198,000,000
      expect(adminQuote.subtotalPrice).toBe("180000000.00");
      expect(adminQuote.vatAmount).toBe("18000000.00");
      expect(adminQuote.totalQuotedPrice).toBe("198000000.00");
    }, 25000);
  });

  describe("Quote Negotiation Timeline & State Machine", () => {
    it("should advance SUBMITTED quote to NEGOTIATING upon message, allow item price adjustments, and export Excel", async () => {
      const { authHeader: adminAuth, user: adminUser } =
        await createAuthenticatedUser(db, jwtService, {
          email: "admin.negotiate@hyundai-nhatnang.vn",
          role: "ADMIN",
        });

      // 1. Submit RFQ (status: SUBMITTED)
      const rfqRes = await request(getHttpServer())
        .post("/quotes")
        .send({
          customerName: "Lê Thị B",
          customerPhone: "0912345678",
          items: [
            {
              isCustomItem: true,
              itemName: "Bộ chuyển đổi Inverter 3kW",
              quantity: 1,
              requestedPrice: "15000000.00",
            },
          ],
        });

      expect(rfqRes.status).toBe(201);
      const quoteId = (
        rfqRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data.id;
      const itemId =
        (rfqRes.body as unknown as GenericSuccessResponse<QuoteData>).data
          .items[0]?.id ?? "";

      // 2. Admin sends negotiation message -> Quote MUST transition to NEGOTIATING
      const msgRes = await request(getHttpServer())
        .post(`/quotes/${quoteId}/messages`)
        .set(adminAuth)
        .send({
          message: "Chào chị, chúng tôi có thể hỗ trợ mức giá 14.500.000 VNĐ.",
        });

      expect(msgRes.status).toBe(201);
      const msgData = (
        msgRes.body as unknown as GenericSuccessResponse<QuoteMessageData>
      ).data;
      expect(msgData.sender?.id).toBe(adminUser.id);

      // Verify quote status is now NEGOTIATING
      const quoteDetailRes = await request(getHttpServer())
        .get(`/quotes/${quoteId}`)
        .set(adminAuth);

      const detailedQuote = (
        quoteDetailRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data;
      expect(detailedQuote.status).toBe("NEGOTIATING");
      expect(detailedQuote.messages?.length).toBe(1);

      // 3. Admin updates agreed price for line item to 14,500,000
      const updatePriceRes = await request(getHttpServer())
        .put(`/quotes/${quoteId}/items/${itemId}/price`)
        .set(adminAuth)
        .send({
          agreedPrice: "14500000.00",
        });

      expect(updatePriceRes.status).toBe(200);
      const updatedQuote = (
        updatePriceRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data;
      expect(updatedQuote.subtotalPrice).toBe("14500000.00");
      expect(updatedQuote.vatAmount).toBe("1450000.00");
      expect(updatedQuote.totalQuotedPrice).toBe("15950000.00");

      // 4. Test Excel Export stream
      const excelRes = await request(getHttpServer())
        .get(`/quotes/${quoteId}/export-excel`)
        .set(adminAuth);

      expect(excelRes.status).toBe(200);
      expect(excelRes.headers["content-type"]).toContain("spreadsheetml.sheet");
      expect(excelRes.body).toBeDefined();
    }, 25000);
  });

  describe("Approve Quote and Convert to Order", () => {
    it("should atomically convert an approved quote into an order and lock quote modifications", async () => {
      const { authHeader: adminAuth } = await createAuthenticatedUser(
        db,
        jwtService,
        {
          email: "admin.order@hyundai-nhatnang.vn",
          role: "ADMIN",
        },
      );

      const { user: customerUser } = await createAuthenticatedUser(
        db,
        jwtService,
        {
          email: "registered.dealer@gmail.com",
          role: "SALES",
        },
      );

      // 1. Seed catalog product
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Diesel DHY22KSE",
          slug: "may-phat-dien-diesel-dhy22kse",
          price: "125000000.00",
          totalStockCache: 3,
        })
        .returning();

      const productId = product?.id ?? "";

      // 2. Admin creates quote for registered customer
      const quoteRes = await request(getHttpServer())
        .post("/quotes/admin")
        .set(adminAuth)
        .send({
          userId: customerUser.id,
          customerName: "Đại lý Hyundai Miền Trung",
          customerPhone: "0911223344",
          shippingAddress: "Kho Đà Nẵng",
          vatRate: 10,
          items: [
            {
              productId,
              isCustomItem: false,
              itemName: "Máy phát điện Diesel DHY22KSE",
              quantity: 2,
              unitPrice: 120000000,
              discountPercent: 0,
            },
          ],
        });

      expect(quoteRes.status).toBe(201);
      const quoteId = (
        quoteRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data.id;
      const itemId =
        (quoteRes.body as unknown as GenericSuccessResponse<QuoteData>).data
          .items[0]?.id ?? "";

      // 3. Admin approves and converts quote to order
      const convertRes = await request(getHttpServer())
        .post(`/quotes/${quoteId}/approve-to-order`)
        .set(adminAuth);

      expect(convertRes.status).toBe(200);
      const convertData = (
        convertRes.body as unknown as GenericSuccessResponse<ApproveToOrderData>
      ).data;

      expect(convertData.status).toBe("APPROVED");
      expect(convertData.orderId).toBeDefined();

      // 4. Verify quote is now APPROVED and linked to orderId
      const finalQuoteRes = await request(getHttpServer())
        .get(`/quotes/${quoteId}`)
        .set(adminAuth);

      const finalQuote = (
        finalQuoteRes.body as unknown as GenericSuccessResponse<QuoteData>
      ).data;
      expect(finalQuote.status).toBe("APPROVED");
      expect(finalQuote.orderId).toBe(convertData.orderId);

      // 5. Verify that attempting to adjust price on approved quote is rejected
      const adjustRejectedRes = await request(getHttpServer())
        .put(`/quotes/${quoteId}/items/${itemId}/price`)
        .set(adminAuth)
        .send({
          agreedPrice: "100000000.00",
        });

      expect(adjustRejectedRes.status).toBe(400);

      // 6. Verify that trying to convert an already-approved quote is rejected
      const doubleConvertRes = await request(getHttpServer())
        .post(`/quotes/${quoteId}/approve-to-order`)
        .set(adminAuth);

      expect(doubleConvertRes.status).toBe(400);
    }, 25000);
  });
});
