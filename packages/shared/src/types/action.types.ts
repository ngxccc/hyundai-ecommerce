import type { SystemErrorCode } from "../constants";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; code: SystemErrorCode | string; error?: string; fieldErrors?: Record<string, string[]> };
