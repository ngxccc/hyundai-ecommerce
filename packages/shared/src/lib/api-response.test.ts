import { describe, expect, it } from "bun:test";
import { apiSuccess, rfc9457ProblemDetails } from "./api-response";

describe("API Response Utilities", () => {
  describe("apiSuccess", () => {
    it("should create standard successful response envelope without meta", () => {
      const res = apiSuccess({ id: "123", name: "Hyundai HY-30CLE" });
      expect(res).toEqual({
        success: true,
        data: { id: "123", name: "Hyundai HY-30CLE" },
      });
    });

    it("should create standard successful response envelope with meta", () => {
      const res = apiSuccess([1, 2, 3], { page: 1, limit: 10, total: 3 });
      expect(res).toEqual({
        success: true,
        data: [1, 2, 3],
        meta: { page: 1, limit: 10, total: 3 },
      });
    });
  });

  describe("rfc9457ProblemDetails", () => {
    it("should construct compliant RFC 9457 problem details without invalidParams", () => {
      const err = rfc9457ProblemDetails({
        status: 404,
        detail: "Product not found",
        instance: "/api/products/unknown-id",
      });

      expect(err.status).toBe(404);
      expect(err.title).toBe("Not Found");
      expect(err.detail).toBe("Product not found");
      expect(err.instance).toBe("/api/products/unknown-id");
      expect(err.type).toBe("https://api.hyundai-ecommerce.com/errors/404");
      expect(err.invalidParams).toBeUndefined();
      expect(typeof err.timestamp).toBe("string");
    });

    it("should construct compliant RFC 9457 problem details with invalidParams", () => {
      const err = rfc9457ProblemDetails({
        status: 400,
        detail: "Validation failed",
        instance: "/api/checkout",
        invalidParams: [
          { name: "shippingAddress", reason: "Address is required" },
        ],
      });

      expect(err.status).toBe(400);
      expect(err.title).toBe("Bad Request");
      expect(err.invalidParams).toHaveLength(1);
      expect(err.invalidParams?.[0]).toEqual({
        name: "shippingAddress",
        reason: "Address is required",
      });
    });
  });
});
