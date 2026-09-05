import { ENVIRONMENT_MODES, MESSAGES } from "@/shared/constants";
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
    BACKEND_API_URL: z.url().default("http://127.0.0.1:3000"),
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
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BANK_BIN: process.env.NEXT_PUBLIC_BANK_BIN,
    NEXT_PUBLIC_BANK_ACCOUNT_NO: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO,
    NEXT_PUBLIC_BANK_ACCOUNT_NAME: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME,
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
});
