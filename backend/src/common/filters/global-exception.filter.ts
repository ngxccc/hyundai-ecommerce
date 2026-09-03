import { SentryService } from "@/common/services/sentry.service";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { I18nContext, I18nService } from "nestjs-i18n";
import { extractDatabaseErrorDetails } from "@/common/utils/error.util";
import { PG_ERROR_CODE } from "@/common/constants/error.constant";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface Rfc9457ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  eventId?: string;
  invalidParams: InvalidParam[];
  timestamp: string;
}

function isRecordObject(res: unknown): res is Record<string, unknown> {
  return typeof res === "object" && res !== null;
}

// Formats API error payloads strictly following RFC 9457 Problem Details specification with I18n translation.
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    @Optional() private readonly i18n?: I18nService,
    @Optional() private readonly sentryService?: SentryService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const lang = I18nContext.current(host)?.lang;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = "Internal Server Error";
    let detail: string;
    let invalidParams: InvalidParam[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = this.formatTitle(exception.name, exception.getResponse());

      const parsed = this.parseHttpExceptionResponse(
        exception.getResponse(),
        lang,
      );
      detail = parsed.detail;
      invalidParams = parsed.invalidParams;
    } else {
      const errStack =
        exception instanceof Error
          ? (exception.stack ?? exception.message)
          : typeof exception === "object" && exception !== null
            ? JSON.stringify(exception)
            : String(exception);

      const dbErr = extractDatabaseErrorDetails(exception);

      // Extract PostgreSQL & Drizzle metadata for actionable observability while shielding internal SQL details from clients.
      if (dbErr.isDatabaseError) {
        this.logger.error(
          `Database Exception [${dbErr.code ?? "UNKNOWN"}]: ${dbErr.message ?? "Database operation failed"} | Table: ${dbErr.table ?? "N/A"} | Column: ${dbErr.column ?? "N/A"} | Constraint: ${dbErr.constraint ?? "N/A"} | Detail: ${dbErr.detail ?? "N/A"}\nQuery: ${dbErr.query ?? "N/A"}\n${errStack}`,
        );

        // Map database-level concurrency collisions (unique index violations, exclusion constraints, deadlocks) to HTTP 409 Conflict.
        if (
          dbErr.code === PG_ERROR_CODE.UNIQUE_VIOLATION ||
          dbErr.code === PG_ERROR_CODE.EXCLUSION_VIOLATION ||
          dbErr.code === PG_ERROR_CODE.DEADLOCK_DETECTED
        ) {
          status = HttpStatus.CONFLICT;
          title = "Conflict";
          detail = this.translate(
            "common.RESOURCE_CONFLICT",
            lang,
            "A resource conflict occurred. Please retry your request.",
          );
          // Map database statement timeout (57014) to HTTP 504 Gateway Timeout.
        } else if (dbErr.code === PG_ERROR_CODE.QUERY_CANCELED) {
          status = HttpStatus.GATEWAY_TIMEOUT;
          title = "Gateway Timeout";
          detail = this.translate(
            "common.GATEWAY_TIMEOUT",
            lang,
            "The database or downstream service timed out. Please retry.",
          );
          // Sanitize unknown database exceptions to HTTP 500 without disclosing query parameters or database schema.
        } else {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          title = "Internal Server Error";
          detail = this.translate(
            "common.INTERNAL_SERVER_ERROR",
            lang,
            "An internal server error occurred. Please try again later.",
          );
        }
      } else {
        this.logger.error(`Unhandled Exception: ${errStack}`);
        // Sanitize generic unhandled application exceptions to prevent internal stack trace leakage.
        detail = this.translate(
          "common.INTERNAL_SERVER_ERROR",
          lang,
          "An internal server error occurred. Please try again later.",
        );
      }
    }

    let eventId: string | undefined;

    // Zero-noise telemetry: Capture 5xx server errors and unhandled exceptions in Sentry while filtering standard 4xx client errors.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const user = (
        request as unknown as {
          user?: { id?: string; email?: string; role?: string };
        }
      ).user;

      eventId = this.sentryService?.captureException(exception, {
        tags: {
          statusCode: String(status),
          method: request.method,
          path: request.url,
          title,
        },
        extra: {
          url: request.url,
          ip: request.ip,
          headers: {
            host: request.get("host"),
            userAgent: request.get("user-agent"),
          },
        },
        user: user
          ? { id: user.id, email: user.email, role: user.role }
          : undefined,
      });
    } else {
      // Record breadcrumb for 4xx errors without triggering Sentry alerts or consuming error quota.
      this.sentryService?.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORY.HTTP_CLIENT_ERROR,
        message: `${request.method} ${request.url} [${String(status)}] ${title}`,
        level: "warning",
        data: { status, title, detail },
      });
    }

    const hostHeader = request.get("host") ?? "localhost";
    const typeUri = `${request.protocol}://${hostHeader}/errors/${title.toLowerCase().replace(/\s+/g, "-")}`;
    response
      .status(status)
      .setHeader("Content-Type", "application/problem+json")
      .json({
        type: typeUri,
        title,
        status,
        detail,
        instance: request.url,
        ...(eventId ? { eventId } : {}),
        invalidParams,
        timestamp: new Date().toISOString(),
      });
  }

  // Extracts user-friendly error detail and field validation constraints from diverse NestJS exception formats.
  private parseHttpExceptionResponse(
    res: unknown,
    lang?: string,
  ): { detail: string; invalidParams: InvalidParam[] } {
    if (typeof res === "string") {
      return { detail: res, invalidParams: [] };
    }

    if (!isRecordObject(res)) {
      return { detail: "Invalid error payload", invalidParams: [] };
    }

    const detail = this.extractDetail(res, lang);
    const invalidParams = this.extractInvalidParams(res, lang);

    return { detail, invalidParams };
  }

  private extractDetail(res: Record<string, unknown>, lang?: string): string {
    if (typeof res["detail"] === "string") {
      return this.formatReason(res["detail"], lang);
    }

    const msg = res["message"];
    if (typeof msg === "string") {
      return msg;
    }

    if (Array.isArray(msg) && msg.length > 0) {
      const first = msg[0] as unknown;
      if (typeof first === "string") {
        return first;
      }
      if (isRecordObject(first) && "property" in first) {
        return this.translate(
          "common.INVALID_INPUT",
          lang,
          "Submitted data format is invalid",
        );
      }
    }

    return "Error occurred";
  }

  private extractInvalidParams(
    res: Record<string, unknown>,
    lang?: string,
  ): InvalidParam[] {
    let rawParams: InvalidParam[] = [];

    if (Array.isArray(res["invalidParams"])) {
      rawParams = res["invalidParams"] as InvalidParam[];
    } else {
      const msg = res["message"];
      if (
        Array.isArray(msg) &&
        msg.length > 0 &&
        isRecordObject(msg[0]) &&
        "property" in msg[0]
      ) {
        rawParams = (msg as Record<string, unknown>[]).map((item) => {
          const propObj = item["property"];
          const prop = typeof propObj === "string" ? propObj : "";
          const constraints = (item["constraints"] ?? {}) as Record<
            string,
            string
          >;
          const firstReason = Object.values(constraints)[0] ?? "";
          return { name: prop, reason: firstReason };
        });
      }
    }

    return rawParams.map((param) => ({
      name: param.name,
      reason: this.formatReason(param.reason, lang, param.name),
    }));
  }

  private formatReason(
    rawReason: string,
    lang?: string,
    propName?: string,
  ): string {
    if (!rawReason) return "Invalid value";

    // WHY: Format nestjs-i18n raw validation message string "key|{args_json}" into localized human-readable error text.
    if (rawReason.includes("|")) {
      const pipeIndex = rawReason.indexOf("|");
      const key = rawReason.slice(0, pipeIndex);
      const jsonStr = rawReason.slice(pipeIndex + 1).trim();

      if (jsonStr.startsWith("{") && jsonStr.endsWith("}")) {
        let args: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(jsonStr) as unknown;
          if (isRecordObject(parsed)) {
            args = { ...parsed };
          }
        } catch {
          // ignore JSON parse error
        }

        if (
          propName &&
          (!args["property"] ||
            typeof args["property"] !== "string" ||
            !args["property"].trim())
        ) {
          args["property"] = propName;
        }

        if (key) {
          const translated = this.translateWithArgs(key, lang, args, key);
          return translated.trim();
        }
      }
    }
    return rawReason.trim();
  }

  private formatTitle(exceptionName: string, resResponse?: unknown): string {
    if (
      isRecordObject(resResponse) &&
      typeof resResponse["error"] === "string" &&
      resResponse["error"]
    ) {
      return resResponse["error"];
    }
    const rawName = exceptionName.replace(/Exception$/, "");
    return rawName.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  // WHY: Safe fallback helper to translate error messages without risk of crashing if I18nService is missing or fails.
  private translate(key: string, lang?: string, fallback = ""): string {
    return this.translateWithArgs(key, lang, undefined, fallback);
  }

  private translateWithArgs(
    key: string,
    lang?: string,
    args?: Record<string, unknown>,
    fallback = "",
  ): string {
    if (!this.i18n) return fallback;
    try {
      const result = this.i18n.translate(key, { lang, args });
      return typeof result === "string" ? result : fallback;
    } catch {
      return fallback;
    }
  }
}
