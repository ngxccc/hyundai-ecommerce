import { describe, expect, it } from "bun:test";
import {
  apiSuccess,
  rfc9457ProblemDetails,
  jsonSuccess,
  jsonError,
} from "./api-response";

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

  describe("jsonSuccess", () => {
    it("should return a Web Response with status 200 and standard envelope", async () => {
      const response = jsonSuccess(
        { id: "prod-1", name: "Hyundai" },
        { page: 1 },
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        success: boolean;
        status: boolean;
        data: { id: string; name: string };
        meta: { page: number };
      };
      expect(body.success).toBe(true);
      expect(body.status).toBe(true);
      expect(body.data).toEqual({ id: "prod-1", name: "Hyundai" });
      expect(body.meta).toEqual({ page: 1 });
    });
  });

  describe("jsonError", () => {
    it("should return a Web Response with RFC 9457 problem details and application/problem+json", async () => {
      const response = jsonError({
        status: 400,
        detail: "Invalid quantity",
        instance: "/api/checkout",
      });
      expect(response.status).toBe(400);
      expect(response.headers.get("Content-Type")).toBe(
        "application/problem+json",
      );
      const body = (await response.json()) as {
        status: boolean;
        success: boolean;
        detail: string;
        title: string;
      };
      expect(body.status).toBe(false);
      expect(body.success).toBe(false);
      expect(body.detail).toBe("Invalid quantity");
      expect(body.title).toBe("Bad Request");
    });
  });
});
