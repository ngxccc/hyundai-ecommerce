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
  leads,
  leadItems,
  products,
  brands,
  categories,
} from "@/database/schemas";

interface LeadItemResponseBody {
  id: string;
  productId: string;
  quantity: number;
  productNameVi: string;
  productNameEn: string | null;
  productModel: string | null;
  productSku: string | null;
}

interface LeadResponseBody {
  id: string;
  leadCode: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  companyName: string | null;
  city: string;
  ward: string;
  streetAddress: string | null;
  notes: string | null;
  status: string;
  assignedSalesId: string | null;
  lostReason: string | null;
  createdAt: string;
  items: LeadItemResponseBody[];
}

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface Rfc9457ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

describe("Leads Module Integration (Storefront RFQ)", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let db: DrizzleDB;
  let jwtService: JwtService;
  let testProductId: string;

  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
    db = setup.db;
    jwtService = app.get(JwtService);

    // Setup brand, category, and test product
    const [brand] = await db
      .insert(brands)
      .values({ name: "Hyundai Power", slug: "hyundai-power" })
      .returning();

    const [category] = await db
      .insert(categories)
      .values({
        nameVi: "Máy phát điện",
        nameEn: "Generators",
        slug: "may-phat-dien",
      })
      .returning();

    const [product] = await db
      .insert(products)
      .values({
        nameVi: "Máy phát điện Diesel Hyundai DHY65KSE",
        nameEn: "Hyundai DHY65KSE Diesel Generator",
        slug: "may-phat-dien-diesel-hyundai-dhy65kse",
        price: "245000000.00",
        brandId: brand ? brand.id : null,
        categoryId: category ? category.id : null,
      })
      .returning();

    testProductId = product ? product.id : "";
  }, 30000);

  afterAll(async () => {
    await teardownTestApp(setup);
  }, 30000);

  beforeEach(async () => {
    await db.delete(leadItems);
    await db.delete(leads);
  }, 15000);

  describe("POST /leads (Public Storefront RFQ)", () => {
    describe("when visitor submits valid quote request without authentication", () => {
      it("should return 201 Created with leadCode and snapshot items", async () => {
        const payload = {
          fullName: "Hoàng Minh Trí",
          phoneNumber: "0912345678",
          email: "tri.hoang@company.vn",
          companyName: "Công ty Cổ phần Xây dựng Trí Lực",
          city: "Bình Dương",
          ward: "Phường Dĩ An",
          streetAddress: "KCN Sóng Thần 1, Lô B2",
          notes: "Cần tư vấn công suất 60kVA kèm tủ ATS cho nhà máy may",
          items: [{ productId: testProductId, quantity: 1 }],
        };

        const res = await request(getHttpServer()).post("/leads").send(payload);

        expect(res.status).toBe(201);
        const body =
          res.body as unknown as GenericSuccessResponse<LeadResponseBody>;
        expect(body.success).toBe(true);
        expect(body.data.leadCode).toMatch(/^RFQ-\d{8}-\d{4}$/);
        expect(body.data.fullName).toBe(payload.fullName);
        expect(body.data.phoneNumber).toBe(payload.phoneNumber);
        expect(body.data.city).toBe("Bình Dương");
        expect(body.data.ward).toBe("Phường Dĩ An");
        expect(body.data.status).toBe("NEW");

        // Assert snapshot items
        expect(body.data.items.length).toBe(1);
        const [firstItem] = body.data.items;
        expect(firstItem?.productId).toBe(testProductId);
        expect(firstItem?.productNameVi).toBe(
          "Máy phát điện Diesel Hyundai DHY65KSE",
        );
        expect(firstItem?.productNameEn).toBe(
          "Hyundai DHY65KSE Diesel Generator",
        );
      }, 15000);
    });

    describe("when requested product does not exist", () => {
      it("should return 404 Not Found in RFC 9457 format", async () => {
        const payload = {
          fullName: "Lê Văn Hùng",
          phoneNumber: "0987654321",
          city: "Hà Nội",
          ward: "Phường Dịch Vọng",
          items: [
            { productId: "019fa8bc-7000-7000-8000-000000000099", quantity: 1 },
          ],
        };

        const res = await request(getHttpServer()).post("/leads").send(payload);

        expect(res.status).toBe(404);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(404);
        expect(body.title).toBe("Not Found");
      }, 15000);
    });

    describe("when phone number format is invalid", () => {
      it("should return 400 Bad Request", async () => {
        const payload = {
          fullName: "Lê Văn Hùng",
          phoneNumber: "123456", // Invalid Vietnamese phone number
          city: "Hà Nội",
          ward: "Phường Dịch Vọng",
          items: [{ productId: testProductId, quantity: 1 }],
        };

        const res = await request(getHttpServer()).post("/leads").send(payload);

        expect(res.status).toBe(400);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(400);
        expect(body.title).toBe("Bad Request");
      }, 15000);
    });
  });

  describe("GET /leads (CMS Internal)", () => {
    describe("when unauthenticated", () => {
      it("should return 401 Unauthorized in RFC 9457 format", async () => {
        const res = await request(getHttpServer()).get("/leads");

        expect(res.status).toBe(401);
        const body = res.body as unknown as Rfc9457ErrorResponse;
        expect(body.status).toBe(401);
        expect(body.title).toBe("Unauthorized");
      }, 15000);
    });

    describe("when authenticated as SALES staff", () => {
      it("should return 200 OK with list of submitted leads", async () => {
        const { authHeader } = await createAuthenticatedUser(db, jwtService, {
          email: "sales.lead@hyundai-nhatnang.vn",
          role: "SALES",
        });

        // Submit one lead
        await request(getHttpServer())
          .post("/leads")
          .send({
            fullName: "Công ty ABC",
            phoneNumber: "0909112233",
            city: "Đà Nẵng",
            ward: "Phường Hải Châu 1",
            items: [{ productId: testProductId, quantity: 2 }],
          });

        const res = await request(getHttpServer())
          .get("/leads")
          .set(authHeader);

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          LeadResponseBody[]
        >;
        expect(body.success).toBe(true);
        expect(body.data.length).toBeGreaterThanOrEqual(1);
        const [firstLead] = body.data;
        expect(firstLead?.fullName).toBe("Công ty ABC");
      }, 15000);
    });
  });

  describe("PATCH /leads/:id/status (CMS Sales Pipeline)", () => {
    describe("when sales updates status to CONTACTING", () => {
      it("should update status and return refreshed lead", async () => {
        const { authHeader } = await createAuthenticatedUser(db, jwtService, {
          email: "sales.updater@hyundai-nhatnang.vn",
          role: "SALES",
        });

        const createdRes = await request(getHttpServer())
          .post("/leads")
          .send({
            fullName: "Khách hàng Test",
            phoneNumber: "0911223344",
            city: "TP.HCM",
            ward: "Phường Bến Nghé",
            items: [{ productId: testProductId, quantity: 1 }],
          });

        const leadId = (
          createdRes.body as unknown as GenericSuccessResponse<LeadResponseBody>
        ).data.id;

        const res = await request(getHttpServer())
          .patch(`/leads/${leadId}/status`)
          .set(authHeader)
          .send({ status: "CONTACTING" });

        expect(res.status).toBe(200);
        const body =
          res.body as unknown as GenericSuccessResponse<LeadResponseBody>;
        expect(body.data.status).toBe("CONTACTING");
      }, 15000);
    });
  });
});
