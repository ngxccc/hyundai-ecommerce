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
import { brands, categories, products } from "@/database/schemas";

interface GenericSuccessResponse<T, M = unknown> {
  success: boolean;
  data: T;
  meta?: M;
  timestamp: string;
}

interface PaginationMetaBody {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductResponseBody {
  id: string;
  nameVi: string;
  nameEn: string | null;
  slug: string;
  price: string;
  powerKva: string | null;
  fuelType: string | null;
  phase: string | null;
  brand?: { id: string; name: string } | null;
  category?: { id: string; nameVi: string } | null;
}

interface CategoryTreeResponseBody {
  id: string;
  nameVi: string;
  slug: string;
  children?: CategoryTreeResponseBody[];
}

interface ProductMetadataResponseBody {
  brands: { id: string; name: string; count: number }[];
  categories: { id: string; nameVi: string; count: number }[];
  powerRange: { min: number; max: number };
  priceRange: { min: number; max: number };
}

describe("Catalog Module Integration", () => {
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
    await db.delete(products);
    await db.delete(categories);
    await db.delete(brands);
  }, 15000);

  describe("Categories API", () => {
    describe("GET /categories/tree", () => {
      it("should return recursive hierarchical category tree", async () => {
        const [parent] = await db
          .insert(categories)
          .values({
            nameVi: "Máy phát điện",
            slug: "may-phat-dien",
          })
          .returning();

        await db.insert(categories).values({
          nameVi: "Máy phát điện Diesel",
          slug: "may-phat-dien-diesel",
          parentId: parent ? parent.id : null,
        });

        const res = await request(getHttpServer()).get("/categories/tree");

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          CategoryTreeResponseBody[]
        >;
        expect(body.success).toBe(true);
        expect(body.data.length).toBe(1);
        const [root] = body.data;
        expect(root?.slug).toBe("may-phat-dien");
        expect(root?.children?.length).toBe(1);
        const [child] = root?.children ?? [];
        expect(child?.slug).toBe("may-phat-dien-diesel");
      }, 15000);
    });

    describe("POST /categories (Admin Only)", () => {
      it("should create category when authenticated as ADMIN", async () => {
        const { authHeader } = await createAuthenticatedUser(db, jwtService, {
          email: "admin.cat@hyundai-nhatnang.vn",
          role: "ADMIN",
        });

        const res = await request(getHttpServer())
          .post("/categories")
          .set(authHeader)
          .send({
            nameVi: "Bộ lưu điện UPS",
            slug: "bo-luu-dien-ups",
            isActive: true,
          });

        expect(res.status).toBe(201);
        const body = res.body as unknown as GenericSuccessResponse<{
          id: string;
          slug: string;
        }>;
        expect(body.data.slug).toBe("bo-luu-dien-ups");
      }, 15000);

      it("should return 401 Unauthorized when unauthenticated", async () => {
        const res = await request(getHttpServer()).post("/categories").send({
          nameVi: "Bộ lưu điện UPS",
          slug: "bo-luu-dien-ups",
        });

        expect(res.status).toBe(401);
      }, 15000);
    });
  });

