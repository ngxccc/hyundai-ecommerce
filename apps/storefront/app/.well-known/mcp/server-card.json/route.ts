import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const card = {
    name: "hyundai-nhatnang-storefront",
    version: "1.0.0",
    serverInfo: {
      name: "hyundai-nhatnang-storefront",
      version: "1.0.0",
    },
    endpoint: `${origin}/api/mcp`,
    capabilities: {
      tools: [
        {
          name: "search_products",
          description: "Search for products dynamically with filters",
          inputSchema: {
            type: "object",
            properties: {
              q: {
                type: "string",
                description: "Search query",
              },
            },
          },
        },
      ],
      resources: [],
      prompts: [],
    },
  };

  return NextResponse.json(card, {
    status: HTTP_STATUS.OK,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    status: HTTP_STATUS.OK,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
