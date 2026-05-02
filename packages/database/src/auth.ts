import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { v7 as uuidv7 } from "uuid";
import * as schema from "./schemas";
import { db } from "./client";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },

    usePlural: false,
  }),

  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "customer" },
      dealerTierId: { type: "string", required: false },
      deletedAt: { type: "date", required: false },
      phone: { type: "string", required: true },
      companyName: { type: "string", required: true },
      taxId: { type: "string", required: true },
      businessType: { type: "string", required: true },
      province: { type: "string", required: true },
    },
  },

  advanced: {
    database: {
      generateId: () => {
        return uuidv7();
      },
    },
  },

  experimental: { joins: true },
});
