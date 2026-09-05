"use server";

import { cookies, headers } from "next/headers";
import { checkRateLimitWithQueue } from "@/shared/lib/rate-limiter";
import { api, ApiClientError } from "@/lib/api-client";
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
    const { data: res, error } = await api.POST("/auth/login", {
      body: parsed.data,
    });

    if (error || !res.data) {
      const errorDetail =
        error && typeof error === "object" && "detail" in error
          ? (error as { detail?: string }).detail
          : undefined;
      return {
        success: false as const,
        error:
          errorDetail ?? "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      };
    }

    const loginData = res.data;
    const cookieStore = await cookies();

    cookieStore.set("adminAccessToken", loginData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });

    cookieStore.set("adminRefreshToken", loginData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2592000,
    });

    cookieStore.set(
      "adminUser",
      encodeURIComponent(
        JSON.stringify({
          id: loginData.user.id,
          email: loginData.user.email,
          fullName: loginData.user.fullName,
          role: loginData.user.role,
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

    return { success: true as const, data: loginData };
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
