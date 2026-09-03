CREATE TYPE "approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "business_type" AS ENUM('CONTRACTOR', 'COMMERCIAL', 'GOVERNMENT', 'END_USER', 'DEALER');--> statement-breakpoint
CREATE TYPE "debt_repayment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "event_type" AS ENUM('SEND_QUOTE_EMAIL', 'SEND_MAIL', 'SEND_ZALO_ZNS', 'ORDER_CREATED', 'PAYMENT_RECEIVED', 'DEALER_APPROVAL_REQUIRED');--> statement-breakpoint
CREATE TYPE "order_payment_status" AS ENUM('PENDING', 'DEPOSIT_PAID', 'FULLY_PAID', 'REFUNDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "outbox_event_status" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('CASH', 'TRADE_CREDIT', 'PAYOS', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "payment_transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "payment_transaction_type" AS ENUM('FULL_PAYMENT', 'DEPOSIT', 'REMAINING', 'DEBT_REPAYMENT');--> statement-breakpoint
CREATE TYPE "quote_status" AS ENUM('DRAFT', 'SUBMITTED', 'NEGOTIATING', 'APPROVED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('CUSTOMER', 'DEALER_APPROVER', 'DEALER_PURCHASER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');--> statement-breakpoint
CREATE TABLE "dealer_tier" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name_vi" text NOT NULL UNIQUE,
	"name_en" text,
	"discount_percentage" numeric(5,2) NOT NULL,
	"minimum_spend" numeric(15,2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"avatar_url" text,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'CUSTOMER'::"user_role" NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE'::"user_status" NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"dealer_tier_id" uuid,
	"parent_id" uuid,
	"company_name" text,
	"tax_id" text,
	"business_type" "business_type" DEFAULT 'END_USER'::"business_type" NOT NULL,
	"province" text,
	"credit_limit" numeric(15,2) DEFAULT '0.00' NOT NULL,
	"current_debt" numeric(15,2) DEFAULT '0.00' NOT NULL,
	"verification_token" varchar(255),
	"verification_expires_at" timestamp with time zone,
	"reset_password_token" varchar(255),
	"reset_password_expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "credit_limit_history" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"old_limit" numeric(15,2) NOT NULL,
	"new_limit" numeric(15,2) NOT NULL,
	"changed_by" uuid NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "user_address" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"receiver_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"street_address" text NOT NULL,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"description_vi" text,
	"description_en" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name_vi" text NOT NULL,
	"name_en" text,
	"slug" text NOT NULL UNIQUE,
	"parent_id" uuid,
	"description_vi" text,
	"description_en" text,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name_vi" text NOT NULL,
	"name_en" text,
	"slug" text NOT NULL,
	"price" numeric(15,2) NOT NULL,
	"description_vi" jsonb,
	"description_en" jsonb,
	"short_description_vi" text,
	"short_description_en" text,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"brand_id" uuid,
	"category_id" uuid,
	"product_type" text,
	"power_kva" numeric(10,2),
	"power_kw" numeric(10,2),
	"standby_power_kva" numeric(10,2),
	"standby_power_kw" numeric(10,2),
	"phase" text,
	"voltage" text,
	"frequency" integer,
	"fuel_type" text,
	"canopy_type" text,
	"start_method" text,
	"engine_brand" text,
	"alternator_brand" text,
	"ups_topology" text,
	"ups_battery_type" text,
	"spec_sheet" jsonb,
	"specs" jsonb DEFAULT '{}',
	"total_stock_cache" integer DEFAULT 0 NOT NULL,
	"total_sales_cache" integer DEFAULT 0 NOT NULL,
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
CREATE TABLE "warehouse" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name_vi" text NOT NULL,
	"name_en" text,
	"street_address" text NOT NULL,
	"district" text NOT NULL,
	"city" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
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
	"user_id" uuid NOT NULL UNIQUE
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
	"deleted_at" timestamp with time zone,
	"order_number" varchar(32),
	"user_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'PENDING'::"order_status" NOT NULL,
	"shipping_fee" numeric(15,2) DEFAULT '0.00' NOT NULL,
	"shipping_address" text NOT NULL,
	"total_amount" numeric(15,2) NOT NULL,
	"deposit_amount" numeric(15,2) DEFAULT '0.00',
	"remaining_amount" numeric(15,2) DEFAULT '0.00',
	"payment_method" "payment_method" DEFAULT 'PAYOS'::"payment_method" NOT NULL,
	"payment_status" "order_payment_status" DEFAULT 'PENDING'::"order_payment_status" NOT NULL,
	"approval_status" "approval_status" DEFAULT 'APPROVED'::"approval_status" NOT NULL,
	"approved_by" uuid
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
CREATE TABLE "quote_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid,
	"is_custom_item" boolean DEFAULT false NOT NULL,
	"item_name" varchar(255),
	"item_model" varchar(100),
	"item_specs" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(15,2),
	"discount_percent" numeric(5,2) DEFAULT '0.00',
	"final_unit_price" numeric(15,2),
	"total_price" numeric(15,2),
	"requested_price" numeric(15,2),
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
	"deleted_at" timestamp with time zone,
	"quote_number" varchar(32),
	"user_id" uuid,
	"customer_name" varchar(255),
	"customer_phone" varchar(20),
	"customer_email" varchar(255),
	"company_name" varchar(255),
	"tax_id" varchar(50),
	"shipping_address" text,
	"status" "quote_status" DEFAULT 'DRAFT'::"quote_status" NOT NULL,
	"subtotal_price" numeric(15,2) DEFAULT '0.00',
	"vat_rate" integer DEFAULT 10,
	"vat_amount" numeric(15,2) DEFAULT '0.00',
	"total_quoted_price" numeric(15,2),
	"commercial_terms" jsonb,
	"expiration_date" timestamp with time zone,
	"note" text,
	"order_id" uuid,
	"created_by_admin_id" uuid
);
--> statement-breakpoint
CREATE TABLE "debt_repayment" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"amount" numeric(15,2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "debt_repayment_status" DEFAULT 'PENDING'::"debt_repayment_status" NOT NULL,
	"order_code" bigint UNIQUE,
	"reference_code" text UNIQUE,
	"verified_by" uuid
);
--> statement-breakpoint
CREATE TABLE "payment_transaction" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"order_id" uuid NOT NULL,
	"amount" numeric(15,2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"transaction_type" "payment_transaction_type" NOT NULL,
	"status" "payment_transaction_status" DEFAULT 'PENDING'::"payment_transaction_status" NOT NULL,
	"order_code" bigint UNIQUE,
	"reference_code" text UNIQUE,
	"verified_by" uuid
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
	"raw_payload" text
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_event_status" DEFAULT 'PENDING'::"outbox_event_status" NOT NULL,
	"processed_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_uidx" ON "refresh_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_uidx" ON "users" ("phone_number");--> statement-breakpoint
CREATE INDEX "users_dealer_tier_idx" ON "users" ("dealer_tier_id");--> statement-breakpoint
CREATE INDEX "users_parent_id_idx" ON "users" ("parent_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" ("status");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_uidx" ON "product" ("slug");--> statement-breakpoint
CREATE INDEX "product_price_idx" ON "product" ("price");--> statement-breakpoint
CREATE INDEX "product_brand_id_idx" ON "product" ("brand_id");--> statement-breakpoint
CREATE INDEX "product_category_id_idx" ON "product" ("category_id");--> statement-breakpoint
CREATE INDEX "product_created_at_idx" ON "product" ("created_at");--> statement-breakpoint
CREATE INDEX "product_power_kva_idx" ON "product" ("power_kva");--> statement-breakpoint
CREATE INDEX "product_power_kw_idx" ON "product" ("power_kw");--> statement-breakpoint
CREATE INDEX "product_voltage_idx" ON "product" ("voltage");--> statement-breakpoint
CREATE INDEX "product_phase_idx" ON "product" ("phase");--> statement-breakpoint
CREATE INDEX "product_fuel_type_idx" ON "product" ("fuel_type");--> statement-breakpoint
CREATE INDEX "product_canopy_type_idx" ON "product" ("canopy_type");--> statement-breakpoint
CREATE INDEX "product_ups_topology_idx" ON "product" ("ups_topology");--> statement-breakpoint
CREATE INDEX "product_product_type_idx" ON "product" ("product_type");--> statement-breakpoint
CREATE INDEX "warehouse_stock_product_idx" ON "warehouse_stock" ("product_id");--> statement-breakpoint
CREATE INDEX "warehouse_name_idx" ON "warehouse" ("name_vi");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_product_unique_idx" ON "cart_item" ("cart_id","product_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_item" ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_item" ("product_id");--> statement-breakpoint
CREATE INDEX "order_user_status_created_idx" ON "order" ("user_id","status","created_at");--> statement-breakpoint
CREATE INDEX "order_active_metrics_idx" ON "order" ("created_at") WHERE "status" != 'CANCELLED';--> statement-breakpoint
CREATE UNIQUE INDEX "one_selected_bid_order_idx" ON "shipping_bid" ("order_id") WHERE "is_selected" = true;--> statement-breakpoint
CREATE INDEX "quote_item_quote_idx" ON "quote_item" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_item_product_idx" ON "quote_item" ("product_id");--> statement-breakpoint
CREATE INDEX "quote_message_quote_idx" ON "quote_message" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_message_sender_idx" ON "quote_message" ("sender_id");--> statement-breakpoint
CREATE INDEX "quote_user_idx" ON "quote" ("user_id");--> statement-breakpoint
CREATE INDEX "quote_order_idx" ON "quote" ("order_id");--> statement-breakpoint
CREATE INDEX "quote_created_at_idx" ON "quote" ("created_at");--> statement-breakpoint
CREATE INDEX "quote_customer_phone_idx" ON "quote" ("customer_phone");--> statement-breakpoint
CREATE INDEX "debt_repayment_user_idx" ON "debt_repayment" ("user_id");--> statement-breakpoint
CREATE INDEX "debt_repayment_status_idx" ON "debt_repayment" ("status");--> statement-breakpoint
CREATE INDEX "payment_transaction_order_idx" ON "payment_transaction" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_transaction_order_code_uidx" ON "payment_transaction" ("order_code");--> statement-breakpoint
CREATE INDEX "payment_order_idx" ON "payment" ("order_id");--> statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment" ("status");--> statement-breakpoint
CREATE INDEX "outbox_events_status_created_at_idx" ON "outbox_events" ("status","created_at");--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_dealer_tier_id_dealer_tier_id_fkey" FOREIGN KEY ("dealer_tier_id") REFERENCES "dealer_tier"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "credit_limit_history" ADD CONSTRAINT "credit_limit_history_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "credit_limit_history" ADD CONSTRAINT "credit_limit_history_changed_by_users_id_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_warehouse_id_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_approved_by_users_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_bid" ADD CONSTRAINT "shipping_bid_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_quote_id_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quote_message" ADD CONSTRAINT "quote_message_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_admin_id_users_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "debt_repayment" ADD CONSTRAINT "debt_repayment_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "debt_repayment" ADD CONSTRAINT "debt_repayment_verified_by_users_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_verified_by_users_id_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT;