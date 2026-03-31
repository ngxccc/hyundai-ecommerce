import { z } from "zod";
import { MESSAGES } from "./messages";

export const ENVIRONMENT_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

const envSchema = z.object({
  DATABASE_URL: z.url(MESSAGES.DB_URL_IS_INVALID),
  NODE_ENV: z.enum(ENVIRONMENT_MODES).default(ENVIRONMENT_MODES.DEVELOPMENT),
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
