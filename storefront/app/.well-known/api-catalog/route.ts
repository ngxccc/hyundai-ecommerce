import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/shared/constants";
export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const catalog = {
    linkset: [
      {
        anchor: `${origin}/api`,
        "service-desc": [
          {
            href: `${origin}/openapi.json`,
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: `${origin}/llms.txt`,
            type: "text/plain",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog), {
    status: HTTP_STATUS.OK,
    headers: {
      "Content-Type":
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
    },
  });
}

export function HEAD(request: NextRequest) {
  const origin = request.nextUrl.origin;

  return new NextResponse(null, {
    status: HTTP_STATUS.OK,
    headers: {
      "Content-Type":
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      Link: `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
    },
  });
}
