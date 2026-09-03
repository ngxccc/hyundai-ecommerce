import {
  boolean,
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { baseEntity, baseTimestamps } from "./helpers.schema";
import { products } from "./product.schema";

export const warehouses = snakeCase.table(
  "warehouse",
  {
    ...baseEntity,
    nameVi: text().notNull(),
    nameEn: text(),
    streetAddress: text().notNull(),
    district: text().notNull(),
    city: text().notNull(),
    isActive: boolean().notNull().default(true),
  },
  (table) => [index("warehouse_name_idx").on(table.nameVi)],
);

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;

export const warehouseStocks = snakeCase.table(
  "warehouse_stock",
  {
    warehouseId: uuid()
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    stock: integer().notNull().default(0),
    minStockWarning: integer().notNull().default(2),
    ...baseTimestamps,
  },
  (table) => [
    primaryKey({ columns: [table.warehouseId, table.productId] }),
    index("warehouse_stock_product_idx").on(table.productId),
  ],
);

export type WarehouseStock = typeof warehouseStocks.$inferSelect;
export type NewWarehouseStock = typeof warehouseStocks.$inferInsert;
