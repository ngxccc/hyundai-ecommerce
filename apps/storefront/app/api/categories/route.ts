import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { apiSuccess, rfc9457ProblemDetails } from "@nhatnang/shared";
import { categoryService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") as "vi" | "en") || "vi";
    const dbCategories = await categoryService.getCategories(locale);

    return NextResponse.json(
      {
        ...apiSuccess(dbCategories),
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
    console.error("Error fetching categories in API route:", error);
    return NextResponse.json(
      {
        ...rfc9457ProblemDetails({
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          detail: "Failed to fetch categories",
          instance: "/api/categories",
        }),
        status: false,
        data: [],
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/problem+json" },
      },
    );
  }
}
