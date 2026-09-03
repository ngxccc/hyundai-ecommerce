import type { SentryService } from "../services/sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import { mock } from "bun:test";
import {
  describe,
  it,
  expect,
  beforeEach,
  spyOn,
  afterEach,
  type Mock,
} from "bun:test";
import { LoggingInterceptor } from "./logging.interceptor";
import {
  type ExecutionContext,
  type CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { of, throwError } from "rxjs";

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let debugSpy: Mock<(...args: unknown[]) => void>;
  let warnSpy: Mock<(...args: unknown[]) => void>;
  let errorSpy: Mock<(...args: unknown[]) => void>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    debugSpy = spyOn(
      (interceptor as unknown as { logger: { debug: () => void } }).logger,
      "debug",
    ).mockImplementation(() => undefined);
    warnSpy = spyOn(
      (interceptor as unknown as { logger: { warn: () => void } }).logger,
      "warn",
    ).mockImplementation(() => undefined);
    errorSpy = spyOn(
      (interceptor as unknown as { logger: { error: () => void } }).logger,
      "error",
    ).mockImplementation(() => undefined);
  });

  afterEach(() => {
    debugSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("when logging HTTP request lifecycle", () => {
    it("should pass request handler through without interception when context is not HTTP", (done) => {
      const mockContext = {
        getType: () => "rpc",
      } as unknown as ExecutionContext;

      const mockHandler = {
        handle: () => of("test-data"),
      } as CallHandler;

      interceptor.intercept(mockContext, mockHandler).subscribe({
        next: (val: unknown) => {
          expect(val).toBe("test-data");
          done();
        },
      });
    });

    it("should log message at debug level when response status is 2xx success", (done) => {
      const mockRequest = { method: "GET", originalUrl: "/api/test" };
      const mockResponse = { statusCode: 200 };

      const mockContext = {
        getType: () => "http",
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const mockHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      interceptor.intercept(mockContext, mockHandler).subscribe({
        next: () => {
          expect(debugSpy).toHaveBeenCalledWith(
            expect.stringMatching(/^\[GET\] \/api\/test 200 - \d+ms$/),
          );
          done();
        },
      });
    });

    it("should log message at warn level when error is 4xx HttpException", (done) => {
      const mockRequest = { method: "POST", originalUrl: "/auth/login" };
      const mockResponse = { statusCode: 200 };

      const mockContext = {
        getType: () => "http",
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const error = new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      const mockHandler = {
        handle: () => throwError(() => error),
      } as CallHandler;

      interceptor.intercept(mockContext, mockHandler).subscribe({
        error: (err: unknown) => {
          expect(err).toBe(error);
          expect(warnSpy).toHaveBeenCalledWith(
            expect.stringMatching(
              /^\[POST\] \/auth\/login 400 - \d+ms - Error: Bad Request$/,
            ),
          );
          done();
        },
      });
    });

    it("should log message at error level when error is 5xx HttpException", (done) => {
      const mockRequest = { method: "GET", originalUrl: "/crash" };
      const mockResponse = { statusCode: 500 };

      const mockContext = {
        getType: () => "http",
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const error = new HttpException(
        "Database Failure",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      const mockHandler = {
        handle: () => throwError(() => error),
      } as CallHandler;

      interceptor.intercept(mockContext, mockHandler).subscribe({
        error: (err: unknown) => {
          expect(err).toBe(error);
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringMatching(
              /^\[GET\] \/crash 500 - \d+ms - Error: Database Failure$/,
            ),
          );
          done();
        },
      });
    });

    it("should default status code to 500 and log at error level when error is generic non-HttpException", (done) => {
      const mockRequest = { method: "DELETE", originalUrl: "/data" };
      const mockResponse = { statusCode: 200 };

      const mockContext = {
        getType: () => "http",
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const error = new Error("Unhandled runtime error");
      const mockHandler = {
        handle: () => throwError(() => error),
      } as CallHandler;

      interceptor.intercept(mockContext, mockHandler).subscribe({
        error: (err: unknown) => {
          expect(err).toBe(error);
          expect(errorSpy).toHaveBeenCalledWith(
            expect.stringMatching(
              /^\[DELETE\] \/data 500 - \d+ms - Error: Unhandled runtime error$/,
            ),
          );
          done();
        },
      });
    });
  });

  describe("when integrating with Sentry observability", () => {
    it("should record requestId tag, user identity, and HTTP breadcrumb in Sentry when SentryService is provided", (done) => {
      const setTagMock = mock(() => undefined);
      const setUserMock = mock(() => undefined);
      const addBreadcrumbMock = mock(() => undefined);
      const mockSentryService = {
        setTag: setTagMock,
        setUser: setUserMock,
        addBreadcrumb: addBreadcrumbMock,
      } as unknown as SentryService;
      const interceptorWithSentry = new LoggingInterceptor(mockSentryService);
      spyOn(
        (interceptorWithSentry as unknown as { logger: { debug: () => void } })
          .logger,
        "debug",
      ).mockImplementation(() => undefined);
      const mockRequest = {
        method: "GET",
        originalUrl: "/api/shows",
        headers: { "x-request-id": "req-999" },
        user: { id: "user-123", email: "user@test.com", role: "admin" },
      };
      const mockResponse = { statusCode: 200 };

      const mockContext = {
        getType: () => "http",
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const mockHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      interceptorWithSentry.intercept(mockContext, mockHandler).subscribe({
        next: () => {
          expect(setTagMock).toHaveBeenCalledWith("requestId", "req-999");
          expect(setUserMock).toHaveBeenCalledWith({
            id: "user-123",
            email: "user@test.com",
            role: "admin",
          });
          expect(addBreadcrumbMock).toHaveBeenCalledWith(
            expect.objectContaining({
              category: SENTRY_BREADCRUMB_CATEGORY.HTTP,
              level: "info",
            }),
          );
          done();
        },
      });
    });
  });
});
