import { describe, expect, it, spyOn } from "bun:test";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { orderService } from "@nhatnang/database/services";
import { env } from "@/env";
import { POST } from "./route";

describe("POST /api/cron/expire-orders", () => {
  it("returns 401 when Authorization header is missing or incorrect", async () => {
    const request = new Request("http://localhost/api/cron/expire-orders", {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    const response = await POST(request);
    const json = (await response.json()) as { success: boolean; error: string };

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Unauthorized");
  });

  it("successfully expires orders and returns counts", async () => {
    const expireSpy = spyOn(
      orderService,
      "expirePendingOrders",
    ).mockResolvedValueOnce({ expiredCount: 5 });

    const request = new Request("http://localhost/api/cron/expire-orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET}`,
      },
    });

    const response = await POST(request);
    const json = (await response.json()) as {
      success: boolean;
      expiredCount: number;
    };

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.expiredCount).toBe(5);
    expect(expireSpy).toHaveBeenCalledWith(15);
    expireSpy.mockRestore();
  });
});
