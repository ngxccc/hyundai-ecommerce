import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { jsonSuccess, jsonError } from "@nhatnang/shared";
import { categoryService } from "@/shared/services";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") as "vi" | "en") || "vi";
    const dbCategories = await categoryService.getCategories(locale);
    return jsonSuccess(dbCategories);
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
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Failed to fetch categories",
      instance: "/api/categories",
      fallbackData: [],
    });
  }
}
