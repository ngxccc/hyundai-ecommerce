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
  cartItems,
  carts,
  products,
  warehouses,
  warehouseStocks,
} from "@/database/schemas";

interface GenericSuccessResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface CartResponseBody {
  id: string;
  userId: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    lineTotal: string;
    product: {
      id: string;
      nameVi: string;
      price: string;
      totalStockCache: number;
    };
  }[];
  summary: {
    totalItems: number;
    totalAmount: string;
  };
}

interface WarehouseResponseBody {
  id: string;
  nameVi: string;
  city: string;
  isActive: boolean;
}

interface WarehouseStockResponseBody {
  warehouseId: string;
  productId: string;
  stock: number;
  product?: {
    id: string;
    totalStockCache: number;
  };
}

describe("Warehouse & Cart Modules Integration", () => {
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
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(warehouseStocks);
    await db.delete(warehouses);
    await db.delete(products);
  }, 15000);

  describe("Multi-Warehouse Inventory & Atomic totalStockCache Sync", () => {
    it("should atomically synchronize product totalStockCache when stock is updated across multiple warehouses", async () => {
      const { authHeader } = await createAuthenticatedUser(db, jwtService, {
        email: "admin.inventory@hyundai-nhatnang.vn",
        role: "ADMIN",
      });

      // 1. Create a product with 0 initial stock
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Hyundai DHY65KSE",
          slug: "may-phat-dien-hyundai-dhy65kse",
          price: "245000000.00",
          totalStockCache: 0,
        })
        .returning();

      const productId = product ? product.id : "";

      // 2. Create Warehouse A (Hanoi) and Warehouse B (Danang)
      const resWhA = await request(getHttpServer())
        .post("/warehouses")
        .set(authHeader)
        .send({
          nameVi: "Kho Tổng Hà Nội",
          streetAddress: "386 Nguyễn Văn Linh",
          district: "Long Biên",
          city: "Hà Nội",
          isActive: true,
        });
      expect(resWhA.status).toBe(201);
      const whAId = (
        resWhA.body as unknown as GenericSuccessResponse<WarehouseResponseBody>
      ).data.id;

      const resWhB = await request(getHttpServer())
        .post("/warehouses")
        .set(authHeader)
        .send({
          nameVi: "Kho Miền Trung Đà Nẵng",
          streetAddress: "KCN Hòa Khánh",
          district: "Liên Chiểu",
          city: "Đà Nẵng",
          isActive: true,
        });
      expect(resWhB.status).toBe(201);
      const whBId = (
        resWhB.body as unknown as GenericSuccessResponse<WarehouseResponseBody>
      ).data.id;

      // 3. Update stock in Warehouse A: 5 units
      const stockResA = await request(getHttpServer())
        .put(`/warehouses/${whAId}/stock`)
        .set(authHeader)
        .send({
          productId,
          stock: 5,
          minStockWarning: 2,
        });

      expect(stockResA.status).toBe(200);
      const bodyA =
        stockResA.body as unknown as GenericSuccessResponse<WarehouseStockResponseBody>;
      expect(bodyA.data.stock).toBe(5);
      expect(bodyA.data.product?.totalStockCache).toBe(5);

      // 4. Update stock in Warehouse B: 10 units -> totalStockCache should become 15
      const stockResB = await request(getHttpServer())
        .put(`/warehouses/${whBId}/stock`)
        .set(authHeader)
        .send({
          productId,
          stock: 10,
          minStockWarning: 2,
        });

      expect(stockResB.status).toBe(200);
      const bodyB =
        stockResB.body as unknown as GenericSuccessResponse<WarehouseStockResponseBody>;
      expect(bodyB.data.stock).toBe(10);
      expect(bodyB.data.product?.totalStockCache).toBe(15);

      // 5. Verify product record in database has totalStockCache = 15
      const [updatedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      expect(updatedProduct?.totalStockCache).toBe(15);
    }, 20000);
  });

  describe("Cart Operations & Stock Boundaries", () => {
    it("should allow user to add, update, and remove items with stock boundaries enforced", async () => {
      const { authHeader } = await createAuthenticatedUser(db, jwtService, {
        email: "customer.cart@gmail.com",
        role: "SALES",
      });

      // Insert product with totalStockCache = 5
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Diesel 5kW",
          slug: "may-phat-dien-diesel-5kw",
          price: "35000000.00",
          totalStockCache: 5,
        })
        .returning();

      const productId = product ? product.id : "";

      // 1. Get initial empty cart
      const getCartRes = await request(getHttpServer())
        .get("/cart")
        .set(authHeader);

      expect(getCartRes.status).toBe(200);
      const initialCart = (
        getCartRes.body as unknown as GenericSuccessResponse<CartResponseBody>
      ).data;
      expect(initialCart.items.length).toBe(0);

      // 2. Add 2 items (valid: 2 <= 5)
      const addRes = await request(getHttpServer())
        .post("/cart/items")
        .set(authHeader)
        .send({
          productId,
          quantity: 2,
        });

      expect(addRes.status).toBe(201);
      const cartAfterAdd = (
        addRes.body as unknown as GenericSuccessResponse<CartResponseBody>
      ).data;
      expect(cartAfterAdd.items.length).toBe(1);
      expect(cartAfterAdd.items[0]?.quantity).toBe(2);
      expect(cartAfterAdd.summary.totalAmount).toBe("70000000.00");
      const cartItemId = cartAfterAdd.items[0]?.id ?? "";

      // 3. Attempt to add 10 more items -> (2 + 10 = 12 > 5) -> should reject with 400
      const overflowRes = await request(getHttpServer())
        .post("/cart/items")
        .set(authHeader)
        .send({
          productId,
          quantity: 10,
        });

      expect(overflowRes.status).toBe(400);

      // 4. Update quantity to 4 (valid: 4 <= 5)
      const updateRes = await request(getHttpServer())
        .put(`/cart/items/${cartItemId}`)
        .set(authHeader)
        .send({
          quantity: 4,
        });

      expect(updateRes.status).toBe(200);
      const cartAfterUpdate = (
        updateRes.body as unknown as GenericSuccessResponse<CartResponseBody>
      ).data;
      expect(cartAfterUpdate.items[0]?.quantity).toBe(4);
      expect(cartAfterUpdate.summary.totalAmount).toBe("140000000.00");

      // 5. Delete item from cart
      const deleteRes = await request(getHttpServer())
        .delete(`/cart/items/${cartItemId}`)
        .set(authHeader);

      expect(deleteRes.status).toBe(200);
      const cartAfterDelete = (
        deleteRes.body as unknown as GenericSuccessResponse<CartResponseBody>
      ).data;
      expect(cartAfterDelete.items.length).toBe(0);
    }, 20000);
  });

  describe("Cart Merge with Inventory Stock Clamping", () => {
    it("should clamp guest item quantities to active product stock when merging", async () => {
      const { authHeader } = await createAuthenticatedUser(db, jwtService, {
        email: "customer.merge@gmail.com",
        role: "SALES",
      });

      // Product has stock = 10
      const [product] = await db
        .insert(products)
        .values({
          nameVi: "Máy phát điện Inverter Hyundai",
          slug: "may-phat-dien-inverter-hyundai",
          price: "18000000.00",
          totalStockCache: 10,
        })
        .returning();

      const productId = product ? product.id : "";

      // 1. User already has 4 units in their cart
      await request(getHttpServer()).post("/cart/items").set(authHeader).send({
        productId,
        quantity: 4,
      });

      // 2. Guest session merges 20 units (4 + 20 = 24 > stock 10)
      // Clamping logic MUST cap the final quantity at 10!
      const mergeRes = await request(getHttpServer())
        .post("/cart/merge")
        .set(authHeader)
        .send({
          items: [
            {
              productId,
              quantity: 20,
            },
          ],
        });

      expect(mergeRes.status).toBe(200);
      const mergedCart = (
        mergeRes.body as unknown as GenericSuccessResponse<CartResponseBody>
      ).data;

      expect(mergedCart.items.length).toBe(1);
      // Clamped to active stock of 10!
      expect(mergedCart.items[0]?.quantity).toBe(10);
      expect(mergedCart.summary.totalItems).toBe(10);
      expect(mergedCart.summary.totalAmount).toBe("180000000.00");
    }, 20000);
  });
});
