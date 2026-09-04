import "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { initSentry } from "./common/services/sentry.service";
import { setupOpenApiAndScalar } from "./common/config/openapi.config";
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

  // Generate OpenAPI schema and serve interactive Scalar API documentation at /api/docs.
  setupOpenApiAndScalar(app);

  await app.listen(process.env["PORT"] ?? 3000);
}

void bootstrap();
