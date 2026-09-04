import {
  index,
  integer,
  snakeCase,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { fullEntity, baseEntity } from "./helpers.schema";
import { users } from "./auth.schema";
import { products } from "./product.schema";
import { leadStatusEnum } from "./enums.schema";

export const leads = snakeCase.table(
  "lead",
  {
    ...fullEntity,
    leadCode: varchar({ length: 32 }).notNull().unique(),
    fullName: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }),
    companyName: varchar({ length: 255 }),
    city: varchar({ length: 100 }).notNull(),
    ward: varchar({ length: 100 }).notNull(),
    streetAddress: varchar({ length: 255 }),
    notes: text(),
    status: leadStatusEnum().notNull().default("NEW"),
    assignedSalesId: uuid().references(() => users.id, {
      onDelete: "set null",
    }),
    lostReason: text(),
  },
  (table) => [
    index("lead_status_created_idx").on(table.status, table.createdAt),
    index("lead_phone_idx").on(table.phoneNumber),
    index("lead_sales_idx").on(table.assignedSalesId),
  ],
);

export const leadItems = snakeCase.table(
  "lead_item",
  {
    ...baseEntity,
    leadId: uuid()
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer().notNull().default(1),
    productNameVi: varchar({ length: 255 }).notNull(),
    productNameEn: varchar({ length: 255 }),
    productModel: varchar({ length: 100 }),
    productSku: varchar({ length: 100 }),
  },
  (table) => [
    index("lead_item_lead_idx").on(table.leadId),
    index("lead_item_product_idx").on(table.productId),
  ],
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadItem = typeof leadItems.$inferSelect;
export type NewLeadItem = typeof leadItems.$inferInsert;
