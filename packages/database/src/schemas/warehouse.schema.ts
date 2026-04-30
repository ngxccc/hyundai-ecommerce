import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

export const warehouses = pgTable(
  "warehouse",
  {
    ...baseEntity,
    name: text().notNull(),
    streetAddress: text().notNull(),
    district: text().notNull(),
    city: text().notNull(),
    isActive: boolean().notNull().default(true),
  },
  (table) => [index("warehouse_name_idx").on(table.name)],
);

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
