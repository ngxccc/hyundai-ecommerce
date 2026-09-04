CREATE TYPE "lead_status" AS ENUM('NEW', 'CONTACTING', 'SURVEY_SCHEDULED', 'QUOTED', 'CONVERTED', 'REJECTED', 'LOST');--> statement-breakpoint
CREATE TABLE "lead_item" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lead_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"product_name_vi" varchar(255) NOT NULL,
	"product_name_en" varchar(255),
	"product_model" varchar(100),
	"product_sku" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"lead_code" varchar(32) NOT NULL UNIQUE,
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"company_name" varchar(255),
	"city" varchar(100) NOT NULL,
	"ward" varchar(100) NOT NULL,
	"street_address" varchar(255),
	"notes" text,
	"status" "lead_status" DEFAULT 'NEW'::"lead_status" NOT NULL,
	"assigned_sales_id" uuid,
	"lost_reason" text
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "users" SET "role" = 'SALES' WHERE "role" NOT IN ('ADMIN', 'SALES');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "user_role";--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('ADMIN', 'SALES');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "user_role" USING "role"::"user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SALES'::"user_role";--> statement-breakpoint
CREATE INDEX "lead_item_lead_idx" ON "lead_item" ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_item_product_idx" ON "lead_item" ("product_id");--> statement-breakpoint
CREATE INDEX "lead_status_created_idx" ON "lead" ("status","created_at");--> statement-breakpoint
CREATE INDEX "lead_phone_idx" ON "lead" ("phone_number");--> statement-breakpoint
CREATE INDEX "lead_sales_idx" ON "lead" ("assigned_sales_id");--> statement-breakpoint
ALTER TABLE "lead_item" ADD CONSTRAINT "lead_item_lead_id_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lead_item" ADD CONSTRAINT "lead_item_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_assigned_sales_id_users_id_fkey" FOREIGN KEY ("assigned_sales_id") REFERENCES "users"("id") ON DELETE SET NULL;