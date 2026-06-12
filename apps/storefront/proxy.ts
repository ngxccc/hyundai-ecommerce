import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  const isDev = process.env.NODE_ENV === "development";

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
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
