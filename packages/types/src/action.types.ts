import type { TSystemErrorCode } from "@nhatnang/shared/constants";

export type TActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; code: TSystemErrorCode | string; error?: string; fieldErrors?: Record<string, string[]> };
