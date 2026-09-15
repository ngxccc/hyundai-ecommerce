import { describe, expect, it, spyOn } from "bun:test";
import { api } from "@/lib/api-client";
import { catalogApi } from "./catalog.api";

describe("catalogApi", () => {
  it("calls /api/v1/brands on brands.list", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: [] },
      response: new Response(),
    });

    await catalogApi.brands.list();

    expect(getSpy).toHaveBeenCalledWith("/api/v1/brands");
    getSpy.mockRestore();
  });

  it("calls /api/v1/categories/tree on categories.getTree", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: [] },
      response: new Response(),
    });

    await catalogApi.categories.getTree();

    expect(getSpy).toHaveBeenCalledWith("/api/v1/categories/tree");
    getSpy.mockRestore();
  });

  it("calls /api/v1/products with params on products.list", async () => {
    const getSpy = spyOn(api, "GET").mockResolvedValue({
      data: { success: true, data: [] },
      response: new Response(),
    });

    await catalogApi.products.list({ limit: 20 });

    expect(getSpy).toHaveBeenCalledWith("/api/v1/products", {
      params: { query: { limit: 20 } },
    });
    getSpy.mockRestore();
  });
});
