import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import {
  createWorkerTestDatabase,
  teardownWorkerTestDatabase,
  type TestDatabaseContext,
} from "../helpers/database.helper";
import { truncateAllTables } from "@/database/database.connection";
import {
  dealerTiers,
  users,
  brands,
  categories,
  products,
  warehouses,
  warehouseStocks,
  quotes,
  orders,
} from "@/database/schemas";
import { seedDatabase } from "@/database/seeds/seed.orchestrator";
import { comparePassword } from "@/common/utils/crypto.util";
import { DEFAULT_SEED_PASSWORD } from "@/database/seeds/constants/seed.constant";
import { asc } from "drizzle-orm";

describe("Database Seeding Engine Integration", () => {
  let context: TestDatabaseContext;

  beforeAll(async () => {
    context = await createWorkerTestDatabase();
  }, 30000);

  afterAll(async () => {
    await teardownWorkerTestDatabase(context);
  }, 30000);

  beforeEach(async () => {
    await truncateAllTables(context.db, context.schemaName);
  }, 15000);

  describe("Tier 1: Master Reference Data Seeding", () => {
    describe("when seeding reference scope", () => {
      it("should successfully seed dealer tiers and verify system users with hashed passwords", async () => {
        const summary = await seedDatabase({
          db: context.db,
          scope: "reference",
        });

        expect(summary.errors).toEqual([]);
        expect(summary.dealerTiers).toBe(3);
        expect(summary.users).toBeGreaterThanOrEqual(4);

        // Assert dealer tiers exist with bilingual names and minimum spend ordering
        const allTiers = await context.db
          .select({
            id: dealerTiers.id,
            nameVi: dealerTiers.nameVi,
            nameEn: dealerTiers.nameEn,
            discountPercentage: dealerTiers.discountPercentage,
            minimumSpend: dealerTiers.minimumSpend,
          })
          .from(dealerTiers)
          .orderBy(asc(dealerTiers.minimumSpend));

        expect(allTiers.length).toBe(3);
        expect(allTiers[0]!.nameVi).toBe("Đại lý Bạc");
        expect(allTiers[0]!.nameEn).toBe("Silver Dealer");
        expect(allTiers[1]!.nameVi).toBe("Đại lý Vàng");
        expect(allTiers[1]!.nameEn).toBe("Gold Dealer");
        expect(allTiers[2]!.nameVi).toBe("Đại lý Bạch Kim");
        expect(allTiers[2]!.nameEn).toBe("Platinum Dealer");

        // Assert users seeded correctly and password hashing is valid Scrypt
        const allUsers = await context.db
          .select({
            id: users.id,
            email: users.email,
            role: users.role,
            status: users.status,
            passwordHash: users.passwordHash,
          })
          .from(users);

        expect(allUsers.length).toBeGreaterThanOrEqual(4);
        const adminUser = allUsers.find(
          (u) => u.email === "admin@hyundai-nhatnang.vn",
        );
        expect(adminUser).toBeDefined();
        expect(adminUser!.role).toBe("ADMIN");
        expect(adminUser!.status).toBe("ACTIVE");

        // Verify password hash can be authenticated against default seed password
        const isPasswordValid = await comparePassword(
          DEFAULT_SEED_PASSWORD,
          adminUser!.passwordHash,
        );
        expect(isPasswordValid).toBe(true);
      }, 30000);
    });

    describe("when running reference seeding repeatedly (idempotency)", () => {
      it("should not throw unique constraint violations and maintain identical row counts", async () => {
        // Run seed 1st time
        await seedDatabase({
          db: context.db,
          scope: "reference",
        });

        // Run seed 2nd time without reset
        const summary = await seedDatabase({
          db: context.db,
          scope: "reference",
        });

        expect(summary.errors).toEqual([]);

        const tierCount = await context.db.select().from(dealerTiers);
        expect(tierCount.length).toBe(3);
      }, 30000);
    });
  });

  describe("Tier 2: E-commerce Catalog Seeding", () => {
    describe("when seeding catalog scope with pre-existing reference tier", () => {
      it("should seed brands, categories, products, and warehouses with stocks", async () => {
        // Prerequisites: Seed Tier 1 first
        await seedDatabase({
          db: context.db,
          scope: "reference",
        });

        const summary = await seedDatabase({
          db: context.db,
          scope: "catalog",
        });

        expect(summary.errors).toEqual([]);
        expect(summary.brands).toBeGreaterThanOrEqual(1);
        expect(summary.categories).toBeGreaterThanOrEqual(4);
        expect(summary.products).toBeGreaterThanOrEqual(4);
        expect(summary.warehouses).toBeGreaterThanOrEqual(2);
        expect(summary.warehouseStocks).toBeGreaterThanOrEqual(4);

        // Assert brands
        const allBrands = await context.db.select().from(brands);
        expect(allBrands.length).toBeGreaterThanOrEqual(1);
        expect(allBrands[0]!.name).toBe("Hyundai");

        // Assert categories hierarchy
        const allCategories = await context.db.select().from(categories);
        const parentCategories = allCategories.filter(
          (c) => c.parentId === null,
        );
        const childCategories = allCategories.filter(
          (c) => c.parentId !== null,
        );
        expect(parentCategories.length).toBeGreaterThanOrEqual(2);
        expect(childCategories.length).toBeGreaterThanOrEqual(2);

        // Assert warehouses
        const allWarehouses = await context.db.select().from(warehouses);
        expect(allWarehouses.length).toBeGreaterThanOrEqual(2);

        // Assert products have prices and stock caches
        const allProducts = await context.db.select().from(products);
        expect(allProducts.length).toBeGreaterThanOrEqual(4);
        for (const product of allProducts) {
          expect(Number(product.price)).toBeGreaterThan(0);
          expect(product.nameVi).toBeTruthy();
        }

        // Assert warehouse stocks link valid product and warehouse IDs
        const allStocks = await context.db.select().from(warehouseStocks);
        expect(allStocks.length).toBeGreaterThanOrEqual(4);
      }, 30000);
    });
  });

  describe("Tier 3: Operational Seeding", () => {
    describe("when seeding operational scope after catalog", () => {
      it("should successfully seed demo B2B quotes and orders linked to dealers", async () => {
        // Prerequisites: Seed Tier 1 & 2
        await seedDatabase({
          db: context.db,
          scope: ["reference", "catalog"],
        });

        const summary = await seedDatabase({
          db: context.db,
          scope: "operational",
        });

        expect(summary.errors).toEqual([]);
        expect(summary.quotes).toBeGreaterThanOrEqual(1);
        expect(summary.orders).toBeGreaterThanOrEqual(1);

        // Assert quote exists with valid totals
        const allQuotes = await context.db.select().from(quotes);
        expect(allQuotes.length).toBeGreaterThanOrEqual(1);
        expect(Number(allQuotes[0]!.subtotalPrice)).toBeGreaterThan(0);

        // Assert order exists with valid totals
        const allOrders = await context.db.select().from(orders);
        expect(allOrders.length).toBeGreaterThanOrEqual(1);
        expect(Number(allOrders[0]!.totalAmount)).toBeGreaterThan(0);
      }, 30000);
    });
  });

  describe("Full Database Seeding (scope: 'all')", () => {
    describe("when running end-to-end seed across all tiers", () => {
      it("should populate complete database schema with consistent entity relations", async () => {
        const summary = await seedDatabase({
          db: context.db,
          scope: "all",
          reset: true,
        });

        expect(summary.errors).toEqual([]);
        expect(summary.dealerTiers).toBe(3);
        expect(summary.users).toBeGreaterThanOrEqual(4);
        expect(summary.brands).toBeGreaterThanOrEqual(1);
        expect(summary.categories).toBeGreaterThanOrEqual(4);
        expect(summary.products).toBeGreaterThanOrEqual(4);
        expect(summary.warehouses).toBeGreaterThanOrEqual(2);
        expect(summary.warehouseStocks).toBeGreaterThanOrEqual(4);
        expect(summary.quotes).toBeGreaterThanOrEqual(1);
        expect(summary.orders).toBeGreaterThanOrEqual(1);
        expect(summary.durationMs).toBeGreaterThan(0);
      }, 45000);
    });
  });
});
