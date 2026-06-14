import type { TSystemErrorCode } from "../constants";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; code: TSystemErrorCode | string; error?: string; fieldErrors?: Record<string, string[]> };
