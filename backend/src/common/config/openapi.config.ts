import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";
import type { Request, Response } from "express";
import { apiReference } from "@scalar/nestjs-api-reference";

/**
 * Builds the official OpenAPI 3.1.0 specification document for the Hyundai E-Commerce platform.
 *
 * @param app - Initialized NestJS application instance.
 * @returns Fully generated OpenAPIObject schema document.
 */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle("Hyundai E-Commerce API")
    .setDescription(
      "Hyundai E-Commerce Platform API for Commercial Vehicles, B2B Dealer Quoting, Warehouse Management, and Multi-channel Payment Processing.",
    )
    .setVersion("1.0.0")
    .setOpenAPIVersion("3.1.0")
    .addTag("auth", "Authentication, session management, and password recovery")
    .addTag(
      "users",
      "User profile, staff management, and dealer credit limit tracking",
    )
    .addTag("dealer-tiers", "B2B dealer discount tiers and spend thresholds")
    .addTag(
      "leads",
      "CRM lead intake, sales assignment, and conversion tracking",
    )
    .addTag(
      "products",
      "Commercial vehicle and generator catalog, faceted search, and specs",
    )
    .addTag("categories", "Category taxonomy, hierarchy, and navigation")
    .addTag("brands", "Brand manufacturers and partner catalogs")
    .addTag(
      "warehouses",
      "Warehouse stock levels, low-stock alerts, and multi-location inventory",
    )
    .addTag(
      "cart",
      "Shopping cart, guest cart merge, and dealer pricing calculations",
    )
    .addTag(
      "quotes",
      "B2B quote negotiation, dealer discount limits, approval workflows, and Excel generation",
    )
    .addTag(
      "orders",
      "Order checkout, guest checkout, Redlock stock locking, trade credit, and auto-expiration",
    )
    .addTag(
      "payments",
      "PayOS payment links, dynamic VietQR, webhook signature verification, cash verification, and dealer debt repayment",
    )
    .addTag("app", "System health and operational monitoring")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
      "bearer",
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
      "JWT-auth",
    )
    .build();

  return SwaggerModule.createDocument(app, config);
}

/**
 * Mounts the raw JSON specification and Scalar interactive API documentation routes onto the NestJS app.
 *
 * @param app - Initialized NestJS application instance.
 * @returns Generated OpenAPI document for downstream consumers.
 */
export function setupOpenApiAndScalar(app: INestApplication): OpenAPIObject {
  const document = createOpenApiDocument(app);

  // Expose raw JSON specification at /openapi.json for automated validation and frontend SDK generators.
  app.use("/openapi.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json(document);
  });

  // Serve modern, interactive Scalar API Reference UI at /api/docs with live testing capability.
  app.use(
    "/api/docs",
    apiReference({
      spec: {
        content: document,
      },
      theme: "saturn",
    }),
  );

  return document;
}
