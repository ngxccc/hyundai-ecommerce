import { describe, expect, it, spyOn } from "bun:test";
import { api } from "@/lib/api-client";
import { productsApi } from "./products.api";

describe("productsApi", () => {
  it("calls api.GET with query parameters on list", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: [] },
      response: new Response(),
    });

    await productsApi.list({ limit: 10, search: "generator" });

    expect(getSpy).toHaveBeenCalledWith("/api/v1/products", {
      params: { query: { limit: 10, search: "generator" } },
    });
    getSpy.mockRestore();
  });

  it("calls api.GET with /api/v1/products/{id} on getById", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: { id: "prod-1" } },
      response: new Response(),
    });

    await productsApi.getById("prod-1");

    expect(getSpy).toHaveBeenCalledWith("/api/v1/products/{id}", {
      params: { path: { id: "prod-1" } },
    });
    getSpy.mockRestore();
  });

  it("calls api.GET with /api/v1/products/metadata on getMetadata", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: { categories: [] } },
      response: new Response(),
    });

    await productsApi.getMetadata();

    expect(getSpy).toHaveBeenCalledWith("/api/v1/products/metadata");
    getSpy.mockRestore();
  });
});
