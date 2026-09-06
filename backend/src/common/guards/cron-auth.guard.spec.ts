import { describe, expect, it } from "bun:test";
import { UnauthorizedException, type ExecutionContext } from "@nestjs/common";
import { CronAuthGuard } from "./cron-auth.guard";
import { env } from "@/env";

describe("CronAuthGuard", () => {
  const guard = new CronAuthGuard();

  function createMockContext(
    headers: Record<string, string> = {},
    user?: { role: string },
  ) {
    const mockRequest = {
      headers,
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  it("should allow request when valid x-cron-secret header is present", () => {
    const secret = env.CRON_SECRET ?? "test-cron-secret-32-characters";
    const context = createMockContext({
      "x-cron-secret": secret,
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should allow request when user has ADMIN role", () => {
    const context = createMockContext({}, { role: "ADMIN" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should reject request when x-cron-secret is invalid and user is not admin", () => {
    const context = createMockContext(
      {
        "x-cron-secret": "wrong-secret",
      },
      { role: "CUSTOMER" },
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("should reject request when credentials are missing completely", () => {
    const context = createMockContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
