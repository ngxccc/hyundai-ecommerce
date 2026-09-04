import type { DrizzleDB } from "@/database/database.module";
import type {
  Brand,
  Category,
  DealerTier,
  Order,
  Product,
  Quote,
  User,
  Warehouse,
} from "@/database/schemas";
import type { SeedScope } from "../constants/seed.constant";

export interface SeedOptions {
  db: DrizzleDB;
  scope?: SeedScope | SeedScope[] | (string & {});
  reset?: boolean;
  verbose?: boolean;
}

export interface SeedSummary {
  dealerTiers: number;
  users: number;
  brands: number;
  categories: number;
  products: number;
  warehouses: number;
  warehouseStocks: number;
  quotes: number;
  quoteItems: number;
  orders: number;
  orderItems: number;
  durationMs: number;
  errors: string[];
}

export type SeededDealerTierRef = Pick<
  DealerTier,
  "id" | "nameVi" | "nameEn" | "discountPercentage"
>;

export type SeededUserRef = Pick<
  User,
  "id" | "email" | "role" | "fullName" | "dealerTierId" | "creditLimit"
>;

export interface Tier1SeedResult {
  dealerTiers: SeededDealerTierRef[];
  users: SeededUserRef[];
}

export type SeededBrandRef = Pick<Brand, "id" | "name" | "slug">;

export type SeededCategoryRef = Pick<Category, "id" | "nameVi" | "slug">;

export type SeededProductRef = Pick<
  Product,
  "id" | "nameVi" | "slug" | "price" | "totalStockCache"
>;

export type SeededWarehouseRef = Pick<Warehouse, "id" | "nameVi" | "city">;

export interface Tier2SeedResult {
  brands: SeededBrandRef[];
  categories: SeededCategoryRef[];
  products: SeededProductRef[];
  warehouses: SeededWarehouseRef[];
  warehouseStocksCount: number;
}

export type SeededQuoteRef = Pick<Quote, "id" | "quoteNumber" | "status">;

export type SeededOrderRef = Pick<
  Order,
  "id" | "orderNumber" | "status" | "totalAmount"
>;

export interface Tier3SeedResult {
  quotes: SeededQuoteRef[];
  quoteItemsCount: number;
  orders: SeededOrderRef[];
  orderItemsCount: number;
}
