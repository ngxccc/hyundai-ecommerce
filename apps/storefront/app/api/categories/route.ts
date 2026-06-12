import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { categoryService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") as "vi" | "en") || "vi";
    const dbCategories = await categoryService.getCategories(locale);

    return NextResponse.json(
      {
        status: true,
        data: dbCategories,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      ((error as any).digest === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    console.error("Error fetching categories in API route:", error);
    return NextResponse.json(
      {
        status: false,
        data: [],
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
