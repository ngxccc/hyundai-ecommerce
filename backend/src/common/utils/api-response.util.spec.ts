import { describe, expect, it } from "bun:test";
import { apiSuccess } from "./api-response.util";

describe("apiSuccess", () => {
  it("should create standard success envelope with data only", () => {
    const data = { id: "123", name: "Inception" };
    const response = apiSuccess(data);

    expect(response).toEqual({
      success: true,
      data,
    });
    expect(response.meta).toBeUndefined();
  });

  it("should create standard success envelope with null data for void operations", () => {
    const response = apiSuccess(null);

    expect(response).toEqual({
      success: true,
      data: null,
    });
  });

  it("should include meta at root level when meta is provided", () => {
    const data = [{ id: "1" }, { id: "2" }];
    const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };
    const response = apiSuccess(data, meta);

    expect(response).toEqual({
      success: true,
      data,
      meta,
    });
  });
});
