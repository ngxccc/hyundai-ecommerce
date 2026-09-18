ALTER TYPE "business_type" ADD VALUE IF NOT EXISTS 'INTERNAL';--> statement-breakpoint
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'WAREHOUSE';--> statement-breakpoint
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';--> statement-breakpoint
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'CUSTOMER';--> statement-breakpoint
ALTER TABLE "quote_item" ALTER COLUMN "item_name" SET NOT NULL;