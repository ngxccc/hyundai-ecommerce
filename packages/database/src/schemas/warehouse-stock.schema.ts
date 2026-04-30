import { integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { warehouses } from "./warehouse.schema";
import { products } from "./product.schema";
import { baseTimestamps } from "./helpers.schema";

export const warehouseStocks = pgTable(
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
  (table) => [primaryKey({ columns: [table.warehouseId, table.productId] })],
);

export type WarehouseStock = typeof warehouseStocks.$inferSelect;
export type NewWarehouseStock = typeof warehouseStocks.$inferInsert;
