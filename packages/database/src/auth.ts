import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from ".";
import { v7 as uuidv7 } from "uuid";
import * as schema from "./schemas";

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
      role: { type: "string" },
      dealerTierId: { type: "string", required: false },
      deletedAt: { type: "date", required: false },
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
