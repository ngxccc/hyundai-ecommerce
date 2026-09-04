import { newsService } from "@/shared/services";
import { jsonSuccess, jsonError } from "@/shared/lib/api-response";
import { HTTP_STATUS } from "@/shared/constants";
export async function GET() {
  try {
    const data = await newsService.getLatest();
    return jsonSuccess(data);
  } catch {
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Failed to fetch latest news",
      instance: "/api/news",
    });
  }
}
