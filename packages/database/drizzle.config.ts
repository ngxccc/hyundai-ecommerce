import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  schema: "./src/schemas/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // tự động cast sang snake_case cho db
  casing: "snake_case",
  // it'll warn if u del wrong table
  strict: true,
  verbose: true,
});
