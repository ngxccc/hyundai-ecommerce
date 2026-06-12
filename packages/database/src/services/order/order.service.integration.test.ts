import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { env } from "../../env";
import * as schema from "../../schemas";
import { OrderService } from "./order.service";
import { orders, products, orderItems, users } from "../../schemas";
import { eq } from "drizzle-orm";
import type { IDatabase } from "../../client";

describe("OrderService Concurrency (Race Condition) Integration Test", () => {
  let orderService: OrderService;
  let testProductId: string;
  let testUserId: string;
  const orderIds: string[] = [];

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const testProductSlug = `test-product-race-${uniqueSuffix}`;
  const testUserEmail = `test-user-${uniqueSuffix}@example.com`;
  const testUserPhone = `0${Math.floor(100000000 + Math.random() * 900000000)}`;

  let integrationDb: IDatabase;

  beforeAll(async () => {
    // 1. Initialize a fresh, unmocked connection matching client.ts environment
    const pool = new NeonPool({ connectionString: env.DATABASE_URL });
    integrationDb = drizzleNeon({
      client: pool,
      relations: schema.schemaRelations,
      jit: true,
    });

    orderService = new OrderService(integrationDb);

    // 2. Insert a test user with unique email and phone
    const [user] = await integrationDb
      .insert(users)
      .values({
        name: "Test User Concurrency",
        email: testUserEmail,
        phone: testUserPhone,
        role: "customer",
        businessType: "end_user",
      })
      .returning();
    if (!user) {
      throw new Error("Failed to insert test user: user is undefined");
    }
    testUserId = user.id;

    // 3. Insert a test product with totalSalesCache = 0
    const [product] = await integrationDb
      .insert(products)
      .values({
        nameVi: "Test Product Race Condition",
        slug: testProductSlug,
        price: "100000",
        totalStockCache: 100,
        totalSalesCache: 0,
      })
      .returning();
    if (!product) {
      throw new Error("Failed to insert test product: product is undefined");
    }
    testProductId = product.id;

    // 4. Create 5 pending orders (each buying 2 products)
    for (let i = 0; i < 5; i++) {
      const [order] = await integrationDb
        .insert(orders)
        .values({
          userId: testUserId,
          status: "pending",
          shippingFee: "20000",
          shippingAddress: "Hanoi, Vietnam",
          totalAmount: "220000",
        })
        .returning();
      if (!order) {
        throw new Error(`Failed to insert test order ${i}: order is undefined`);
      }
      orderIds.push(order.id);

      await integrationDb.insert(orderItems).values({
        orderId: order.id,
        productId: testProductId,
        productName: "Test Product Race Condition",
        productSku: `TEST-SKU-${i}-${uniqueSuffix}`,
        quantity: 2,
        unitPrice: "100000",
      });
    }
  });

  afterAll(async () => {
    // Clean up created test data in reverse dependency order
    for (const orderId of orderIds) {
      await integrationDb
        .delete(orderItems)
        .where(eq(orderItems.orderId, orderId));
      await integrationDb.delete(orders).where(eq(orders.id, orderId));
    }
    if (testProductId) {
      await integrationDb
        .delete(products)
        .where(eq(products.id, testProductId));
    }
    if (testUserId) {
      await integrationDb.delete(users).where(eq(users.id, testUserId));
    }
  });

  test("Should increment totalSalesCache concurrently without lost updates", async () => {
    // Trigger 5 concurrent updates (pending -> processing) in parallel
    await Promise.all(
      orderIds.map((orderId) =>
        orderService.updateOrderStatus(orderId, "processing"),
      ),
    );

    // Fetch product to assert final sales count
    const updatedProduct = await integrationDb.query.products.findFirst({
      where: {
        id: testProductId,
      },
    });

    // Total sales count should be exactly 5 orders * 2 quantity = 10
    expect(updatedProduct?.totalSalesCache).toBe(10);
  });
});
