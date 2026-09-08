import {
  RequestMethod,
  VersioningType,
  type INestApplication,
} from "@nestjs/common";

export const GLOBAL_API_PREFIX = "api";

export const GLOBAL_PREFIX_EXCLUSIONS = [
  { path: "/", method: RequestMethod.GET },
  { path: "openapi.json", method: RequestMethod.GET },
  { path: "api/docs", method: RequestMethod.GET },
] as const;

/**
 * Enforces the standardized global API prefix /api and native URI versioning across all NestJS application controllers
 * while excluding essential system endpoints (root healthcheck, OpenAPI schema, Scalar documentation).
 *
 * @param app - Initialized NestJS application instance
 */
export function setupGlobalPrefix(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_API_PREFIX, {
    exclude: [...GLOBAL_PREFIX_EXCLUSIONS],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
}
