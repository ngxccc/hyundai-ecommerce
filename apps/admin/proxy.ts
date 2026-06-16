import { routing } from "@/i18n/routing";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { getCachedSession } from "@/shared/lib/session";
import type { Locale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Rate limit check (e.g. max 100 page views per 60 seconds per IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const rateLimit = await checkRateLimitWithQueue(
    `ratelimit:admin_page:${ip}`,
    100,
    "60 s",
  );

  if (!rateLimit.success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      statusText: "Too Many Requests",
    });
  }

  const isAuthRoute = pathname.includes("/login");
  const isForbiddenRoute = pathname.includes("/forbidden");
  const isPublicRoute =
    isAuthRoute || isForbiddenRoute || pathname.startsWith("/api/");
  const segments = pathname.split("/").filter(Boolean);
  const pathLocale = routing.locales.includes(segments[0] as Locale)
    ? segments[0]
    : null;
  const locale = pathLocale ?? routing.defaultLocale ?? "vi";

  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    return res;
  };

  const redirect = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return applySecurityHeaders(NextResponse.redirect(url));
  };

  let user = null;
  try {
    const session = await getCachedSession();

    if (session?.user) {
      user = session?.user;
    }
  } catch (error) {
    // HACK: Swallow network exceptions to prevent Edge runtime crashes.
    // Fallback to unauthenticated state.
    console.error("Middleware Auth Error:", error);
  }

  const allowedRoles = [
    "SUPER_ADMIN",
    "SALES_REPRESENTATIVE",
    "ACCOUNTANT",
    "WAREHOUSE_MANAGER",
  ];
  const isAdmin = user && allowedRoles.includes(user.role);

  if (user) {
    if (!isAdmin && !isForbiddenRoute) return redirect(`/${locale}/forbidden`);
    if (isAuthRoute && isAdmin)
      return redirect(pathname.replace(/\/login$/, "") || "/");
  } else {
    if (!isPublicRoute) return redirect(`/${locale}/login`);
  }

  const response = handleI18nRouting(request);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/(vi|en)/:path*",
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
