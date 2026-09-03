import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import {
  SentryService,
  initSentry,
  formatReleaseSignature,
  sampleTraceTransaction,
  isSensitiveKey,
  sanitizeSensitiveData,
  shouldDropBreadcrumb,
} from "./sentry.service";
import * as Sentry from "@sentry/nestjs";
import type { Scope } from "@sentry/nestjs";
import { env } from "@/env";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";

describe("SentryService", () => {
  let service: SentryService;

  beforeEach(() => {
    service = new SentryService();
  });

  describe("isSensitiveKey", () => {
    it("should return true when key matches compound variants of password", () => {
      expect(isSensitiveKey("password")).toBe(true);
      expect(isSensitiveKey("user_password")).toBe(true);
      expect(isSensitiveKey("newPassword")).toBe(true);
      expect(isSensitiveKey("confirm_password")).toBe(true);
      expect(isSensitiveKey("user_pwd")).toBe(true);
      expect(isSensitiveKey("passphrase")).toBe(true);
    });

    it("should return true when key matches compound variants of secrets or tokens", () => {
      expect(isSensitiveKey("jwt_secret")).toBe(true);
      expect(isSensitiveKey("stripe_secret_key")).toBe(true);
      expect(isSensitiveKey("accessToken")).toBe(true);
      expect(isSensitiveKey("refresh_token")).toBe(true);
      expect(isSensitiveKey("bearerToken")).toBe(true);
      expect(isSensitiveKey("verification_token")).toBe(true);
      expect(isSensitiveKey("tokens")).toBe(true);
    });

    it("should return true when key matches api keys, checksums, cookies, or payment cards", () => {
      expect(isSensitiveKey("apiKey")).toBe(true);
      expect(isSensitiveKey("PAYOS_API_KEY")).toBe(true);
      expect(isSensitiveKey("PAYOS_CHECKSUM_KEY")).toBe(true);
      expect(isSensitiveKey("authorization")).toBe(true);
      expect(isSensitiveKey("cookie")).toBe(true);
      expect(isSensitiveKey("set-cookie")).toBe(true);
      expect(isSensitiveKey("session_id")).toBe(true);
      expect(isSensitiveKey("credit_card_number")).toBe(true);
      expect(isSensitiveKey("cvv")).toBe(true);
    });

    it("should return false when key is a safe public field", () => {
      expect(isSensitiveKey("id")).toBe(false);
      expect(isSensitiveKey("email")).toBe(false);
      expect(isSensitiveKey("name")).toBe(false);
      expect(isSensitiveKey("amount")).toBe(false);
      expect(isSensitiveKey("status")).toBe(false);
      expect(isSensitiveKey("showTime")).toBe(false);
    });

    it("should match custom patterns when extra regex patterns are provided", () => {
      const customPattern = [/tax_id/i, /national_id/i];
      expect(isSensitiveKey("user_tax_id", customPattern)).toBe(true);
      expect(isSensitiveKey("national_id", customPattern)).toBe(true);
      expect(isSensitiveKey("user_tax_id")).toBe(false);
    });
  });

  describe("sanitizeSensitiveData", () => {
    it("should redact sensitive fields when payload contains nested objects and arrays", () => {
      const payload = {
        user: {
          id: "u_1",
          user_password: "super-secret-password",
          sessions: [
            { type: "bearer", accessToken: "jwt.token.123" },
            { type: "refresh", refreshToken: "jwt.refresh.456" },
          ],
        },
        payment: {
          PAYOS_CHECKSUM_KEY: "secret-checksum-key",
          amount: 50000,
        },
      };

      const sanitized = sanitizeSensitiveData(payload);

      expect(sanitized.user.id).toBe("u_1");
      expect(sanitized.user.user_password).toBe("[REDACTED]");
      expect(sanitized.user.sessions[0]?.accessToken).toBe("[REDACTED]");
      expect(sanitized.user.sessions[1]?.refreshToken).toBe("[REDACTED]");
      expect(sanitized.payment.PAYOS_CHECKSUM_KEY).toBe("[REDACTED]");
      expect(sanitized.payment.amount).toBe(50000);
    });

    it("should break circular references safely without call stack overflow when cyclic objects are passed", () => {
      const parent: Record<string, unknown> = {
        name: "Parent",
        password: "secret",
      };
      const child: Record<string, unknown> = {
        name: "Child",
        parent,
      };
      parent["child"] = child;

      const sanitized = sanitizeSensitiveData(parent);

      expect(sanitized["name"]).toBe("Parent");
      expect(sanitized["password"]).toBe("[REDACTED]");
      expect((sanitized["child"] as Record<string, unknown>)["name"]).toBe(
        "Child",
      );
      expect((sanitized["child"] as Record<string, unknown>)["parent"]).toBe(
        "[CIRCULAR_REFERENCE]",
      );
    });

    it("should return primitive values untouched when input is not an object", () => {
      expect(sanitizeSensitiveData("plain-text")).toBe("plain-text");
      expect(sanitizeSensitiveData(123)).toBe(123);
      expect(sanitizeSensitiveData(null)).toBeNull();
      const input: unknown = undefined;
      const result = sanitizeSensitiveData(input);
      expect(result).toBeUndefined();
    });
  });

  describe("shouldDropBreadcrumb", () => {
    it("should return true when category is db.query and message is begin or commit", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: "begin",
        }),
      ).toBe(true);
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: "commit",
        }),
      ).toBe(true);
    });

    it("should return true when category is db.query and message is outbox background polling", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message:
            'select "id", "event_type", "payload", "attempts" from "outbox_events" where "outbox_events"."status" = $1 limit $2 for update skip locked',
        }),
      ).toBe(true);
    });

    it("should return true when category is db.query and message is token cleanup cron query", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message:
            'delete from "refresh_tokens" where "refresh_tokens"."expires_at" < $1',
        }),
      ).toBe(true);
    });

    it("should return false when category is db.query and message is an authentication refresh_tokens query", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message:
            'delete from "refresh_tokens" where "refresh_tokens"."token_hash" = $1 returning "id"',
        }),
      ).toBe(false);
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message:
            'delete from "refresh_tokens" where "refresh_tokens"."user_id" = $1',
        }),
      ).toBe(false);
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message:
            'insert into "refresh_tokens" ("user_id", "token_hash") values ($1, $2)',
        }),
      ).toBe(false);
    });

    it("should return false when category is db.query and message is a business domain query", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
          message: 'select "id", "email" from "users" where "id" = $1',
        }),
      ).toBe(false);
    });
    it("should return false when category is not db.query", () => {
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.HTTP,
          message: "GET /api/shows 200",
        }),
      ).toBe(false);
      expect(
        shouldDropBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
          message: "Acquired lock on shows:123",
        }),
      ).toBe(false);
    });
  });

  describe("initSentry", () => {
    it("should safely no-op when SENTRY_DSN is absent", () => {
      const originalDsn = env.SENTRY_DSN;
      (env as { SENTRY_DSN?: string }).SENTRY_DSN = undefined;

      const initSpy = spyOn(Sentry, "init").mockImplementation(() => undefined);

      initSentry();

      expect(initSpy).not.toHaveBeenCalled();
      (env as { SENTRY_DSN?: string }).SENTRY_DSN = originalDsn;
    });

    it("should initialize Sentry SDK with options, beforeSend, and beforeBreadcrumb when DSN is present", () => {
      const originalDsn = env.SENTRY_DSN;
      (env as { SENTRY_DSN?: string }).SENTRY_DSN = "https://key@sentry.io/123";

      let capturedOptions: Parameters<typeof Sentry.init>[0] | undefined;
      const initSpy = spyOn(Sentry, "init").mockImplementation((options) => {
        capturedOptions = options;
        return undefined;
      });

      initSentry();

      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions?.dsn).toBe("https://key@sentry.io/123");
      expect(capturedOptions?.maxBreadcrumbs).toBe(50);
      expect(capturedOptions?.normalizeDepth).toBe(5);

      if (capturedOptions?.tracesSampler) {
        const rate = capturedOptions.tracesSampler({
          name: "GET /health",
        } as Parameters<NonNullable<typeof capturedOptions.tracesSampler>>[0]);
        expect(rate).toBe(0.0);
      }

      if (capturedOptions?.beforeSend) {
        const mockEvent = {
          request: {
            headers: { authorization: "Bearer secret-token" },
            data: { password: "user-password", amount: 100 },
          },
          extra: { apiKey: "stripe-secret-key" },
        };
        const processedEvent = capturedOptions.beforeSend(
          mockEvent as unknown as Parameters<
            NonNullable<typeof capturedOptions.beforeSend>
          >[0],
          {},
        ) as Sentry.ErrorEvent | null;
        expect(processedEvent?.request?.headers?.["authorization"]).toBe(
          "[REDACTED]",
        );
        expect(
          (processedEvent?.request?.data as Record<string, unknown>)[
            "password"
          ],
        ).toBe("[REDACTED]");
        expect(processedEvent?.extra?.["apiKey"]).toBe("[REDACTED]");
      }

      if (capturedOptions?.beforeBreadcrumb) {
        const mockBreadcrumb = {
          category: "auth",
          data: { token: "secret-token", safe: "value" },
        };
        const processedBreadcrumb = capturedOptions.beforeBreadcrumb(
          mockBreadcrumb,
          {},
        );
        expect(processedBreadcrumb?.data?.["token"]).toBe("[REDACTED]");
        expect(processedBreadcrumb?.data?.["safe"]).toBe("value");

        const droppedBreadcrumb = capturedOptions.beforeBreadcrumb(
          {
            category: SENTRY_BREADCRUMB_CATEGORY.DB_QUERY,
            message: "begin",
          },
          {},
        );
        expect(droppedBreadcrumb).toBeNull();
      }

      (env as { SENTRY_DSN?: string }).SENTRY_DSN = originalDsn;
    });
  });

  describe("formatReleaseSignature", () => {
    it("should format release tag with fallback when commit sha is absent", () => {
      const release = formatReleaseSignature();
      expect(release).toBeDefined();
      expect(typeof release).toBe("string");
      expect(release).toContain("@");
      expect(release).toContain("+");
    });
  });

  describe("sampleTraceTransaction", () => {
    it("should drop 100% of traces when transaction belongs to health or metrics endpoints", () => {
      expect(sampleTraceTransaction("GET /health")).toBe(0.0);
      expect(sampleTraceTransaction("GET /metrics")).toBe(0.0);
      expect(sampleTraceTransaction("GET /")).toBe(0.0);
      expect(sampleTraceTransaction("GET /reference")).toBe(0.0);
      expect(sampleTraceTransaction("GET /api-json")).toBe(0.0);
    });

    it("should return configured sample rate when transaction is a business route", () => {
      expect(sampleTraceTransaction("POST /bookings/reserve", 1.0)).toBe(1.0);
      expect(sampleTraceTransaction("POST /auth/login", 0.5)).toBe(0.5);
    });
  });

  describe("onModuleInit", () => {
    it("should invoke initSentry on module initialization", () => {
      const originalDsn = env.SENTRY_DSN;
      (env as { SENTRY_DSN?: string }).SENTRY_DSN = undefined;

      expect(() => {
        service.onModuleInit();
      }).not.toThrow();

      (env as { SENTRY_DSN?: string }).SENTRY_DSN = originalDsn;
    });
  });

  describe("onApplicationShutdown and flush", () => {
    it("should call Sentry.flush with 2000ms ceiling when application is shutting down", async () => {
      spyOn(service, "isEnabled").mockReturnValue(true);
      const flushSpy = spyOn(Sentry, "flush").mockResolvedValue(true);

      await service.onApplicationShutdown();

      expect(flushSpy).toHaveBeenCalledWith(2000);
    });

    it("should return true immediately when Sentry is disabled", async () => {
      spyOn(service, "isEnabled").mockReturnValue(false);

      const result = await service.flush(2000);
      expect(result).toBe(true);
    });
  });

  describe("isEnabled", () => {
    it("should return boolean status indicating whether Sentry is enabled", () => {
      const result = service.isEnabled();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("captureException", () => {
    it("should safely return undefined when Sentry is disabled", () => {
      const isEnabledSpy = spyOn(service, "isEnabled").mockReturnValue(false);

      const result = service.captureException(new Error("Test Error"));
      expect(result).toBeUndefined();
      expect(isEnabledSpy).toHaveBeenCalledTimes(1);
    });

    it("should dispatch exception to Sentry with isolated scope when enabled", () => {
      spyOn(service, "isEnabled").mockReturnValue(true);

      const mockScope = {
        setTag: mock((_k: string, _v: string) => undefined),
        setExtra: mock((_k: string, _v: unknown) => undefined),
        setUser: mock((_u: unknown) => undefined),
      };

      const withScopeSpy = spyOn(Sentry, "withScope").mockImplementation(((
        callback: (scope: Scope) => string | undefined,
      ) => callback(mockScope as unknown as Scope)) as typeof Sentry.withScope);
      const captureExceptionSpy = spyOn(
        Sentry,
        "captureException",
      ).mockReturnValue("event-id-123");

      const error = new Error("DB Crash");
      const eventId = service.captureException(error, {
        tags: { statusCode: "500", method: "GET" },
        extra: { url: "/test", ip: "127.0.0.1" },
        user: { id: "user-1", email: "user@test.com", role: "admin" },
      });

      expect(eventId).toBe("event-id-123");
      expect(withScopeSpy).toHaveBeenCalledTimes(1);
      expect(mockScope.setTag).toHaveBeenCalledWith("statusCode", "500");
      expect(mockScope.setTag).toHaveBeenCalledWith("method", "GET");
      expect(mockScope.setExtra).toHaveBeenCalledWith("url", "/test");
      expect(mockScope.setExtra).toHaveBeenCalledWith("ip", "127.0.0.1");
      expect(mockScope.setUser).toHaveBeenCalledWith({
        id: "user-1",
        email: "user@test.com",
        role: "admin",
      });
      expect(captureExceptionSpy).toHaveBeenCalledWith(error);
    });

    it("should capture exception without optional context fields when not provided", () => {
      spyOn(service, "isEnabled").mockReturnValue(true);

      const mockScope = {
        setTag: mock((_k: string, _v: string) => undefined),
        setExtra: mock((_k: string, _v: unknown) => undefined),
        setUser: mock((_u: unknown) => undefined),
      };

      spyOn(Sentry, "withScope").mockImplementation(((
        callback: (scope: Scope) => string | undefined,
      ) => callback(mockScope as unknown as Scope)) as typeof Sentry.withScope);
      const captureExceptionSpy = spyOn(
        Sentry,
        "captureException",
      ).mockReturnValue("event-id-bare");

      const error = new Error("Bare Error");
      const eventId = service.captureException(error);

      expect(eventId).toBe("event-id-bare");
      expect(captureExceptionSpy).toHaveBeenCalledWith(error);
      expect(mockScope.setTag).not.toHaveBeenCalled();
      expect(mockScope.setExtra).not.toHaveBeenCalled();
      expect(mockScope.setUser).not.toHaveBeenCalled();
    });
  });

  describe("addBreadcrumb", () => {
    it("should safely no-op when Sentry is disabled", () => {
      spyOn(service, "isEnabled").mockReturnValue(false);

      expect(() => {
        service.addBreadcrumb({
          category: "http",
          message: "GET /api/shows",
        });
      }).not.toThrow();
    });

    it("should call Sentry.addBreadcrumb with formatted payload when enabled", () => {
      spyOn(service, "isEnabled").mockReturnValue(true);

      const addBreadcrumbSpy = spyOn(
        Sentry,
        "addBreadcrumb",
      ).mockImplementation(() => undefined);

      service.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
        message: "Acquiring lock",
        level: "info",
        data: { resource: "seat-1", token: "secret" },
      });

      expect(addBreadcrumbSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: SENTRY_BREADCRUMB_CATEGORY.REDLOCK,
          message: "Acquiring lock",
          level: "info",
          data: { resource: "seat-1", token: "[REDACTED]" },
        }),
      );
    });

    it("should call Sentry.addBreadcrumb with default level and undefined data when omitted", () => {
      spyOn(service, "isEnabled").mockReturnValue(true);

      const addBreadcrumbSpy = spyOn(
        Sentry,
        "addBreadcrumb",
      ).mockImplementation(() => undefined);

      service.addBreadcrumb({
        category: "navigation",
        message: "Page changed",
      });

      expect(addBreadcrumbSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "navigation",
          message: "Page changed",
          level: "info",
          data: undefined,
        }),
      );
    });
  });

  describe("setUser and setTag", () => {
    it("should call Sentry.setUser with user payload when enabled", () => {
      spyOn(SentryService.prototype, "isEnabled").mockReturnValue(true);

      const setUserSpy = spyOn(Sentry, "setUser").mockImplementation(
        () => undefined,
      );

      service.setUser({ id: "user-99", email: "alex@example.com" });
      expect(setUserSpy).toHaveBeenCalledWith({
        id: "user-99",
        email: "alex@example.com",
      });
    });

    it("should safely no-op for setUser when Sentry is disabled", () => {
      spyOn(SentryService.prototype, "isEnabled").mockReturnValue(false);

      const setUserSpy = spyOn(Sentry, "setUser").mockImplementation(
        () => undefined,
      );
      setUserSpy.mockClear();

      service.setUser({ id: "user-99", email: "alex@example.com" });
      expect(setUserSpy).not.toHaveBeenCalled();
    });

    it("should call Sentry.setTag with key and value when enabled", () => {
      spyOn(SentryService.prototype, "isEnabled").mockReturnValue(true);

      const setTagSpy = spyOn(Sentry, "setTag").mockImplementation(
        () => undefined,
      );

      service.setTag("requestId", "req-123");
      expect(setTagSpy).toHaveBeenCalledWith("requestId", "req-123");
    });

    it("should safely no-op for setTag when Sentry is disabled", () => {
      spyOn(SentryService.prototype, "isEnabled").mockReturnValue(false);

      const setTagSpy = spyOn(Sentry, "setTag").mockImplementation(
        () => undefined,
      );
      setTagSpy.mockClear();

      service.setTag("requestId", "req-123");
      expect(setTagSpy).not.toHaveBeenCalled();
    });
  });
});
