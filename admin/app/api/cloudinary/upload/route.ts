import type { NextRequest } from "next/server";
import { checkRateLimitWithQueue } from "@/shared/lib/rate-limiter";
import { jsonSuccess, jsonError } from "@/shared/lib/api-response";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getTranslations } from "next-intl/server";
import { getCachedSession } from "@/shared/lib/session";
import { HTTP_STATUS } from "@/shared/constants";
import dns from "node:dns/promises";
import { env } from "@/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const requestedLocale =
    req.nextUrl.searchParams.get("locale") ??
    req.cookies.get("NEXT_LOCALE")?.value ??
    "vi";
  const locale =
    requestedLocale === "en" || requestedLocale === "vi"
      ? requestedLocale
      : "vi";
  const t = await getTranslations({ locale, namespace: "Cloudinary" });

  try {
    // 1. Session and role check
    const session = await getCachedSession();
    const allowedRoles = [
      "SUPER_ADMIN",
      "SALES_REPRESENTATIVE",
      "ACCOUNTANT",
      "WAREHOUSE_MANAGER",
    ];
    if (!session?.user.role || !allowedRoles.includes(session.user.role)) {
      return jsonError({
        status: HTTP_STATUS.UNAUTHORIZED,
        detail: t("unauthorized" as never),
        instance: "/api/cloudinary/upload",
      });
    }

    // 2. Rate limiting check
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limitResult = await checkRateLimitWithQueue(
      `upload:${ip}`,
      10,
      "60 s",
    );

    if (!limitResult.success) {
      return jsonError({
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        detail: t("rateLimitExceeded" as never),
        instance: "/api/cloudinary/upload",
      });
    }

    const contentType = req.headers.get("content-type") ?? "";

    // Handle local file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("noFileProvided"),
          instance: "/api/cloudinary/upload",
        });
      }

      // File size limit validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("fileTooLarge" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      // File MIME-type validation (images only)
      if (!file.type.startsWith("image/")) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("invalidMimeType" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Promise resolving with Promise.withResolvers()
      const { promise, resolve, reject } =
        Promise.withResolvers<UploadApiResponse>();
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (error, result) => {
          if (error) reject(new Error(error.message));
          else resolve(result);
        })
        .end(buffer);

      const result = await promise;
      return jsonSuccess(result);
    }

    // Handle external URL upload
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { url?: string };
      const { url } = body;

      if (!url) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("noUrlProvided"),
          instance: "/api/cloudinary/upload",
        });
      }

      // SSRF validation checks
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("ssrfDetected" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("ssrfDetected" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      const hostname = parsedUrl.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1"
      ) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("ssrfDetected" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      // Resolve DNS to IP to prevent DNS Rebinding / Local IP access
      let ipAddress = "";
      try {
        const lookupResult = await dns.lookup(hostname);
        ipAddress = lookupResult.address;
      } catch {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("ssrfDetected" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      if (
        ipAddress.startsWith("127.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("192.168.") ||
        ipAddress === "::1" ||
        ipAddress.startsWith("fe80:")
      ) {
        return jsonError({
          status: HTTP_STATUS.BAD_REQUEST,
          detail: t("ssrfDetected" as never),
          instance: "/api/cloudinary/upload",
        });
      }

      if (ipAddress.startsWith("172.")) {
        const parts = ipAddress.split(".");
        const secondPart = parseInt(parts[1] ?? "0", 10);
        if (secondPart >= 16 && secondPart <= 31) {
          return jsonError({
            status: HTTP_STATUS.BAD_REQUEST,
            detail: t("ssrfDetected" as never),
            instance: "/api/cloudinary/upload",
          });
        }
      }

      const result = await cloudinary.uploader.upload(url, {
        folder: "products",
      });

      return jsonSuccess(result);
    }

    return jsonError({
      status: HTTP_STATUS.BAD_REQUEST,
      detail: t("unsupportedContentType"),
      instance: "/api/cloudinary/upload",
    });
  } catch (error: unknown) {
    console.error("[Cloudinary Upload Error]", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: error instanceof Error ? error.message : t("uploadFailed"),
      instance: "/api/cloudinary/upload",
    });
  }
}
