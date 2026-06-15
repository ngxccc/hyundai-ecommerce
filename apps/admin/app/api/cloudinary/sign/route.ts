import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getCachedSession } from "@/shared/lib/session";
import { checkRateLimitWithQueue } from "@nhatnang/shared";

export async function POST(request: NextRequest) {
  const requestedLocale =
    request.nextUrl.searchParams.get("locale") ??
    request.cookies.get("NEXT_LOCALE")?.value ??
    "vi";
  const locale =
    requestedLocale === "en" || requestedLocale === "vi"
      ? requestedLocale
      : "vi";
  const t = await getTranslations({ locale, namespace: "Cloudinary" });

  try {
    // 1. Session and role check
    const session = await getCachedSession();
    const allowedRoles = ["SUPER_ADMIN", "SALES_REPRESENTATIVE", "ACCOUNTANT", "WAREHOUSE_MANAGER"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: t("unauthorized") }, { status: 401 });
    }
    // 2. Rate limiting check
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limitResult = await checkRateLimitWithQueue(`sign:${ip}`, 20, "60 s");
    if (!limitResult.success) {
      return NextResponse.json(
        { error: t("rateLimitExceeded" as never) },
        { status: 429 },
      );
    }
    const body = (await request.json()) as {
      paramsToSign: Record<string, string>;
    };
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return NextResponse.json({ signature });
  } catch {
    return NextResponse.json({ error: t("signFailed") }, { status: 500 });
  }
}
