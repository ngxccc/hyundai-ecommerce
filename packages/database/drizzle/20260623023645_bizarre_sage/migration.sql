ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "parent_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_parent_id_idx" ON "user" ("parent_id");--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_parent_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_parent_id_user_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "user"("id") ON DELETE SET NULL;