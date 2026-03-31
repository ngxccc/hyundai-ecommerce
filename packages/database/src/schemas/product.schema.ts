import { pgTable, text, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const products = pgTable("products", {
  // Dùng CUID thay vì UUID hoặc Serial ID chống đoán ID và thân thiện URL
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

  // dùng JSONB để lưu đủ thứ thông số (Công suất, số pha) của máy phát điện
  specs: jsonb("specs").default({}),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
