import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getTranslations } from "next-intl/server";
import { getCachedSession } from "@/shared/lib/session";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
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
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: t("unauthorized" as never) },
        { status: 401 },
      );
    }

    // 2. Rate limiting check
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limitResult = await checkRateLimitWithQueue(
      `upload:${ip}`,
      10,
      "60 s",
    );

    if (!limitResult.success) {
      return NextResponse.json(
        { error: t("rateLimitExceeded" as never) },
        { status: 429 },
      );
    }

    const contentType = req.headers.get("content-type") ?? "";

    // Handle local file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: t("noFileProvided") },
          { status: 400 },
        );
      }

      // File size limit validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: t("fileTooLarge" as never) },
          { status: 400 },
        );
      }

      // File MIME-type validation (images only)
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: t("invalidMimeType" as never) },
          { status: 400 },
        );
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
      return NextResponse.json(result);
    }

    // Handle external URL upload
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { url?: string };
      const { url } = body;

      if (!url) {
        return NextResponse.json(
          { error: t("noUrlProvided") },
          { status: 400 },
        );
      }

      // SSRF validation checks
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return NextResponse.json(
          { error: t("ssrfDetected" as never) },
          { status: 400 },
        );
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: t("ssrfDetected" as never) },
          { status: 400 },
        );
      }

      const hostname = parsedUrl.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1"
      ) {
        return NextResponse.json(
          { error: t("ssrfDetected" as never) },
          { status: 400 },
        );
      }

      // Resolve DNS to IP to prevent DNS Rebinding / Local IP access
      let ipAddress = "";
      try {
        const lookupResult = await dns.lookup(hostname);
        ipAddress = lookupResult.address;
      } catch {
        return NextResponse.json(
          { error: t("ssrfDetected" as never) },
          { status: 400 },
        );
      }

      if (
        ipAddress.startsWith("127.") ||
        ipAddress.startsWith("10.") ||
        ipAddress.startsWith("192.168.") ||
        ipAddress === "::1" ||
        ipAddress.startsWith("fe80:")
      ) {
        return NextResponse.json(
          { error: t("ssrfDetected" as never) },
          { status: 400 },
        );
      }

      if (ipAddress.startsWith("172.")) {
        const parts = ipAddress.split(".");
        const secondPart = parseInt(parts[1] ?? "0", 10);
        if (secondPart >= 16 && secondPart <= 31) {
          return NextResponse.json(
            { error: t("ssrfDetected" as never) },
            { status: 400 },
          );
        }
      }

      const result = await cloudinary.uploader.upload(url, {
        folder: "products",
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: t("unsupportedContentType") },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("[Cloudinary Upload Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : t("uploadFailed") },
      { status: 500 },
    );
  }
}
