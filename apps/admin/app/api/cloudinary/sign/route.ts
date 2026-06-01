import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

export async function POST(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("locale") ?? request.cookies.get("NEXT_LOCALE")?.value ?? "vi";
  const locale = (requestedLocale === "en" || requestedLocale === "vi") ? requestedLocale : "vi";
  const t = await getTranslations({ locale, namespace: "Cloudinary" });

  try {
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

