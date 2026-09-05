import { HTTP_STATUS } from "@/shared/constants";
import { jsonSuccess, jsonError } from "@/shared/lib/api-response";
import { productService } from "@/shared/services";
import type { Locale } from "next-intl";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLocale = searchParams.get("locale");
    const locale: Locale = rawLocale === "en" ? "en" : "vi";
    const metadata = await productService.getFiltersMetadata(locale);
    return jsonSuccess(metadata);
  } catch (error) {
    const errObj = error as Record<string, unknown>;
    if (
      error instanceof Error &&
      (errObj.digest === "NEXT_PRERENDER_INTERRUPTED" ||
        error.message.includes("bail out of prerendering"))
    ) {
      throw error;
    }
    console.error("Error fetching products metadata in API route:", error);
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Failed to fetch products metadata",
      instance: "/api/products/metadata",
      fallbackData: null,
    });
  }
}
