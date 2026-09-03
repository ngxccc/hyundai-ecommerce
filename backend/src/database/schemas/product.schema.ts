import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  snakeCase,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  CanopyType,
  FuelType,
  JSONContent,
  PowerPhase,
  ProductSpecSheet,
  ProductType,
  StartMethod,
  UpsBatteryType,
  UpsTopology,
} from "@/types/product-spec.type";
import { fullEntity } from "./helpers.schema";
import { brands } from "./brand.schema";
import { categories } from "./category.schema";

export const products = snakeCase.table(
  "product",
  {
    ...fullEntity,
    nameVi: text().notNull(),
    nameEn: text(),
    slug: text().notNull(),
    price: numeric({ precision: 15, scale: 2 }).notNull(),
    descriptionVi: jsonb().$type<JSONContent>(),
    descriptionEn: jsonb().$type<JSONContent>(),
    shortDescriptionVi: text(),
    shortDescriptionEn: text(),
    images: text().array().default([]).notNull(),
    brandId: uuid().references(() => brands.id, { onDelete: "set null" }),
    categoryId: uuid().references(() => categories.id, {
      onDelete: "set null",
    }),
    productType: text()
      .$type<ProductType | undefined>()
      .$defaultFn(() => "generator"),
    powerKva: numeric({ precision: 10, scale: 2 }).$type<string | undefined>(),
    powerKw: numeric({ precision: 10, scale: 2 }).$type<string | undefined>(),
    standbyPowerKva: numeric({ precision: 10, scale: 2 }).$type<
      string | undefined
    >(),
    standbyPowerKw: numeric({ precision: 10, scale: 2 }).$type<
      string | undefined
    >(),
    phase: text().$type<PowerPhase | undefined>(),
    voltage: text().$type<string | undefined>(),
    frequency: integer()
      .$type<number | undefined>()
      .$defaultFn(() => 50),
    fuelType: text().$type<FuelType | undefined>(),
    canopyType: text().$type<CanopyType | undefined>(),
    startMethod: text().$type<StartMethod | undefined>(),
    engineBrand: text().$type<string | undefined>(),
    alternatorBrand: text().$type<string | undefined>(),
    upsTopology: text().$type<UpsTopology | undefined>(),
    upsBatteryType: text().$type<UpsBatteryType | undefined>(),
    specSheet: jsonb()
      .$type<ProductSpecSheet | undefined>()
      .$defaultFn(() => []),
    specs: jsonb().$type<Record<string, unknown>>().default({}),
    totalStockCache: integer().notNull().default(0),
    totalSalesCache: integer().notNull().default(0),
    isActive: boolean().default(true).notNull(),
  },
  (table) => [
    uniqueIndex("product_slug_uidx").on(table.slug),
    index("product_price_idx").on(table.price),
    index("product_brand_id_idx").on(table.brandId),
    index("product_category_id_idx").on(table.categoryId),
    index("product_created_at_idx").on(table.createdAt),
    index("product_power_kva_idx").on(table.powerKva),
    index("product_power_kw_idx").on(table.powerKw),
    index("product_voltage_idx").on(table.voltage),
    index("product_phase_idx").on(table.phase),
    index("product_fuel_type_idx").on(table.fuelType),
    index("product_canopy_type_idx").on(table.canopyType),
    index("product_ups_topology_idx").on(table.upsTopology),
    index("product_product_type_idx").on(table.productType),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
