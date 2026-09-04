"use server";

import { cookies, headers } from "next/headers";
import { checkRateLimitWithQueue } from "@/shared/lib/rate-limiter";
import { adminApiClient, ApiClientError } from "@/lib/api-client";
import { getTranslations } from "next-intl/server";
import { adminLoginSchema, type AdminLoginForm } from "@/shared/validators";
import { formatValidationErrors } from "@/shared/utils/validation";
import { getActionErrorMessage } from "@/shared/lib/action-auth";
import { SYSTEM_ERROR_CODES } from "@/shared/constants";
export const adminLoginAction = async (data: AdminLoginForm) => {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") ?? "127.0.0.1";

  // 1. Rate limiting check
  const rateLimitResult = await checkRateLimitWithQueue(
    `login:admin:${ip}`,
    5,
    "60 s",
  );

  if (!rateLimitResult.success) {
    const t = await getTranslations("errors");
    return {
      success: false as const,
      error: t("rateLimitExceeded"),
    };
  }

  const parsed = await adminLoginSchema.safeParseAsync(data);

  if (!parsed.success) {
    const t = await getTranslations("errors");
    return {
      success: false,
      code: SYSTEM_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: formatValidationErrors(parsed.error, (key: string) =>
        t(key as never),
      ),
    };
  }

  try {
    const res = await adminApiClient.auth.login(parsed.data);
    const cookieStore = await cookies();

    cookieStore.set("adminAccessToken", res.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 900,
    });

    cookieStore.set("adminRefreshToken", res.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });

    cookieStore.set(
      "adminUser",
      encodeURIComponent(
        JSON.stringify({
          id: res.user.id,
          email: res.user.email,
          name: res.user.fullName,
          role: res.user.role,
        }),
      ),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 604800,
      },
    );

    return { success: true as const, data: res };
  } catch (error) {
    const t = await getTranslations("errors");
    console.error("[adminLoginAction]", error);
    if (error instanceof ApiClientError && error.problem?.detail) {
      return { success: false as const, error: error.problem.detail };
    }

    return {
      success: false as const,
      error: getActionErrorMessage(
        error,
        (key) => t(key as never),
        "loginFailed",
      ),
    };
  }
};
