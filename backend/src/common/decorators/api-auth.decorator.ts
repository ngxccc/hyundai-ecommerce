import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import type { UserRole } from "@/database/schemas/enums.schema";
import { Roles } from "./roles.decorator";
import {
  ApiForbiddenResponseRfc9457,
  ApiUnauthorizedResponseRfc9457,
} from "./api-rfc9457-response.decorator";

/**
 * Composite authentication and authorization decorator.
 *
 * Encapsulates role-based access control and OpenAPI security documentation:
 * - When roles are provided: applies @Roles(...roles), @ApiBearerAuth(), @ApiUnauthorizedResponseRfc9457(), and @ApiForbiddenResponseRfc9457().
 * - When roles are omitted: applies @ApiBearerAuth(), @ApiUnauthorizedResponseRfc9457(), and @ApiForbiddenResponseRfc9457().
 *   (Crucially avoids setting empty @Roles() metadata to prevent accidental access blocking on authenticated-only routes).
 *
 * @param roles - Optional role restrictions (e.g. "ADMIN", "SALES").
 */
export function ApiAuth(...roles: UserRole[]) {
  if (roles.length > 0) {
    return applyDecorators(
      Roles(...roles),
      ApiBearerAuth(),
      ApiUnauthorizedResponseRfc9457(),
      ApiForbiddenResponseRfc9457(),
    );
  }

  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponseRfc9457(),
    ApiForbiddenResponseRfc9457(),
  );
}
