import { beforeEach, describe, expect, it } from "bun:test";
import { checkRateLimitWithQueue, _resetRateLimitStore } from "./rate-limiter";

describe("rate-limiter", () => {
  beforeEach(() => {
    _resetRateLimitStore();
  });

  it("allows requests under the limit", async () => {
    const res1 = await checkRateLimitWithQueue("test-ip", 2, "60 s");
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = await checkRateLimitWithQueue("test-ip", 2, "60 s");
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("blocks requests over the limit", async () => {
    await checkRateLimitWithQueue("test-ip", 2, "60 s");
    await checkRateLimitWithQueue("test-ip", 2, "60 s");

    const res3 = await checkRateLimitWithQueue("test-ip", 2, "60 s");
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.resetAt).toBeGreaterThan(Date.now());
  });

  it("isolates rate limits by key", async () => {
    await checkRateLimitWithQueue("ip-1", 1, "60 s");
    const blocked1 = await checkRateLimitWithQueue("ip-1", 1, "60 s");
    expect(blocked1.success).toBe(false);

    const allowed2 = await checkRateLimitWithQueue("ip-2", 1, "60 s");
    expect(allowed2.success).toBe(true);
  });
});
