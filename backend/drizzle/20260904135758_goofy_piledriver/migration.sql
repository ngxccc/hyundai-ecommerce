ALTER TABLE "order" ADD COLUMN "customer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_email" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "order_customer_phone_idx" ON "order" ("customer_phone");--> statement-breakpoint
CREATE INDEX "order_order_number_idx" ON "order" ("order_number");--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_users_id_fkey", ADD CONSTRAINT "order_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;