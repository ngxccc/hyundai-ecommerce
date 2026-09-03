import type { SentryService } from "../services/sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import {
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
  type ArgumentsHost,
} from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { GlobalExceptionFilter } from "./global-exception.filter";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: {
    status: ReturnType<typeof mock>;
    setHeader: ReturnType<typeof mock>;
    json: ReturnType<typeof mock>;
  };
  let mockRequest: {
    protocol: string;
    get: (header: string) => string;
    url: string;
  };
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    spyOn(
      (filter as unknown as { logger: { error: () => void } }).logger,
      "error",
    ).mockImplementation(() => undefined);
    mockResponse = {} as unknown as typeof mockResponse;
    mockResponse.status = mock().mockReturnValue(mockResponse);
    mockResponse.setHeader = mock().mockReturnValue(mockResponse);
    mockResponse.json = mock().mockReturnValue(mockResponse);

    mockRequest = {
      protocol: "http",
      get: mock().mockReturnValue("localhost:3000"),
      url: "/api/test",
    };

    mockArgumentsHost = {
      getType: () => "http",
      switchToHttp: mock().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe("when handling standard HttpExceptions", () => {
    it("should format UnauthorizedException correctly according to RFC 9457", () => {
      const exception = new UnauthorizedException(
        "Mật khẩu hiện tại không chính xác",
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/problem+json",
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "http://localhost:3000/errors/unauthorized",
          title: "Unauthorized",
          status: 401,
          detail: "Mật khẩu hiện tại không chính xác",
          instance: "/api/test",
          invalidParams: [],
        }),
      );
    });

    it("should format DTO BadRequestException with invalidParams correctly", () => {
      const exception = new BadRequestException({
        detail: "Dữ liệu gửi lên không đúng định dạng",
        invalidParams: [
          {
            name: "confirmPassword",
            reason: "Mật khẩu xác nhận không trùng khớp",
          },
        ],
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/problem+json",
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "http://localhost:3000/errors/bad-request",
          title: "Bad Request",
          status: 400,
          detail: "Dữ liệu gửi lên không đúng định dạng",
          instance: "/api/test",
          invalidParams: [
            {
              name: "confirmPassword",
              reason: "Mật khẩu xác nhận không trùng khớp",
            },
          ],
        }),
      );
    });

    it("should handle legacy array ValidationError payload safely", () => {
      const exception = new BadRequestException({
        message: [
          {
            property: "email",
            constraints: { isEmail: "Email không hợp lệ" },
          },
        ],
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Bad Request",
          status: 400,
          invalidParams: [{ name: "email", reason: "Email không hợp lệ" }],
        }),
      );
    });
  });

  describe("when handling unhandled database and system errors", () => {
    it("should sanitize unhandled Error to HTTP 500 without leaking stack traces", () => {
      const exception = new Error(
        "Database query failed: SELECT * FROM secret",
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/problem+json",
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "http://localhost:3000/errors/internal-server-error",
          title: "Internal Server Error",
          status: 500,
          detail: "An internal server error occurred. Please try again later.",
          instance: "/api/test",
          invalidParams: [],
        }),
      );
    });

    it("should use I18nService to translate fallback messages when provided", () => {
      const mockI18n = {
        translate: mock().mockReturnValue(
          "An internal server error occurred. Please try again later.",
        ),
      };
      const i18nFilter = new GlobalExceptionFilter(
        mockI18n as unknown as I18nService,
      );
      spyOn(
        (i18nFilter as unknown as { logger: { error: () => void } }).logger,
        "error",
      ).mockImplementation(() => undefined);
      i18nFilter.catch(new Error("Database boom"), mockArgumentsHost);
      expect(mockI18n.translate).toHaveBeenCalledWith(
        "common.INTERNAL_SERVER_ERROR",
        { lang: undefined },
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "An internal server error occurred. Please try again later.",
        }),
      );
    });

    it("should decode raw nestjs-i18n pipe strings in invalidParams reason field", () => {
      const mockI18n = {
        translate: mock().mockImplementation(
          (key: string, options?: { args?: Record<string, unknown> }) => {
            if (key === "common.INVALID_INPUT") {
              return "Submitted data format is invalid";
            }
            if (key === "validation.minLength") {
              const prop =
                typeof options?.args?.["property"] === "string"
                  ? options.args["property"]
                  : "";
              const constraints = Array.isArray(options?.args?.["constraints"])
                ? options.args["constraints"]
                : [];
              const firstVal = String(constraints[0] ?? "");
              return `${prop} must be at least ${firstVal} characters`.trim();
            }
            return key;
          },
        ),
      };
      const i18nFilter = new GlobalExceptionFilter(
        mockI18n as unknown as I18nService,
      );
      const exception = new BadRequestException({
        detail: "common.INVALID_INPUT|{}",
        invalidParams: [
          {
            name: "password",
            reason: 'validation.minLength|{"constraints":[8]}',
          },
        ],
      });

      i18nFilter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "Submitted data format is invalid",
          invalidParams: [
            {
              name: "password",
              reason: "password must be at least 8 characters",
            },
          ],
        }),
      );
    });

    it("should map Postgres unique violation (23505) and deadlock (40P01) to HTTP 409 Conflict", () => {
      const uniqueError = {
        message: "duplicate key value violates unique constraint",
        code: "23505",
        table: "bookings",
        constraint: "bookings_order_code_uidx",
      };

      filter.catch(uniqueError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Conflict",
          status: 409,
          detail: "A resource conflict occurred. Please retry your request.",
        }),
      );
    });

    it("should map Postgres query canceled (57014) to HTTP 504 Gateway Timeout", () => {
      const timeoutError = {
        message: "canceling statement due to statement timeout",
        cause: {
          code: "57014",
        },
      };

      filter.catch(timeoutError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.GATEWAY_TIMEOUT,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Gateway Timeout",
          status: 504,
          detail: "The database or downstream service timed out. Please retry.",
        }),
      );
    });
  });

  describe("when integrating with Sentry observability", () => {
    it("should capture 5xx server exceptions in Sentry and bind eventId to RFC 9457 response", () => {
      const captureExceptionMock = mock(
        (): string | undefined => "mock-sentry-event-id",
      );
      const addBreadcrumbMock = mock(() => undefined);
      const mockSentryService = {
        captureException: captureExceptionMock,
        addBreadcrumb: addBreadcrumbMock,
      } as unknown as SentryService;

      const filterWithSentry = new GlobalExceptionFilter(
        undefined,
        mockSentryService,
      );
      spyOn(
        (filterWithSentry as unknown as { logger: { error: () => void } })
          .logger,
        "error",
      ).mockImplementation(() => undefined);
      const fatalError = new Error("Database connection dropped");
      filterWithSentry.catch(fatalError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(captureExceptionMock).toHaveBeenCalledTimes(1);
      const captureCalls = captureExceptionMock.mock.calls as unknown as [
        unknown,
        {
          tags?: Record<string, string | undefined>;
          extra?: Record<string, unknown>;
        },
      ][];
      expect(captureCalls[0]?.[0]).toBe(fatalError);
      expect(captureCalls[0]?.[1]?.tags?.["statusCode"]).toBe("500");

      const jsonCalls = mockResponse.json.mock.calls as unknown as [
        Record<string, unknown>,
      ][];
      expect(jsonCalls[0]?.[0]?.["status"]).toBe(500);
      expect(jsonCalls[0]?.[0]?.["eventId"]).toBe("mock-sentry-event-id");
    });

    it("should strictly filter 4xx client errors from Sentry alerts to prevent noise while recording breadcrumbs", () => {
      const captureExceptionMock = mock((): string | undefined => undefined);
      const addBreadcrumbMock = mock(() => undefined);
      const mockSentryService = {
        captureException: captureExceptionMock,
        addBreadcrumb: addBreadcrumbMock,
      } as unknown as SentryService;

      const filterWithSentry = new GlobalExceptionFilter(
        undefined,
        mockSentryService,
      );
      const clientError = new BadRequestException("Invalid input");

      filterWithSentry.catch(clientError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(captureExceptionMock).not.toHaveBeenCalled();
      expect(addBreadcrumbMock).toHaveBeenCalledTimes(1);
      expect(addBreadcrumbMock).toHaveBeenCalledWith(
        expect.objectContaining({
          category: SENTRY_BREADCRUMB_CATEGORY.HTTP_CLIENT_ERROR,
          level: "warning",
        }),
      );
    });
  });
});
