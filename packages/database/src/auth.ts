import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { v7 as uuidv7 } from "uuid";
import * as schema from "./schemas";
import { db } from "./client";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },

    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,

    onExistingUserSignUp: () => {
      throw new APIError("BAD_REQUEST", {
        message: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    // eslint-disable-next-line @typescript-eslint/require-await
    sendVerificationEmail: async ({ user, url, token }) => {
      // TODO: Tích hợp Resend, AWS SES hoặc Nodemailer ở đây
      console.log("==========================================");
      console.log(`🚀 [DEV-MODE] GỬI MAIL CHO: ${user.email}`);
      console.log(`🔗 Link kích hoạt: ${url}`);
      console.log("==========================================");
    },
  },

  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "customer" },
      dealerTierId: { type: "string", required: false },
      deletedAt: { type: "date", required: false },
      phone: { type: "string", required: true },
      companyName: { type: "string", required: false },
      taxId: { type: "string", required: false },
      businessType: { type: "string", required: true },
      province: { type: "string", required: false },
    },
  },

  advanced: {
    database: {
      generateId: () => {
        return uuidv7();
      },
    },
  },

  // không tương thích với drizzle bản 1-rc
  // experimental: { joins: true },
});

export { APIError, isAPIError } from "better-auth/api";
