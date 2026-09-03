import { HTTP_STATUS, HTTP_STATUS_TITLES } from "../constants/http";

/**
 * Standard successful API response envelope conforming to repository standards and RFC patterns.
 * Supports optional root-level metadata (e.g., pagination).
 */
export interface ApiResponse<T, M = unknown> {
  success: true;
  data: T;
  meta?: M;
}

/**
 * Standard RFC 9457 Invalid Parameter descriptor for validation errors.
 */
export interface InvalidParam {
  name: string;
  reason: string;
}

/**
 * RFC 9457 Problem Details specification for HTTP APIs.
 * Content-Type: application/problem+json
 */
export interface Rfc9457ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: InvalidParam[];
  timestamp: string;
}

/**
 * Creates a standardized successful API response envelope.
 *
 * @param data The primary payload data
 * @param meta Optional root-level pagination or envelope metadata
 */
export function apiSuccess<T, M = unknown>(
  data: T,
  meta?: M,
): ApiResponse<T, M> {
  return {
    success: true,
    data,
    ...(meta !== undefined ? { meta } : {}),
  };
}

/**
 * Creates an RFC 9457 Problem Details object for standardized API error responses.
 */
export function rfc9457ProblemDetails(options: {
  status: number;
  title?: string;
  detail: string;
  instance: string;
  type?: string;
  invalidParams?: InvalidParam[];
}): Rfc9457ProblemDetails {
  const status = options.status;
  const title = options.title ?? HTTP_STATUS_TITLES[status] ?? "Error";
  const type =
    options.type ?? `https://api.hyundai-ecommerce.com/errors/${status}`;

  return {
    type,
    title,
    status,
    detail: options.detail,
    instance: options.instance,
    ...(options.invalidParams && options.invalidParams.length > 0
      ? { invalidParams: options.invalidParams }
      : {}),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a standard JSON Response envelope for Route Handlers.
 * Injects backward-compatible `status: true` alongside standard `success: true`.
 */
export function jsonSuccess<T, M = unknown>(
  data: T,
  meta?: M,
  init?: ResponseInit,
): Response {
  const isPlainObject =
    typeof data === "object" && data !== null && !Array.isArray(data);

  return Response.json(
    {
      ...(isPlainObject ? data : {}),
      ...apiSuccess(data, meta),
      status: true,
    },
    {
      status: HTTP_STATUS.OK,
      ...init,
    },
  );
}

/**
 * Creates a standard RFC 9457 Problem Details Response for Route Handlers.
 * Automatically injects `Content-Type: application/problem+json` and backward-compatible `status: false`.
 */
export function jsonError(
  options: {
    status: number;
    detail: string;
    instance: string;
    title?: string;
    type?: string;
    invalidParams?: InvalidParam[];
    fallbackData?: unknown;
  },
  init?: ResponseInit,
): Response {
  const problem = rfc9457ProblemDetails(options);
  const body = {
    ...problem,
    success: false,
    status: false,
    error: options.detail,
    ...(options.fallbackData !== undefined
      ? { data: options.fallbackData }
      : {}),
  };

  return Response.json(body, {
    status: options.status,
    ...init,
    headers: {
      "Content-Type": "application/problem+json",
      ...init?.headers,
    },
  });
}
