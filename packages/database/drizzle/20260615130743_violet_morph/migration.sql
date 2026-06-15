DROP INDEX "order_active_metrics_idx";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "business_type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "user" SET "business_type" = UPPER("business_type");--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "business_type" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "business_type";--> statement-breakpoint
CREATE TYPE "business_type" AS ENUM('DEALER', 'CONTRACTOR', 'END_USER', 'DISTRIBUTOR');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "business_type" SET DATA TYPE "business_type" USING "business_type"::"business_type";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "business_type" SET DEFAULT 'END_USER'::"business_type";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "user" SET "role" = UPPER("role");--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "user_role";--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('SUPER_ADMIN', 'SALES_REPRESENTATIVE', 'ACCOUNTANT', 'WAREHOUSE_MANAGER', 'DEALER_APPROVER', 'DEALER_PURCHASER', 'CUSTOMER');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "user_role" USING "role"::"user_role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER'::"user_role";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
UPDATE "order" SET "status" = UPPER("status");--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "order_status";--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'REFUND_PENDING');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE "order_status" USING "status"::"order_status";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"order_status";--> statement-breakpoint
CREATE INDEX "order_active_metrics_idx" ON "order" ("created_at") WHERE "status" != 'CANCELLED';