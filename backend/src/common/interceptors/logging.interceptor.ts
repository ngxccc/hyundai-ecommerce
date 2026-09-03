import { SentryService } from "../services/sentry.service";
import { SENTRY_BREADCRUMB_CATEGORY } from "@/common/constants/sentry.constant";
import {
  Injectable,
  HttpException,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
  Optional,
} from "@nestjs/common";
import { throwError, type Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import type { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  constructor(@Optional() private readonly sentryService?: SentryService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl } = request;
    const startTime = Date.now();

    const rawRequestId =
      (request.headers as Record<string, unknown> | undefined)?.[
        "x-request-id"
      ] ?? (request as unknown as { id?: string | number }).id;
    if (typeof rawRequestId === "string" || typeof rawRequestId === "number") {
      this.sentryService?.setTag("requestId", String(rawRequestId));
    }

    const user = (
      request as unknown as {
        user?: { id?: string; email?: string; role?: string };
      }
    ).user;
    if (user) {
      this.sentryService?.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;
        const message = `[${method}] ${originalUrl} ${String(statusCode)} - ${String(duration)}ms`;

        if (statusCode >= 500) {
          this.logger.error(message);
        } else if (statusCode >= 400 || duration >= 500) {
          this.logger.warn(message);
        } else {
          this.logger.debug(message);
        }

        this.sentryService?.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORY.HTTP,
          message: `[${method}] ${originalUrl} [${String(statusCode)}] ${String(duration)}ms`,
          level:
            statusCode >= 500
              ? "error"
              : statusCode >= 400
                ? "warning"
                : "info",
          data: {
            method,
            url: originalUrl,
            statusCode,
            duration,
          },
        });
      }),
      catchError((err: unknown) => {
        const duration = Date.now() - startTime;
        const statusCode =
          err instanceof HttpException
            ? err.getStatus()
            : response.statusCode >= 400
              ? response.statusCode
              : 500;
        const errorMessage = err instanceof Error ? err.message : String(err);
        const message = `[${method}] ${originalUrl} ${String(statusCode)} - ${String(duration)}ms - Error: ${errorMessage}`;

        if (statusCode >= 500) {
          this.logger.error(message);
        } else {
          this.logger.warn(message);
        }
        return throwError(() => err);
      }),
    );
  }
}
