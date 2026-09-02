ALTER TABLE "quote_item" ADD COLUMN "is_custom_item" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "item_name" varchar(255);--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "item_model" varchar(100);--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "item_specs" text;--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "unit_price" numeric(15,2);--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "discount_percent" numeric(5,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "final_unit_price" numeric(15,2);--> statement-breakpoint
ALTER TABLE "quote_item" ADD COLUMN "total_price" numeric(15,2);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "quote_number" varchar(32);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "customer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "customer_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "customer_email" varchar(255);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "tax_id" varchar(50);--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "shipping_address" text;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "subtotal_price" numeric(15,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "vat_rate" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "vat_amount" numeric(15,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "commercial_terms" jsonb;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "created_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "quote_item" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_item" ALTER COLUMN "requested_price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quote" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "quote_customer_phone_idx" ON "quote" ("customer_phone");--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_admin_id_user_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quote_item" DROP CONSTRAINT "quote_item_product_id_product_id_fkey", ADD CONSTRAINT "quote_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quote" DROP CONSTRAINT "quote_user_id_user_id_fkey", ADD CONSTRAINT "quote_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;