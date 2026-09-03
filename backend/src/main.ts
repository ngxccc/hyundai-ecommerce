import "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { initSentry } from "./common/services/sentry.service";
import { AppModule } from "./app.module";

// Initialize Sentry SDK before NestJS bootstrap to capture startup crashes and enable tracing instrumentation.
initSentry();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Trust reverse proxy headers (e.g. X-Forwarded-For from Cloudflare/Nginx) so throttler correctly identifies client IPs behind WAF/CDN.
  app.set("trust proxy", 1);

  // Enable shutdown hooks explicitly so NestJS can trigger onApplicationShutdown across Sentry and background workers.
  app.enableShutdownHooks();

  // Generate OpenAPI schema for automatic documentation, testing via Apidog/MCP, and SDK generation.
  const config = new DocumentBuilder()
    .setTitle("Ticket Booking API")
    .setDescription(
      "High-concurrency movie ticket booking platform with seat locking, conflict detection, and payment integrations.",
    )
    .setVersion("1.0.0")
    .setOpenAPIVersion("3.1.0")
    .addTag("auth", "Authentication, session management, and password recovery")
    .addTag("users", "User profile retrieval and management")
    .addTag(
      "movies",
      "Public movie catalog discovery, details, and localization",
    )
    .addTag(
      "cinemas",
      "Cinema complexes, screening halls, and locations exploration",
    )
    .addTag(
      "shows",
      "Movie showtime scheduling, discovery, and seat pre-allocation",
    )
    .addTag(
      "bookings",
      "Seat reservation, Redlock concurrency, and booking lifecycle",
    )
    .addTag("payments", "Payment gateway webhook processing and verification")
    .addTag("app", "System health and operational monitoring")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Expose the raw JSON specification so external tools (e.g. Apidog Auto-Import, Postman) can fetch it.
  app.use("/api-json", (_req: Request, res: Response) => {
    res.json(document);
  });

  // Serve a modern, interactive Scalar API Reference UI instead of the traditional Swagger UI.
  app.use(
    "/reference",
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(process.env["PORT"] ?? 3000);
}
void bootstrap();
