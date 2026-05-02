CREATE TYPE "business_type" AS ENUM('dealer', 'contractor', 'end_user', 'distributor');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tax_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "business_type" "business_type" DEFAULT 'end_user'::"business_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "province" text NOT NULL;