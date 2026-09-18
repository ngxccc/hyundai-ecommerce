import { isInternalStaff } from "@/lib/rbac";
import { routing } from "@/i18n/routing";
import { checkRateLimitWithQueue } from "@/lib/rate-limiter";
import { HTTP_STATUS, REDIS_KEYS } from "@/constants";
import { parseSessionFromCookieStore } from "@/lib/session";
import { isJwtExpired } from "@/lib/jwt";
import { rotateAdminToken, type RotatedTokens } from "@/lib/token-refresh";
import type { Locale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    /\.(?:ttf|otf|woff|woff2|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(
      pathname,
    )
  ) {
    return NextResponse.next();
  }

  // Rate limit check (e.g. max 100 page views per 60 seconds per IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  const rateLimit = await checkRateLimitWithQueue(
    REDIS_KEYS.RATE_LIMIT.ADMIN_PAGE(ip),
    100,
    "60 s",
  );

  if (!rateLimit.success) {
    return new NextResponse("Too Many Requests", {
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
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
  const locale = pathLocale ?? routing.defaultLocale;

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

  let session = parseSessionFromCookieStore(request.cookies);
  let user = session?.user ?? null;
  const refreshToken =
    request.cookies.get("adminRefreshToken")?.value ??
    request.cookies.get("refreshToken")?.value;

  let newTokens: RotatedTokens | null = null;

  // Silent Token Rotation: If access token is expired/missing but refresh token exists
  if ((!session || isJwtExpired(session.accessToken)) && refreshToken) {
    newTokens = await rotateAdminToken(refreshToken);
    if (newTokens) {
      request.cookies.set("adminAccessToken", newTokens.accessToken);
      request.cookies.set("adminRefreshToken", newTokens.refreshToken);
      session = parseSessionFromCookieStore(request.cookies);
      user = session?.user ?? null;
    } else {
      user = null;
    }
  }

  const isAdmin = user && isInternalStaff(user.role);

  if (user) {
    if (!isAdmin && !isForbiddenRoute) return redirect(`/${locale}/forbidden`);
    if (isAuthRoute && isAdmin) {
      const targetPath = locale === routing.defaultLocale ? "/" : `/${locale}`;
      return redirect(targetPath);
    }
  } else {
    if (!isPublicRoute) {
      const loginPath =
        locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
      const redirectRes = redirect(loginPath);
      redirectRes.cookies.delete("adminAccessToken");
      redirectRes.cookies.delete("adminRefreshToken");
      redirectRes.cookies.delete("adminUser");
      return redirectRes;
    }
  }

  const response = handleI18nRouting(request);
  if (newTokens) {
    response.cookies.set("adminAccessToken", newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 900,
    });
    response.cookies.set("adminRefreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });
  }
  return applySecurityHeaders(response);
}
export const config = {
  matcher: [
    "/(vi|en)/:path*",
    "/((?!api|_next|fonts|favicon.ico|sitemap.xml|robots.txt|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|otf|woff|woff2|eot)$).*)",
  ],
};
