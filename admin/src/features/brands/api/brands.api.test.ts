import { describe, expect, it, spyOn } from "bun:test";
import { api } from "@/lib/api-client";
import { brandsApi } from "./brands.api";

describe("brandsApi", () => {
  it("calls api.GET with /api/v1/brands on list", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: [] },
      response: new Response(),
    });

    const result = await brandsApi.list();

    expect(getSpy).toHaveBeenCalledWith("/api/v1/brands");
    expect(result.data?.success).toBe(true);
    getSpy.mockRestore();
  });

  it("calls api.GET with /api/v1/brands/{id} on getById", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: { id: "brand-123", name: "Hyundai" } },
      response: new Response(),
    });

    await brandsApi.getById("brand-123");

    expect(getSpy).toHaveBeenCalledWith("/api/v1/brands/{id}", {
      params: { path: { id: "brand-123" } },
    });
    getSpy.mockRestore();
  });

  it("calls api.POST with payload on create", async () => {
    const postSpy = spyOn(api, "POST").mockResolvedValue({
      data: { success: true, data: { id: "new-brand" } },
      response: new Response(),
    });

    const payload = {
      name: "Hyundai Power",
      slug: "hyundai-power",
    };
    await brandsApi.create(payload as never);

    expect(postSpy).toHaveBeenCalledWith("/api/v1/brands", {
      body: payload as never,
    });
    postSpy.mockRestore();
  });

  it("calls api.PUT with path and body on update", async () => {
    const putSpy = spyOn(api, "PUT").mockResolvedValue({
      data: { success: true, data: { id: "brand-123" } },
      response: new Response(),
    } as never);

    await brandsApi.update("brand-123", { name: "Updated Brand" });

    expect(putSpy).toHaveBeenCalledWith("/api/v1/brands/{id}", {
      params: { path: { id: "brand-123" } },
      body: { name: "Updated Brand" } as never,
    });
    putSpy.mockRestore();
  });

  it("calls api.DELETE with path parameter on delete", async () => {
    const deleteSpy = spyOn(api, "DELETE").mockResolvedValue({
      data: undefined,
      response: new Response(),
    } as never);

    await brandsApi.delete("brand-123");

    expect(deleteSpy).toHaveBeenCalledWith("/api/v1/brands/{id}", {
      params: { path: { id: "brand-123" } },
    });
    deleteSpy.mockRestore();
  });
});