  describe("Brands API", () => {
    describe("GET /brands", () => {
      it("should return active brands ordered by name", async () => {
        await db.insert(brands).values({
          name: "Hyundai Power",
          slug: "hyundai-power",
        });

        const res = await request(getHttpServer()).get("/brands");

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          { name: string; slug: string }[]
        >;
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.slug).toBe("hyundai-power");
      }, 15000);
    });
  });

  describe("Products API", () => {
    let brandId: string;
    let categoryId: string;

    beforeEach(async () => {
      const [brand] = await db
        .insert(brands)
        .values({ name: "Hyundai", slug: "hyundai" })
        .returning();

      const [category] = await db
        .insert(categories)
        .values({
          nameVi: "Máy phát điện",
          slug: "may-phat-dien",
        })
        .returning();

      brandId = brand ? brand.id : "";
      categoryId = category ? category.id : "";

      // Insert 3 test products for faceted search and pagination tests
      await db.insert(products).values([
        {
          nameVi: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA",
          slug: "dhy65kse-60kva",
          price: "245000000.00",
          brandId,
          categoryId,
          powerKva: "60.00",
          powerKw: "48.00",
          fuelType: "diesel",
          phase: "3phase",
          voltage: "230/400V",
          canopyType: "silent",
          totalStockCache: 5,
          isActive: true,
        },
        {
          nameVi: "Máy phát điện Xăng Hyundai HY3100LE 3kW",
          slug: "hy3100le-3kw",
          price: "12500000.00",
          brandId,
          categoryId,
          powerKva: "3.50",
          powerKw: "3.00",
          fuelType: "gasoline",
          phase: "1phase",
          voltage: "230V",
          canopyType: "open_frame",
          totalStockCache: 10,
          isActive: true,
        },
        {
          nameVi: "Máy phát điện Diesel Hyundai DHY12500SE 10kVA",
          slug: "dhy12500se-10kva",
          price: "68000000.00",
          brandId,
          categoryId,
          powerKva: "11.00",
          powerKw: "10.00",
          fuelType: "diesel",
          phase: "1phase",
          voltage: "230V",
          canopyType: "silent",
          totalStockCache: 2,
          isActive: true,
        },
      ]);
    }, 15000);

    describe("GET /products (Offset Pagination & Faceted Search)", () => {
      it("should support offset pagination query params and return structured envelope", async () => {
        const res = await request(getHttpServer())
          .get("/products")
          .query({ page: 1, limit: 2 });

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          ProductResponseBody[],
          PaginationMetaBody
        >;
        expect(body.success).toBe(true);
        expect(body.data.length).toBe(2);
        expect(body.meta).toBeDefined();
        expect(body.meta?.page).toBe(1);
        expect(body.meta?.limit).toBe(2);
        expect(body.meta?.total).toBe(3);
        expect(body.meta?.totalPages).toBe(2);
        expect(body.meta?.hasNextPage).toBe(true);
        expect(body.meta?.hasPrevPage).toBe(false);
      }, 15000);

      it("should filter by fuelType and power range", async () => {
        const res = await request(getHttpServer()).get("/products").query({
          fuelType: "diesel",
          powerKvaMin: 50,
          powerKvaMax: 100,
        });

        expect(res.status).toBe(200);
        const body = res.body as unknown as GenericSuccessResponse<
          ProductResponseBody[]
        >;
        expect(body.data.length).toBe(1);
        const [prod] = body.data;
        expect(prod?.slug).toBe("dhy65kse-60kva");
        expect(prod?.fuelType).toBe("diesel");
      }, 15000);
    });

    describe("GET /products/metadata", () => {
      it("should return aggregated facet counts and available filter ranges", async () => {
        const res = await request(getHttpServer()).get("/products/metadata");

        expect(res.status).toBe(200);
        const body =
          res.body as unknown as GenericSuccessResponse<ProductMetadataResponseBody>;
        expect(body.success).toBe(true);
        expect(body.data.brands.length).toBeGreaterThanOrEqual(1);
        expect(body.data.categories.length).toBeGreaterThanOrEqual(1);
        expect(body.data.powerRange.min).toBeLessThanOrEqual(3.5);
        expect(body.data.powerRange.max).toBeGreaterThanOrEqual(60);
      }, 15000);
    });

    describe("GET /products/:id", () => {
      it("should return single product by slug", async () => {
        const res = await request(getHttpServer()).get(
          "/products/dhy65kse-60kva",
        );

        expect(res.status).toBe(200);
        const body =
          res.body as unknown as GenericSuccessResponse<ProductResponseBody>;
        expect(body.data.slug).toBe("dhy65kse-60kva");
        expect(body.data.nameVi).toBe(
          "Máy phát điện Diesel Hyundai DHY65KSE 60kVA",
        );
      }, 15000);
    });

    describe("POST & DELETE /products (Admin Lifecycle)", () => {
      it("should allow ADMIN to create and soft delete product", async () => {
        const { authHeader } = await createAuthenticatedUser(db, jwtService, {
          email: "admin.prod@hyundai-nhatnang.vn",
          role: "ADMIN",
        });

        // 1. Create product
        const createRes = await request(getHttpServer())
          .post("/products")
          .set(authHeader)
          .send({
            nameVi: "Máy phát điện mới 50kVA",
            slug: "may-phat-dien-moi-50kva",
            price: 180000000,
            brandId,
            categoryId,
            productType: "generator",
            powerKva: 50,
            images: [],
            isActive: true,
          });

        expect(createRes.status).toBe(201);
        const createdBody =
          createRes.body as unknown as GenericSuccessResponse<ProductResponseBody>;
        const newProductId = createdBody.data.id;

        // 2. Delete product
        const deleteRes = await request(getHttpServer())
          .delete(`/products/${newProductId}`)
          .set(authHeader);

        expect(deleteRes.status).toBe(200);

        // 3. Verify GET returns 404
        const verifyRes = await request(getHttpServer()).get(
          `/products/${newProductId}`,
        );
        expect(verifyRes.status).toBe(404);
      }, 15000);
    });
  });
});
