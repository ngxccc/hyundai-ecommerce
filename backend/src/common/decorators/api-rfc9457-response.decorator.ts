import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import {
  InvalidParamDto,
  Rfc9457ErrorResponseDto,
} from "@/common/dto/rfc9457-error-response.dto";

export interface ApiRfc9457ResponseOptions {
  status: number;
  description: string;
  title: string;
  detail: string;
  typeSlug?: string;
  invalidParams?: { name: string; reason: string }[];
}

export function ApiRfc9457Response(options: ApiRfc9457ResponseOptions) {
  const {
    status,
    description,
    title,
    detail,
    typeSlug = title.toLowerCase().replace(/\s+/g, "-"),
    invalidParams = [],
  } = options;

  return applyDecorators(
    ApiExtraModels(Rfc9457ErrorResponseDto, InvalidParamDto),
    ApiResponse({
      status,
      description,
      content: {
        "application/problem+json": {
          schema: {
            $ref: getSchemaPath(Rfc9457ErrorResponseDto),
          },
          example: {
            type: `http://localhost:3000/errors/${typeSlug}`,
            title,
            status,
            detail,
            instance: "/api/example",
            invalidParams,
            timestamp: "2026-07-25T02:45:00.000Z",
          },
        },
      },
    }),
  );
}

export function ApiBadRequestResponseRfc9457(options?: {
  detail?: string;
  invalidParams?: { name: string; reason: string }[];
}) {
  return ApiRfc9457Response({
    status: HttpStatus.BAD_REQUEST,
    description: "Validation failure (Bad Request)",
    title: "Bad Request",
    detail: options?.detail ?? "Submitted data format is invalid",
    invalidParams: options?.invalidParams ?? [
      { name: "email", reason: "Invalid email address format" },
    ],
  });
}

export function ApiUnauthorizedResponseRfc9457(options?: { detail?: string }) {
  return ApiRfc9457Response({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required or invalid token (Unauthorized)",
    title: "Unauthorized",
    detail: options?.detail ?? "Unauthorized access",
  });
}

export function ApiForbiddenResponseRfc9457(options?: { detail?: string }) {
  return ApiRfc9457Response({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden access (Forbidden)",
    title: "Forbidden",
    detail: options?.detail ?? "Account suspended or inactive",
  });
}

export function ApiNotFoundResponseRfc9457(options?: { detail?: string }) {
  return ApiRfc9457Response({
    status: HttpStatus.NOT_FOUND,
    description: "Resource not found (Not Found)",
    title: "Not Found",
    detail: options?.detail ?? "User profile not found",
  });
}

export function ApiTooManyRequestsResponseRfc9457(options?: {
  detail?: string;
}) {
  return ApiRfc9457Response({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: "Rate limit exceeded (Too Many Requests)",
    title: "Too Many Requests",
    detail: options?.detail ?? "Rate limit exceeded. Please try again later.",
  });
}

export function ApiConflictResponseRfc9457(options?: { detail?: string }) {
  return ApiRfc9457Response({
    status: HttpStatus.CONFLICT,
    description: "Resource conflict (Conflict)",
    title: "Conflict",
    detail: options?.detail ?? "Email address already exists",
  });
}
export function ApiInternalServerErrorResponseRfc9457() {
  return ApiRfc9457Response({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error",
    title: "Internal Server Error",
    detail: "An internal server error occurred. Please try again later.",
  });
}
