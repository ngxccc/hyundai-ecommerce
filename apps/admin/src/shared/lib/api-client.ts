import { siteConfig } from "@/shared/config/site";
import type { ApiResponse } from "@/shared/types/common";

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${siteConfig.url}${endpoint}`, options);

  if (!res.ok) {
    // Ném lỗi tập trung, sau này có thể gắn Sentry/LogRocket vào đây
    throw new Error(
      `API Error at ${endpoint}: ${res.status} ${res.statusText}`,
    );
  }

  const result = (await res.json()) as ApiResponse<T>;
  return result.data;
}
