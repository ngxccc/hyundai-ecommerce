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
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(MESSAGES.NEXT_URL_IS_INVALID),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],
    PAYOS_CLIENT_ID: process.env["PAYOS_CLIENT_ID"],
    PAYOS_API_KEY: process.env["PAYOS_API_KEY"],
    PAYOS_CHECKSUM_KEY: process.env["PAYOS_CHECKSUM_KEY"],
  },
});
