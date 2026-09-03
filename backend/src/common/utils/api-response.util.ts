/**
 * Standard successful API response envelope adhering to repository standards.
 * Supports optional root-level metadata (e.g. pagination).
 */
export interface ApiResponse<T, M = unknown> {
  success: boolean;
  data: T;
  meta?: M;
}

/**
 * Creates a standard successful API response envelope.
 *
 * @param data The primary resource payload
 * @param meta Optional metadata (e.g. pagination info at the root envelope level)
 * @returns Standardized ApiResponse envelope
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
