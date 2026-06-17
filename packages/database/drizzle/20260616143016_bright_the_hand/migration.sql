ALTER TABLE "order" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_transaction" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
UPDATE "order" SET "payment_method" = 'PAYOS' WHERE "payment_method" IN ('GATEWAY', 'BANK_TRANSFER');--> statement-breakpoint
UPDATE "order" SET "payment_method" = 'CASH' WHERE "payment_method" = 'MANUAL_TRANSFER';--> statement-breakpoint
UPDATE "payment" SET "method" = 'PAYOS' WHERE "method" IN ('GATEWAY', 'BANK_TRANSFER');--> statement-breakpoint
UPDATE "payment" SET "method" = 'CASH' WHERE "method" = 'MANUAL_TRANSFER';--> statement-breakpoint
UPDATE "payment_transaction" SET "payment_method" = 'PAYOS' WHERE "payment_method" IN ('GATEWAY', 'BANK_TRANSFER');--> statement-breakpoint
UPDATE "payment_transaction" SET "payment_method" = 'CASH' WHERE "payment_method" = 'MANUAL_TRANSFER';--> statement-breakpoint
DROP TYPE "payment_method";--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('TRADE_CREDIT', 'PAYOS', 'CASH');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" SET DATA TYPE "payment_method" USING "payment_method"::"payment_method";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "payment_method" SET DEFAULT 'PAYOS'::"payment_method";--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "method" SET DATA TYPE "payment_method" USING "method"::"payment_method";--> statement-breakpoint
ALTER TABLE "payment_transaction" ALTER COLUMN "payment_method" SET DATA TYPE "payment_method" USING "payment_method"::"payment_method";