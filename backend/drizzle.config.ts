import { defineConfig } from "drizzle-kit";

const dbUrl = process.env["DB_URL"];

export default defineConfig({
  schema: "./src/database/schemas/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: dbUrl
    ? { url: dbUrl }
    : {
        host: process.env["DB_HOST"] ?? "localhost",
        port: Number(process.env["DB_PORT"]) || 5432,
        user: process.env["DB_USERNAME"] ?? "postgres",
        password: process.env["DB_PASSWORD"] ?? "postgrespassword",
        database: process.env["DB_DATABASE"] ?? "hyundai_ecommerce",
        ssl: false,
      },
  introspect: {
    casing: "camel",
  },
  verbose: true,
});
