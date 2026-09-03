import { describe, beforeEach, it, expect, spyOn, mock } from "bun:test";
import { CustomThrottlerGuard } from "./throttler.guard";
import type { ExecutionContext } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import type {
  ThrottlerModuleOptions,
  ThrottlerStorage,
  ThrottlerLimitDetail,
} from "@nestjs/throttler";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Reflector } from "@nestjs/core";
import { ERROR_MESSAGES } from "@/common/constants/error.constant";
import { env } from "@/env";
import { I18nContext, type I18nService } from "nestjs-i18n";

class TestCustomThrottlerGuard extends CustomThrottlerGuard {
  public override throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    return super.throwThrottlingException(context, throttlerLimitDetail);
  }
}

describe("CustomThrottlerGuard", () => {
  let guard: TestCustomThrottlerGuard;

  beforeEach(() => {
    guard = new TestCustomThrottlerGuard(
      {} as ThrottlerModuleOptions,
      {} as ThrottlerStorage,
      new Reflector(),
    );
  });

  describe("when evaluating rate limit protection in canActivate", () => {
    it("should allow request immediately in non-production environments", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "development";

      const mockContext = {} as ExecutionContext;
      const canActivate = await guard.canActivate(mockContext);

      expect(canActivate).toBe(true);

      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should execute rate limit check and return true in production environment when allowed", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "production";

      const superCanActivateSpy = spyOn(
        ThrottlerGuard.prototype,
        "canActivate",
      ).mockResolvedValue(true);

      const mockContext = {} as ExecutionContext;
      const canActivate = await guard.canActivate(mockContext);

      expect(canActivate).toBe(true);
      superCanActivateSpy.mockRestore();

      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should re-throw HttpException when rate limit is exceeded in production", () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "production";

      const superCanActivateSpy = spyOn(
        ThrottlerGuard.prototype,
        "canActivate",
      ).mockRejectedValue(
        new HttpException("Too Many Requests", HttpStatus.TOO_MANY_REQUESTS),
      );

      const mockContext = {} as ExecutionContext;

      expect(guard.canActivate(mockContext)).rejects.toThrow(HttpException);
      superCanActivateSpy.mockRestore();

      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should fail-open and return true when Redis storage throws unexpected error in production", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "production";

      const superCanActivateSpy = spyOn(
        ThrottlerGuard.prototype,
        "canActivate",
      ).mockRejectedValue(new Error("Redis connection dropped"));

      const mockContext = {} as ExecutionContext;
      const canActivate = await guard.canActivate(mockContext);

      expect(canActivate).toBe(true);
      superCanActivateSpy.mockRestore();

      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it("should fail-open and return true when rate limit check times out after 2 seconds in production", async () => {
      const originalEnv = env.NODE_ENV;
      (env as { NODE_ENV: string }).NODE_ENV = "production";

      const originalSetTimeout = globalThis.setTimeout;
      const setTimeoutMock = mock((cb: () => void) => {
        cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });
      globalThis.setTimeout = setTimeoutMock as unknown as typeof setTimeout;

      const superCanActivateSpy = spyOn(
        ThrottlerGuard.prototype,
        "canActivate",
      ).mockImplementation(() => new Promise<boolean>(() => undefined));

      try {
        const mockContext = {} as ExecutionContext;
        const canActivate = await guard.canActivate(mockContext);
        expect(canActivate).toBe(true);
        expect(setTimeoutMock).toHaveBeenCalled();
      } finally {
        (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
        globalThis.setTimeout = originalSetTimeout;
        superCanActivateSpy.mockRestore();
      }
    });
  });

  describe("when throwing throttling exceptions", () => {
    it("should throw HttpException with status 429 and default fallback message when i18n context is missing", () => {
      const mockContext = {} as ExecutionContext;
      const mockLimitDetail = {
        limit: 5,
        ttl: 60000,
        key: "test-key",
        tracker: "ip",
        throttlerName: "auth",
        totalHits: 6,
        timeToExpire: 59,
        isBlocked: true,
        timeToBlockExpire: 60,
      };

      expect(() =>
        guard.throwThrottlingException(mockContext, mockLimitDetail),
      ).toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: "Too many requests. Please try again later",
            error: ERROR_MESSAGES.TOO_MANY_REQUESTS,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    });

    it("should throw HttpException with status 429 and translated message when i18n context is available", () => {
      const mockI18nService = {
        t: mock(() => "Quá nhiều yêu cầu. Vui lòng thử lại sau"),
      } as unknown as I18nService;

      const mockI18nContext = {
        service: mockI18nService,
        lang: "vi",
      } as unknown as I18nContext;

      const i18nSpy = spyOn(I18nContext, "current").mockReturnValue(
        mockI18nContext,
      );

      const mockContext = {} as ExecutionContext;
      const mockLimitDetail = {
        limit: 5,
        ttl: 60000,
        key: "test-key",
        tracker: "ip",
        throttlerName: "auth",
        totalHits: 6,
        timeToExpire: 59,
        isBlocked: true,
        timeToBlockExpire: 60,
      };

      expect(() =>
        guard.throwThrottlingException(mockContext, mockLimitDetail),
      ).toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: "Quá nhiều yêu cầu. Vui lòng thử lại sau",
            error: ERROR_MESSAGES.TOO_MANY_REQUESTS,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );

      i18nSpy.mockRestore();
    });
  });
});
