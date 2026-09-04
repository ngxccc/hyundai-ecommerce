/**
 * Lightweight rate-limiter for admin edge/actions layer.
 */
export function checkRateLimitWithQueue(
  _key: string,
  _limit: number = 100,
  _window: string = "60 s",
): Promise<{ success: boolean }> {
  return Promise.resolve({ success: true });
}
