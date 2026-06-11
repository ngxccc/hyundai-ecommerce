CREATE TYPE "business_type" AS ENUM('dealer', 'contractor', 'end_user', 'distributor');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('admin', 'dealer', 'customer');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "event_type" AS ENUM('SEND_QUOTE_EMAIL', 'SEND_MAIL');--> statement-breakpoint
CREATE TYPE "outbox_event_status" AS ENUM('PENDING', 'PROCESSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('COD', 'MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "quote_status" AS ENUM('pending_review', 'negotiating', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"price" numeric(15,2) NOT NULL,
	"description" jsonb,
	"short_description" text,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"brand_id" uuid,
	"category_id" uuid,
	"specs" jsonb DEFAULT '{}',
	"total_stock_cache" integer DEFAULT 0 NOT NULL,
	"total_sales_cache" integer DEFAULT 0 NOT NULL,
	"is_quote_only" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'customer'::"user_role" NOT NULL,
	"dealer_tier_id" uuid,
	"phone" text NOT NULL UNIQUE,
	"company_name" text,
	"tax_id" text,
	"business_type" "business_type" DEFAULT 'end_user'::"business_type" NOT NULL,
	"province" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealer_tier" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"discount_percentage" numeric(5,2) NOT NULL,
	"minimum_spend" numeric(15,2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"street_address" text NOT NULL,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_stock" (
	"warehouse_id" uuid,
	"product_id" uuid,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock_warning" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouse_stock_pkey" PRIMARY KEY("warehouse_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"product_sku" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(15,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending'::"order_status" NOT NULL,
	"shipping_fee" numeric(15,2) NOT NULL,
	"shipping_address" text NOT NULL,
	"total_amount" numeric(15,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_bid" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_name" text NOT NULL,
	"quoted_price" numeric(15,2) NOT NULL,
	"internal_note" text,
	"is_selected" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "outbox_event" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" "event_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_event_status" DEFAULT 'PENDING'::"outbox_event_status" NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"parent_id" uuid,
	"description" text,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_address" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"receiver_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"street_address" text NOT NULL,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"order_id" uuid NOT NULL,
	"amount" numeric(15,2) NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING'::"payment_status" NOT NULL,
	"transaction_id" text,
	"raw_payload" text
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid UNIQUE
);
--> statement-breakpoint
CREATE TABLE "quote_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"requested_price" numeric(15,2) NOT NULL,
	"agreed_price" numeric(15,2)
);
--> statement-breakpoint
CREATE TABLE "quote_message" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quote_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "quote_status" DEFAULT 'pending_review'::"quote_status" NOT NULL,
	"total_quoted_price" numeric(15,2),
	"expiration_date" timestamp with time zone,
	"note" text,
	"order_id" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_active_idx" ON "product" ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "product_name_active_idx" ON "product" ("name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "product_brand_idx" ON "product" ("brand_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "product" ("category_id");--> statement-breakpoint
CREATE INDEX "product_sales_cache_idx" ON "product" ("total_sales_cache");--> statement-breakpoint
CREATE INDEX "product_created_at_idx" ON "product" ("created_at");--> statement-breakpoint
CREATE INDEX "product_power_idx" ON "product" ((CASE WHEN "specs"->>'power' ~ '^\s*\d+(\.\d+)?\s*$' THEN ("specs"->>'power')::numeric ELSE NULL END));--> statement-breakpoint
CREATE INDEX "product_voltage_idx" ON "product" ((CASE WHEN "specs"->>'voltage' ~ '^\s*\d+(\.\d+)?\s*$' THEN ("specs"->>'voltage')::numeric ELSE NULL END));--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "user_dealer_tier_idx" ON "user" ("dealer_tier_id");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" ("created_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "warehouse_name_idx" ON "warehouse" ("name");--> statement-breakpoint
CREATE INDEX "warehouse_stock_product_idx" ON "warehouse_stock" ("product_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_item" ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_item" ("product_id");--> statement-breakpoint
CREATE INDEX "order_user_status_created_idx" ON "order" ("user_id","status","created_at");--> statement-breakpoint
CREATE INDEX "order_active_metrics_idx" ON "order" ("created_at") WHERE "status" != 'cancelled';--> statement-breakpoint
CREATE UNIQUE INDEX "one_selected_bid_order_idx" ON "shipping_bid" ("order_id") WHERE "is_selected" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_product_unique_idx" ON "cart_item" ("cart_id","product_id");--> statement-breakpoint
CREATE INDEX "quote_item_quote_idx" ON "quote_item" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_item_product_idx" ON "quote_item" ("product_id");--> statement-breakpoint
CREATE INDEX "quote_message_quote_idx" ON "quote_message" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_message_sender_idx" ON "quote_message" ("sender_id");--> statement-breakpoint
CREATE INDEX "quote_user_idx" ON "quote" ("user_id");--> statement-breakpoint
CREATE INDEX "quote_order_idx" ON "quote" ("order_id");--> statement-breakpoint
CREATE INDEX "quote_created_at_idx" ON "quote" ("created_at");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_dealer_tier_id_dealer_tier_id_fkey" FOREIGN KEY ("dealer_tier_id") REFERENCES "dealer_tier"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_warehouse_id_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "shipping_bid" ADD CONSTRAINT "shipping_bid_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL;