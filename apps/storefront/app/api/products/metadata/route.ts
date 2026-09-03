import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { apiSuccess, rfc9457ProblemDetails } from "@nhatnang/shared";
import { productService } from "@/shared/services";
import { NextResponse } from "next/server";
import type { Locale } from "next-intl";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") as Locale) || "vi";
    const metadata = await productService.getFiltersMetadata(locale);
    return NextResponse.json(
      {
        ...apiSuccess(metadata),
        status: true,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj["digest"] === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    console.error("Error fetching products metadata in API route:", error);
    return NextResponse.json(
      {
        ...rfc9457ProblemDetails({
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          detail: "Failed to fetch products metadata",
          instance: "/api/products/metadata",
        }),
        status: false,
        data: null,
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/problem+json" },
      },
    );
  }
}
