-- Phase 1: Expand - Add new columns as nullable (Idempotent)
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "city" varchar(100);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "ward" varchar(100);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "street_address" varchar(255);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "postal_code" varchar(10);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "latitude" numeric(10,8);--> statement-breakpoint
ALTER TABLE "cinemas" ADD COLUMN IF NOT EXISTS "longitude" numeric(11,8);--> statement-breakpoint

-- Phase 2: Backfill - Populate existing records on Production/Dev
UPDATE "cinemas"
SET "street_address" = COALESCE("street_address", 'Chưa cập nhật địa chỉ'),
    "city" = COALESCE("city", 'Thành phố Hồ Chí Minh'),
    "ward" = COALESCE("ward", 'Phường Bến Nghé')
WHERE "street_address" IS NULL OR "city" IS NULL OR "ward" IS NULL;--> statement-breakpoint

-- Phase 3: Contract - Enforce NOT NULL constraints once backfilled
ALTER TABLE "cinemas" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cinemas" ALTER COLUMN "ward" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cinemas" ALTER COLUMN "street_address" SET NOT NULL;--> statement-breakpoint

-- Phase 4: Finalize - Drop deprecated column and create indexes
ALTER TABLE "cinemas" DROP COLUMN IF EXISTS "address";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cinemas_city_ward_idx" ON "cinemas" ("city","ward");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cinemas_name_idx" ON "cinemas" ("name");
