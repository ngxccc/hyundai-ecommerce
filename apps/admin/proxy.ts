import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect routes except login, forbidden, API routes, and static assets
  const isAuthRoute = pathname.includes("/login");
  const isForbiddenRoute = pathname.includes("/forbidden");
  const isPublicRoute =
    isAuthRoute || isForbiddenRoute || pathname.startsWith("/api/");
  const defaultLocale = routing.defaultLocale || "vi";

  const redirectToLocalePath = (targetPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return NextResponse.redirect(url);
  };

  const redirectToLogin = () => redirectToLocalePath(`/${defaultLocale}/login`);

  const redirectToForbidden = () =>
    redirectToLocalePath(`/${defaultLocale}/forbidden`);
  const redirectAuthenticatedUser = () =>
    redirectToLocalePath(pathname.replace(/\/login$/, "") || "/");

  if (isAuthRoute) {
    try {
      const sessionRes = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (sessionRes.ok) {
        const session = await sessionRes.json();

        if (session?.user) {
          if (session.user.role !== "admin") {
            return redirectToForbidden();
          }

          return redirectAuthenticatedUser();
        }
      }
    } catch (error) {
      console.error("Middleware Auth Error:", error);
    }
  }

  if (!isPublicRoute) {
    try {
      const sessionRes = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: { cookie: request.headers.get("cookie") || "" },
        },
      );

      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (!session || !session.user) {
          // Not logged in -> redirect to login
          return redirectToLogin();
        }

        if (session.user.role !== "admin") {
          // Logged in but not admin -> redirect to forbidden
          return redirectToForbidden();
        }

        // Logged in as admin -> allow request to continue
        // fallthrough to i18n middleware and response header setting
      } else {
        // Fetch failed or unauthorized -> redirect to login
        return redirectToLogin();
      }
    } catch (error) {
      console.error("Middleware Auth Error:", error);
      // On error, redirect to login
      return redirectToLogin();
    }
  }

  const response = handleI18nRouting(request);

  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
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
