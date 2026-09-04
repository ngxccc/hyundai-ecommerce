ALTER TABLE "order" ADD COLUMN "lead_id" uuid;--> statement-breakpoint
CREATE INDEX "order_lead_idx" ON "order" ("lead_id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_lead_id_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE SET NULL;