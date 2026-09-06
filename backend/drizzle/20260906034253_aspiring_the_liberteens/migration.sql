ALTER TABLE "category" DROP CONSTRAINT "category_slug_key";--> statement-breakpoint
CREATE INDEX "users_verification_token_idx" ON "users" ("verification_token");--> statement-breakpoint
CREATE INDEX "users_reset_password_token_idx" ON "users" ("reset_password_token");--> statement-breakpoint
CREATE INDEX "credit_limit_history_user_id_idx" ON "credit_limit_history" ("user_id");--> statement-breakpoint
CREATE INDEX "credit_limit_history_changed_by_idx" ON "credit_limit_history" ("changed_by");--> statement-breakpoint
CREATE INDEX "user_address_user_id_idx" ON "user_address" ("user_id");--> statement-breakpoint
CREATE INDEX "user_address_default_idx" ON "user_address" ("user_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_uidx" ON "category" ("slug");--> statement-breakpoint
CREATE INDEX "category_parent_id_idx" ON "category" ("parent_id");--> statement-breakpoint
CREATE INDEX "category_is_active_idx" ON "category" ("is_active");--> statement-breakpoint
CREATE INDEX "cart_item_product_id_idx" ON "cart_item" ("product_id");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_stock_non_negative_chk" CHECK ("total_stock_cache" >= 0);--> statement-breakpoint
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_stock_non_negative_chk" CHECK ("stock" >= 0);--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_quantity_positive_chk" CHECK ("quantity" > 0);