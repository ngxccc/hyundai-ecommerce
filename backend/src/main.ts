import "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { initSentry } from "./common/services/sentry.service";
import { setupOpenApiAndScalar } from "./common/config/openapi.config";
import { setupGlobalPrefix } from "./common/config/api-prefix.config";
import { AppModule } from "./app.module";

// Initialize Sentry SDK before NestJS bootstrap to capture startup crashes and enable tracing instrumentation.
initSentry();

async function bootstrap() {
  // Workaround for Bun module-loader race condition (Bun issue #33180 / PR #37185):
  // Static import of CJS nestjs-pino races with concurrent ESM evaluation of @nestjs/core.
  const { Logger } = await import("nestjs-pino");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Trust reverse proxy headers (e.g. X-Forwarded-For from Cloudflare/Nginx) so throttler correctly identifies client IPs behind WAF/CDN.
  app.set("trust proxy", 1);

  // Enable shutdown hooks explicitly so NestJS can trigger onApplicationShutdown across Sentry and background workers.
  app.enableShutdownHooks();

  // Enforce standardized /api/v1 global route prefix for all REST controllers.
  setupGlobalPrefix(app);

  // Generate OpenAPI schema and serve interactive Scalar API documentation at /api/docs.
  setupOpenApiAndScalar(app);

  await app.listen(process.env["PORT"] ?? 3000);
}

void bootstrap();
