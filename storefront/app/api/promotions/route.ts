import { promoService } from "@/shared/services";
import { jsonSuccess, jsonError } from "@/shared/lib/api-response";
import { HTTP_STATUS } from "@/shared/constants";
export async function GET() {
  try {
    const activePromo = await promoService.getPromos();
    return jsonSuccess(activePromo);
  } catch {
    return jsonError({
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      detail: "Failed to fetch active promotions",
      instance: "/api/promotions",
    });
  }
}
