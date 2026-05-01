import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  schema: "./src/schemas/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // cast tên biến ts thành camel
  // chỉ tác dụng khi pull,
  introspect: {
    casing: "camel",
  },
  // it'll warn if u del wrong table
  strict: true,
  verbose: true,
});
