import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { productService } from "@/shared/services";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") as "vi" | "en") || "vi";
    const metadata = await productService.getFiltersMetadata(locale);
    return NextResponse.json(
      {
        status: true,
        data: metadata,
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
        status: false,
        data: null,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
