import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import request from "supertest";
import { type INestApplication } from "@nestjs/common";
import type { Server } from "node:http";
import type { OpenAPIObject } from "@nestjs/swagger";
import {
  createTestApp,
  teardownTestApp,
  type TestAppSetup,
} from "./helpers/app.helper";
import { setupOpenApiAndScalar } from "@/common/config/openapi.config";

describe("OpenAPI Specification & Scalar Documentation", () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let document: OpenAPIObject;

  const getHttpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    setup = await createTestApp({
      configureApp: (testApp) => {
        document = setupOpenApiAndScalar(testApp);
      },
    });
    app = setup.app;
  }, 30000);
  afterAll(async () => {
    await teardownTestApp(setup);
  }, 30000);

  describe("OpenAPI 3.1.0 Document Structure", () => {
    it("should conform to OpenAPI 3.1.0 standard with platform metadata", () => {
      expect(document.openapi).toBe("3.1.0");
      expect(document.info.title).toBe("Hyundai E-Commerce API");
      expect(document.info.version).toBe("1.0.0");
      expect(document.info.description).toContain(
        "Hyundai E-Commerce Platform API",
      );
    });

    it("should configure bearer and JWT-auth security schemes in components", () => {
      const securitySchemes = document.components?.securitySchemes as
        | Record<string, { type: string; scheme: string; bearerFormat: string }>
        | undefined;

      expect(securitySchemes).toBeDefined();
      expect(securitySchemes?.["bearer"]).toBeDefined();
      expect(securitySchemes?.["bearer"]?.type).toBe("http");
      expect(securitySchemes?.["bearer"]?.scheme).toBe("bearer");
      expect(securitySchemes?.["bearer"]?.bearerFormat).toBe("JWT");

      expect(securitySchemes?.["JWT-auth"]).toBeDefined();
      expect(securitySchemes?.["JWT-auth"]?.type).toBe("http");
      expect(securitySchemes?.["JWT-auth"]?.scheme).toBe("bearer");
      expect(securitySchemes?.["JWT-auth"]?.bearerFormat).toBe("JWT");
    });

    it("should contain all registered domain tags", () => {
      const tagNames = document.tags?.map((t) => t.name) ?? [];

      const expectedTags = [
        "auth",
        "users",
        "dealer-tiers",
        "leads",
        "catalog",
        "warehouse",
        "cart",
        "quotes",
        "orders",
        "payments",
        "app",
      ];

      for (const expectedTag of expectedTags) {
        expect(tagNames).toContain(expectedTag);
      }
    });
  });

  describe("API Endpoints & Paths Coverage", () => {
    it("should register all critical e-commerce paths across modules", () => {
      const paths = Object.keys(document.paths);

      // Auth & User paths
      expect(paths).toContain("/auth/login");
      expect(paths).toContain("/auth/register");
      expect(paths).toContain("/auth/refresh");
      expect(paths).toContain("/users/me");

      // Dealer Tiers & Leads
      expect(paths).toContain("/dealer-tiers");
      expect(paths).toContain("/leads");

      // Catalog
      expect(paths).toContain("/products");
      expect(paths).toContain("/categories");
      expect(paths).toContain("/brands");

      // Warehouse
      expect(paths).toContain("/warehouses");
      expect(paths).toContain("/warehouses/stock/product/{productId}");

      // Cart
      expect(paths).toContain("/cart");
      expect(paths).toContain("/cart/items");
      expect(paths).toContain("/cart/merge");

      // Quotes
      expect(paths).toContain("/quotes");
      expect(paths).toContain("/quotes/admin");

      // Orders
      expect(paths).toContain("/orders");
      expect(paths).toContain("/orders/checkout");

      // Payments
      expect(paths).toContain("/payments/checkout-link");
      expect(paths).toContain("/payments/payos-webhook");
      expect(paths).toContain("/payments/{id}/verify-cash");
      expect(paths).toContain("/payments/repay-debt");
    });

    it("should ensure every path operation has valid tags, summary, and responses", () => {
      for (const pathItem of Object.values(document.paths)) {
        const methods = ["get", "post", "put", "patch", "delete"] as const;
        for (const method of methods) {
          const operation = pathItem[method];
          if (operation) {
            expect(operation.summary).toBeDefined();
            expect(operation.summary?.length).toBeGreaterThan(0);
            expect(operation.tags).toBeDefined();
            expect(operation.tags?.length).toBeGreaterThan(0);
            expect(operation.responses).toBeDefined();

            // Ensure responses object has at least one status code
            const statusCodes = Object.keys(operation.responses);
            expect(statusCodes.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe("Automated Spec Synchronization Check", () => {
    it("should verify that backend/openapi.json exists and matches runtime document", async () => {
      const file = Bun.file("openapi.json");
      const exists = await file.exists();
      expect(exists).toBe(true);

      const savedContent = await file.text();
      const parsedSpec = JSON.parse(savedContent) as OpenAPIObject;

      expect(parsedSpec.openapi).toBe("3.1.0");
      expect(parsedSpec.info.title).toBe(document.info.title);
      expect(parsedSpec.info.version).toBe(document.info.version);
      expect(Object.keys(parsedSpec.paths).length).toBe(
        Object.keys(document.paths).length,
      );
    });
  });

  describe("HTTP Documentation Endpoints", () => {
    it("should serve OpenAPI JSON specification at /openapi.json", async () => {
      const res = await request(getHttpServer()).get("/openapi.json");
      expect(res.status).toBe(200);
      expect(res.header["content-type"]).toContain("application/json");

      const body = res.body as OpenAPIObject;
      expect(body.openapi).toBe("3.1.0");
      expect(body.info.title).toBe("Hyundai E-Commerce API");
    });

    it("should serve interactive Scalar API documentation at /api/docs", async () => {
      const res = await request(getHttpServer()).get("/api/docs");
      expect(res.status).toBe(200);
      expect(res.text).toContain("scalar");
    });
  });
});
