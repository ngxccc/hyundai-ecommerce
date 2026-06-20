import { initializeSharedConfig } from "@nhatnang/shared";
import { ENVIRONMENT_MODES, MESSAGES } from "@nhatnang/shared/constants";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum([
        ENVIRONMENT_MODES.DEVELOPMENT,
        ENVIRONMENT_MODES.PRODUCTION,
        ENVIRONMENT_MODES.TEST,
      ])
      .default(ENVIRONMENT_MODES.DEVELOPMENT),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    PAYOS_CLIENT_ID: z.string().min(1),
    PAYOS_API_KEY: z.string().min(1),
    PAYOS_CHECKSUM_KEY: z.string().min(1),
    VAT_RATE: z.coerce.number(),
    DEPOSIT_RATE: z.coerce.number(),
    FORCE_MOCK_PAYMENT: z.string().optional(),
    CRON_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(MESSAGES.NEXT_URL_IS_INVALID),
    NEXT_PUBLIC_BANK_BIN: z.string().min(1).default("vietinbank"),
    NEXT_PUBLIC_BANK_ACCOUNT_NO: z.string().min(1).default("123456789"),
    NEXT_PUBLIC_BANK_ACCOUNT_NAME: z
      .string()
      .min(1)
      .default("HYUNDAI NHAT NANG"),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NEXT_PUBLIC_BANK_BIN: process.env["NEXT_PUBLIC_BANK_BIN"],
    NEXT_PUBLIC_BANK_ACCOUNT_NO: process.env["NEXT_PUBLIC_BANK_ACCOUNT_NO"],
    NEXT_PUBLIC_BANK_ACCOUNT_NAME: process.env["NEXT_PUBLIC_BANK_ACCOUNT_NAME"],
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
    PAYOS_CLIENT_ID: process.env["PAYOS_CLIENT_ID"],
    PAYOS_API_KEY: process.env["PAYOS_API_KEY"],
    PAYOS_CHECKSUM_KEY: process.env["PAYOS_CHECKSUM_KEY"],
    VAT_RATE: process.env["VAT_RATE"],
    DEPOSIT_RATE: process.env["DEPOSIT_RATE"],
    FORCE_MOCK_PAYMENT: process.env["FORCE_MOCK_PAYMENT"],
    CRON_SECRET: process.env["CRON_SECRET"],
  },
});

if (typeof window === "undefined") {
  initializeSharedConfig({
    vatRate: env.VAT_RATE,
    depositRate: env.DEPOSIT_RATE,
    payosClientId: env.PAYOS_CLIENT_ID,
    payosApiKey: env.PAYOS_API_KEY,
    payosChecksumKey: env.PAYOS_CHECKSUM_KEY,
    nextPublicAppUrl: env.NEXT_PUBLIC_APP_URL,
    isProduction: env.NODE_ENV === "production",
  });
} else {
  initializeSharedConfig({
    vatRate: 0.1,
    depositRate: 0.2,
    payosClientId: "",
    payosApiKey: "",
    payosChecksumKey: "",
    nextPublicAppUrl: env.NEXT_PUBLIC_APP_URL,
    isProduction: false,
  });
}
