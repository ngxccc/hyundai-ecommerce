import type { DrizzleDB } from "@/database/database.module";
import type {
  Brand,
  Category,
  DealerTier,
  Order,
  Payment,
  Product,
  Quote,
  User,
  Warehouse,
  dealerTiers,
  warehouses,
} from "@/database/schemas";
import type {
  ProductSpecSheet,
  ProductType,
  PowerPhase,
  FuelType,
  CanopyType,
  StartMethod,
  UpsTopology,
  UpsBatteryType,
} from "@/types/product-spec.type";
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

export type SeededCategoryRef = Pick<Category, "id" | "slug">;

export type SeededProductRef = Pick<
  Product,
  "id" | "slug" | "price" | "totalStockCache"
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

export type DealerTierFixtureData = typeof dealerTiers.$inferInsert;

export interface UserFixtureData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: User["role"];
  status: User["status"];
  emailVerified: boolean;
  businessType: User["businessType"];
  companyName: string;
  province: string;
  creditLimit: string;
  currentDebt: string;
  dealerTierId?: string;
  parentId?: string;
  taxId?: string;
}

export interface BrandTranslationFixture {
  locale: string;
  description: string;
}

export interface BrandFixtureData {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  translations: BrandTranslationFixture[];
}

export interface CategoryTranslationFixture {
  locale: string;
  name: string;
  description: string;
}

export interface CategoryFixtureData {
  id: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  translations: CategoryTranslationFixture[];
}

export type WarehouseFixtureData = typeof warehouses.$inferInsert;

export interface ProductTranslationFixture {
  locale: string;
  name: string;
  shortDescription: string | null;
  description: Record<string, unknown>;
}

export interface ProductFixtureData {
  id: string;
  slug: string;
  price: string;
  images: string[];
  brandId: string;
  categoryId: string;
  productType: ProductType;
  powerKva: string;
  powerKw: string;
  standbyPowerKva?: string;
  standbyPowerKw?: string;
  phase: PowerPhase;
  voltage: string;
  frequency: number;
  fuelType?: FuelType;
  canopyType?: CanopyType;
  startMethod?: StartMethod;
  engineBrand?: string;
  alternatorBrand?: string;
  upsTopology?: UpsTopology;
  upsBatteryType?: UpsBatteryType;
  specSheet: ProductSpecSheet;
  totalStockCache: number;
  isActive: boolean;
  translations: ProductTranslationFixture[];
}
export interface WarehouseStockFixtureData {
  warehouseId: string;
  productId: string;
  stock: number;
  minStockWarning: number;
}
interface BaseQuoteFixtureItem {
  itemName: string;
  itemModel?: string | null;
  itemSpecs?: string | null;
  quantity: number;
  unitPrice: string;
  discountPercent: string;
  finalUnitPrice: string;
  totalPrice: string;
}

/**
 * Strict discriminated union for quotation seed items:
 * - Catalog items (isCustomItem: false) strictly require a valid product UUID.
 * - Custom items (isCustomItem: true) strictly forbid a catalog product UUID.
 */
export type QuoteFixtureItem =
  | (BaseQuoteFixtureItem & {
      isCustomItem: false;
      productId: string;
    })
  | (BaseQuoteFixtureItem & {
      isCustomItem: true;
      productId?: null;
    });

export interface QuoteFixtureMessage {
  senderId: string;
  message: string;
}

export interface QuoteFixtureData {
  id: string;
  quoteNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  taxId: string;
  shippingAddress: string;
  status: Quote["status"];
  subtotalPrice: string;
  vatRate: number;
  vatAmount: string;
  totalQuotedPrice: string;
  note: string;
  commercialTerms?: Quote["commercialTerms"];
  expirationDate?: string | Date | null;
  items: QuoteFixtureItem[];
  messages: QuoteFixtureMessage[];
}

export interface OrderFixtureItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
}

export interface OrderFixtureShippingBid {
  vendorName: string;
  quotedPrice: string;
  internalNote: string;
  isSelected: boolean;
}

export interface OrderFixturePayment {
  amount: string;
  method: Order["paymentMethod"];
  status: Payment["status"];
  rawPayload: string;
}

export interface OrderFixtureData {
  id: string;
  orderNumber: string;
  userId: string;
  status: Order["status"];
  shippingFee: string;
  shippingAddress: string;
  totalAmount: string;
  paymentMethod: Order["paymentMethod"];
  paymentStatus: Order["paymentStatus"];
  approvalStatus: Order["approvalStatus"];
  approvedBy?: string;
  items: OrderFixtureItem[];
  shippingBids: OrderFixtureShippingBid[];
  payments: OrderFixturePayment[];
}
