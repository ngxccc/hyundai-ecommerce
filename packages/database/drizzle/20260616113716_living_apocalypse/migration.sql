ALTER TABLE "order" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_transaction" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "payment_method";--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('TRADE_CREDIT', 'PAYOS', 'MANUAL_TRANSFER');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" SET DATA TYPE "payment_method" USING "payment_method"::"payment_method";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" SET DEFAULT 'PAYOS'::"payment_method";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE "payment_method" USING "method"::"payment_method";--> statement-breakpoint
ALTER TABLE "payment_transaction" ALTER COLUMN "payment_method" SET DATA TYPE "payment_method" USING "payment_method"::"payment_method";