import { MESSAGES } from "@nhatnang/shared/constants";
import { z } from "zod";

export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

const envSchema = z.object({
  DATABASE_URL: z.url(MESSAGES.DB_URL_IS_INVALID),
  NODE_ENV: z.enum(ENVIRONMENT_MODES).default(ENVIRONMENT_MODES.DEVELOPMENT),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, MESSAGES.BETTER_AUTH_SECRET_IS_INVALID),
  BETTER_AUTH_URL: z.url(MESSAGES.BETTER_AUTH_URL_IS_INVALID),
});

 
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(MESSAGES.DOTENV_FILE_CONFIG_INVALID);
  parsedEnv.error.issues.forEach((issue) => {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  });
  throw new Error(MESSAGES.DOTENV_CONFIG_ERROR);
}

export const env = parsedEnv.data;

export const isProduction = env.NODE_ENV === ENVIRONMENT_MODES.PRODUCTION;
