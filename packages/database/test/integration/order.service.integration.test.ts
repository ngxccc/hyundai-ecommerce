import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { env } from "../../src/env";
import * as schema from "../../src/schemas";
import { DbOrderService } from "../../src/services/order/order.service";
import { orders, products, orderItems, users } from "../../src/schemas";
import { eq } from "drizzle-orm";
import type { IDatabase } from "../../src/client";

describe("OrderService Concurrency (Race Condition) Integration Test", () => {
  let orderService: DbOrderService;
  let testProductId: string;
  let testUserId: string;
  const orderIds: string[] = [];

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const testProductSlug = `test-product-race-${uniqueSuffix}`;
  const testUserEmail = `test-user-${uniqueSuffix}@example.com`;
  const testUserPhone = `0${Math.floor(100000000 + Math.random() * 900000000)}`;

  let integrationDb: IDatabase;
  let pool: NeonPool | undefined;

  beforeAll(async () => {
    // 1. Initialize a fresh, unmocked connection matching client.ts environment
    pool = new NeonPool({ connectionString: env.DATABASE_URL });
    integrationDb = drizzleNeon({
      client: pool,
      relations: schema.schemaRelations,
      jit: true,
    });

    orderService = new DbOrderService(integrationDb);

    // 2. Insert a test user with unique email and phone
    const [user] = await integrationDb
      .insert(users)
      .values({
        name: "Test User Concurrency",
        email: testUserEmail,
        phone: testUserPhone,
        role: "CUSTOMER",
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
        nameVi: "Test Product Concurrency",
        slug: testProductSlug,
        price: "100000",
        totalStockCache: 100,
        isQuoteOnly: false,
      })
      .returning();
    if (!product) {
      throw new Error("Failed to insert test product: product is undefined");
    }
    testProductId = product.id;

    // 4. Create 5 PENDING orders (each buying 2 products)
    for (let i = 0; i < 5; i++) {
      const [order] = await integrationDb
        .insert(orders)
        .values({
          userId: testUserId,
          totalAmount: "200000",
          shippingAddress: "Test Address",
          shippingFee: "0",
          status: "PENDING",
        })
        .returning();
      if (!order) {
        throw new Error(
          `Failed to insert test order index ${i}: order is undefined`,
        );
      }
      orderIds.push(order.id);

      await integrationDb.insert(orderItems).values({
        orderId: order.id,
        productId: testProductId,
        productName: "Test Product Concurrency",
        productSku: `SKU-${uniqueSuffix}`,
        quantity: 2,
        unitPrice: "100000",
      });
    }
  }, 30000);

  afterAll(async () => {
    try {
      if (integrationDb) {
        // Cleanup test data in reverse order of foreign keys
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
      }
    } finally {
      if (pool) {
        await pool.end();
      }
    }
  }, 30000);

  test("Should increment totalSalesCache concurrently without lost updates", async () => {
    // Act: Transition all 5 orders from PENDING -> PROCESSING concurrently
    const transitions = orderIds.map((orderId) =>
      orderService.updateOrderStatus(orderId, "PROCESSING"),
    );

    await Promise.all(transitions);

    // Assert: Check the updated product's totalSalesCache
    const [updatedProduct] = await integrationDb
      .select({ totalSalesCache: products.totalSalesCache })
      .from(products)
      .where(eq(products.id, testProductId));

    // 5 orders * 2 quantity = 10 sales
    expect(updatedProduct?.totalSalesCache).toBe(10);
  }, 30000);
});
