import { getSharedConfig } from "../config";

import type { ApiResponse } from "@nhatnang/shared";

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(
    `${getSharedConfig().nextPublicAppUrl}${endpoint}`,
    options,
  );

  if (!res.ok) {
    // Ném lỗi tập trung, sau này có thể gắn Sentry/LogRocket vào đây
    throw new Error(
      `API Error at ${endpoint}: ${res.status} ${res.statusText}`,
    );
  }

  const result = (await res.json()) as ApiResponse<T>;
  return result.data;
}
