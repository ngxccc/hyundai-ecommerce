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
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(MESSAGES.NEXT_URL_IS_INVALID),
  },

  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NODE_ENV: process.env.NODE_ENV,
  },
});
