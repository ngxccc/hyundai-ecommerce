import { Injectable, type ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard, type ThrottlerLimitDetail } from "@nestjs/throttler";
import { I18nContext } from "nestjs-i18n";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES } from "@/common/constants/error.constant";
import type { I18nTranslations } from "@/generated/i18n.generated";
import { env } from "@/env";

/**
 * Custom rate limiting guard with fail-open resilience and localized 429 error payloads.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Evaluates request rate limits in production with a bounded 2-second safety timeout.
   *
   * @param context Execution context of the incoming HTTP request
   * @returns true if allowed or failed open; throws HttpException on rate limit exceed
   */
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // Disable rate limiting in non-production environments to avoid blocking automated tests and developer tooling.
    if (env.NODE_ENV !== "production") {
      return true;
    }

    // Bounded 2-second timeout protects incoming HTTP requests from hanging indefinitely if Redis stalls or goes offline.
    try {
      const { promise: timeoutPromise, reject } =
        Promise.withResolvers<never>();
      const timer = setTimeout(() => {
        reject(new Error("Rate limiting check timed out"));
      }, 2000);
      return await Promise.race([
        super.canActivate(context).finally(() => {
          clearTimeout(timer);
        }),
        timeoutPromise,
      ]);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      // Fail-open resilience: prioritize API availability over strict rate limiting when Redis storage encounters network or timeout faults.
      return true;
    }
  }

  /**
   * Formats localized HTTP 429 Too Many Requests exception payload.
   *
   * @param _context Execution context
   * @param _throttlerLimitDetail Throttler limit details
   */
  protected override throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const i18n = I18nContext.current<I18nTranslations>()?.service;
    const lang = I18nContext.current()?.lang;

    const message = i18n
      ? i18n.t("auth.TOO_MANY_REQUESTS", { lang })
      : "Too many requests. Please try again later";

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: ERROR_MESSAGES.TOO_MANY_REQUESTS,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
