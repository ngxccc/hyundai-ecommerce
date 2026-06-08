CREATE INDEX "product_created_at_idx" ON "product" ("created_at");--> statement-breakpoint
CREATE INDEX "user_dealer_tier_idx" ON "user" ("dealer_tier_id");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" ("created_at");--> statement-breakpoint
CREATE INDEX "warehouse_stock_product_idx" ON "warehouse_stock" ("product_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_item" ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_product_idx" ON "order_item" ("product_id");--> statement-breakpoint
CREATE INDEX "quote_item_quote_idx" ON "quote_item" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_item_product_idx" ON "quote_item" ("product_id");--> statement-breakpoint
CREATE INDEX "quote_message_quote_idx" ON "quote_message" ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_message_sender_idx" ON "quote_message" ("sender_id");--> statement-breakpoint
CREATE INDEX "quote_user_idx" ON "quote" ("user_id");--> statement-breakpoint
CREATE INDEX "quote_order_idx" ON "quote" ("order_id");--> statement-breakpoint
CREATE INDEX "quote_created_at_idx" ON "quote" ("created_at");