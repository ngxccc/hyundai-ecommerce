import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { warehouses } from "./warehouse.schema";

export const warehouseStocks = pgTable(
  "warehouse_stock",
  {
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
    stock: integer("stock").notNull().default(0),
    minStockWarning: integer("min_stock_warning").notNull().default(2),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.warehouseId, table.productId] })],
);

export type WarehouseStock = typeof warehouseStocks.$inferSelect;
export type NewWarehouseStock = typeof warehouseStocks.$inferInsert;
