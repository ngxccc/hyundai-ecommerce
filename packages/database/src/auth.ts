import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { v7 as uuidv7 } from "uuid";
import * as schema from "./schemas";
import { db } from "./client";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

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
    sendVerificationEmail: async ({ user, url }) => {
      const senderEmail =
        env.EMAIL_FROM ?? "Hyundai Nhat Nang <onboarding@resend.dev>";

      try {
        await resend.emails.send({
          from: senderEmail,
          to: user.email,
          subject: "Xác thực tài khoản của bạn",
          // NOTE: Có thể dùng thư viện React Email để ui đẹp thay vì HTML thô
          html: `
            <h2>Chào ${user.name},</h2>
            <p>Vui lòng click vào đường link bên dưới để xác thực tài khoản:</p>
            <a href="${url}" style="padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Xác thực ngay</a>
          `,
        });
      } catch (error) {
        console.error("Lỗi bắn mail Resend:", error);
      }
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
export { toNextJsHandler } from "better-auth/next-js";
