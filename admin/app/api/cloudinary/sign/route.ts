import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";
import { type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getCachedSession } from "@/shared/lib/session";
import { checkRateLimitWithQueue } from "@/shared/lib/rate-limiter";
import { jsonSuccess, jsonError } from "@/shared/lib/api-response";
import { HTTP_STATUS } from "@/shared/constants";

export async function POST(request: NextRequest) {
  const requestedLocale =
    request.nextUrl.searchParams.get("locale") ??
    request.cookies.get("NEXT_LOCALE")?.value ??
    "vi";
  const locale =
    requestedLocale === "en" || requestedLocale === "vi"
      ? requestedLocale
      : "vi";
  const t = await getTranslations({ locale, namespace: "cloudinary" });

  try {
    // 1. Session and role check
    const session = await getCachedSession();
    const allowedRoles = ["ADMIN", "SALES"];
    if (!session?.user.role || !allowedRoles.includes(session.user.role)) {
      return jsonError({
        status: HTTP_STATUS.UNAUTHORIZED,
        detail: t("unauthorized"),
        instance: "/api/cloudinary/sign",
      });
    }
    // 2. Rate limiting check
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limitResult = await checkRateLimitWithQueue(`sign:${ip}`, 20, "60 s");
    if (!limitResult.success) {
      return jsonError({
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        detail: t("rateLimitExceeded"),
        instance: "/api/cloudinary/sign",
      });
    }
    const body = (await request.json().catch(() => ({}))) as {
      paramsToSign?: Record<string, unknown>;
    };
    const { paramsToSign } = body;

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "Invalid signing parameters",
        instance: "/api/cloudinary/sign",
      });
    }

    const ALLOWED_SIGN_KEYS: Record<string, true | undefined> = {
      timestamp: true,
      folder: true,
      public_id: true,
      upload_preset: true,
      transformation: true,
      format: true,
    };
    const sanitizedParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(paramsToSign)) {
      if (ALLOWED_SIGN_KEYS[key] && typeof value === "string") {
        sanitizedParams[key] = value;
      }
    }

    if (!sanitizedParams.timestamp) {
      return jsonError({
        status: HTTP_STATUS.BAD_REQUEST,
        detail: "Missing timestamp parameter",
        instance: "/api/cloudinary/sign",
      });
    }

    const signature = cloudinary.utils.api_sign_request(
      sanitizedParams,
      env.CLOUDINARY_API_SECRET,
    );

    return jsonSuccess({ signature });
  } catch {
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: t("signFailed"),
      instance: "/api/cloudinary/sign",
    });
  }
}
