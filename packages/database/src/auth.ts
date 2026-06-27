import { APIError, betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { v7 as uuidv7 } from "uuid";
import * as schema from "./schemas";
import { db } from "./client";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import { Resend } from "resend";
import { env } from "./env";
import { nextCookies } from "better-auth/next-js";

export const resend = new Resend(env.RESEND_API_KEY || "re_dummy");

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

      const sendMail = async () => {
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
      };

      try {
        const nextServerModule = "next/server";
        const { after } = await import(nextServerModule);
        after(sendMail);
      } catch {
        // Fallback for non-Next.js environments (e.g. testing)
        await sendMail();
      }
    },
  },

  user: {
    additionalFields: {
      role: {
        type: schema.userRoleEnum.enumValues,
        required: true,
        defaultValue: "CUSTOMER",
      },
      dealerTierId: { type: "string", required: false },
      parentId: { type: "string", required: false },
      deletedAt: { type: "date", required: false },
      phone: { type: "string", required: true },
      companyName: { type: "string", required: false },
      taxId: { type: "string", required: false },
      businessType: {
        type: schema.businessTypeEnum.enumValues,
        required: true,
      },
      province: { type: "string", required: false },
      creditLimit: { type: "string", required: false },
      currentDebt: { type: "string", required: false },
    },
  },

  advanced: {
    database: {
      generateId: () => {
        return uuidv7();
      },
    },
    sessionStrategy: "jwt",
    jwt: {
      expirationTime: "7d",
    },
  },

  trustedOrigins: [
    "http://localhost:3000", // Storefront cục bộ
    "http://localhost:3001", // Admin cục bộ
    "https://hyundainhatnang.ngxc.io.vn", // Production Storefront
    "https://admin.hyundainhatnang.ngxc.io.vn", // Production Admin
  ],

  plugins: [nextCookies()],

  // không tương thích với drizzle bản 1-rc
  // experimental: { joins: true },
});

export { APIError, isAPIError } from "better-auth/api";
export { toNextJsHandler } from "better-auth/next-js";
export { toNodeHandler } from "better-auth/node";
