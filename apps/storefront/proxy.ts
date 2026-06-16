import { routing } from "@/i18n/routing";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Rate limit check (e.g. max 100 page views per 60 seconds per IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const rateLimit = await checkRateLimitWithQueue(
    `ratelimit:page:${ip}`,
    100,
    "60 s",
  );

  if (!rateLimit.success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      statusText: "Too Many Requests",
    });
  }

  const response = handleI18nRouting(request);
  const isDev = process.env.NODE_ENV === "development";
  const host = request.headers.get("host") ?? "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://res.cloudinary.com https://placehold.co https://images.unsplash.com https://hyundainhatnang.vn;
    font-src 'self' data:;
    connect-src 'self' https://vitals.vercel-insights.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev || isLocal ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  return response;
}

export const config = {
  matcher: [
    "/(vi|en)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
