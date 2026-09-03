import {
  Injectable,
  type OnModuleInit,
  type OnApplicationShutdown,
} from "@nestjs/common";
import {
  init as initSentrySdk,
  isInitialized,
  flush as flushSentry,
  withScope,
  captureException as captureSentryException,
  addBreadcrumb as addSentryBreadcrumb,
  setUser as setSentryUser,
  setTag as setSentryTag,
} from "@sentry/nestjs";
import { env } from "@/env";
import {
  SENTRY_BREADCRUMB_CATEGORY,
  type SentryBreadcrumbCategory,
} from "@/common/constants/sentry.constant";

/**
 * Categorized sensitive key pattern registry for PII and credential detection.
 */
export const DEFAULT_SENSITIVE_PATTERNS: readonly RegExp[] = [
  /pass(?:word|phrase|wd)|pwd/i, // Passwords and confirmation hashes
  /secret|private_?key|priv_?key/i, // Secrets and private keys
  /token|bearer|jwt/i, // Access, refresh, and bearer tokens
  /auth(?:orization)?/i, // Authorization headers and auth payloads
  /cookie|session_?(?:id|token|key|secret)/i, // Cookies and session identifiers
  /api_?key/i, // External service API keys
  /checksum/i, // Checksum and HMAC signature keys
  /card_?(?:number|no)|cvv|cvc|pan/i, // Payment card PAN, CVV, and CVC numbers
];

/**
 * Evaluates whether an object key matches default or custom sensitive key patterns.
 *
 * @param key - Property key to test
 * @param extraPatterns - Optional additional regex patterns to match against
 */
export function isSensitiveKey(
  key: string,
  extraPatterns?: readonly RegExp[],
): boolean {
  if (DEFAULT_SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
    return true;
  }
  if (extraPatterns && extraPatterns.length > 0) {
    return extraPatterns.some((pattern) => pattern.test(key));
  }
  return false;
}

/**
 * Options for configuring payload sanitization.
 */
export interface SanitizeOptions {
  extraPatterns?: readonly RegExp[];
  seen?: WeakSet<object>;
}

/**
 * Recursively sanitizes sensitive PII and credential keys in object payloads.
 *
 * @param obj - Payload object to sanitize
 * @param options - Configuration options for custom patterns and cycle detection
 */
export function sanitizeSensitiveData<T>(obj: T, options?: SanitizeOptions): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const seen = options?.seen ?? new WeakSet<object>();
  if (seen.has(obj)) {
    return "[CIRCULAR_REFERENCE]" as unknown as T;
  }
  seen.add(obj);

  const nextOptions: SanitizeOptions = {
    extraPatterns: options?.extraPatterns,
    seen,
  };

  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((item) =>
      sanitizeSensitiveData(item, nextOptions),
    ) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (isSensitiveKey(key, options?.extraPatterns)) {
      sanitized[key] = "[REDACTED]";
    } else if (val !== null && typeof val === "object") {
      sanitized[key] = sanitizeSensitiveData(val, nextOptions);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized as T;
}

/**
 * Formats a deterministic Sentry release signature for suspect commit attribution.
 */
export function formatReleaseSignature(): string {
  const commitSha =
    process.env["RENDER_GIT_COMMIT"] ??
    process.env["GITHUB_SHA"] ??
    process.env["GIT_COMMIT_SHA"] ??
    "local";
  return `${process.env["npm_package_name"] ?? "ticket-booking"}@${process.env["npm_package_version"] ?? "1.0.0"}+${commitSha}`;
}

/**
 * Evaluates tracing sample rate based on transaction route prefix.
 *
 * @param transactionName - Transaction route identifier (e.g. "GET /health")
 * @param sampleRate - Default sample rate for business routes
 */
export function sampleTraceTransaction(
  transactionName?: string,
  sampleRate = env.SENTRY_TRACES_SAMPLE_RATE,
): number {
  const name = transactionName ?? "";
  if (
    name.startsWith("GET /health") ||
    name === "GET /" ||
    name.startsWith("GET /metrics") ||
    name.startsWith("GET /reference") ||
    name.startsWith("GET /api-json")
  ) {
    return 0.0;
  }
  return sampleRate;
}

/**
 * Evaluates whether a breadcrumb is high-frequency background noise that should be dropped.
 *
 * Drops routine transaction markers ("begin", "commit"), background polling queries ("outbox_events ... skip locked"),
 * and periodic maintenance queries ("delete from refresh_tokens").
 */
export function shouldDropBreadcrumb(breadcrumb: {
  category?: string;
  message?: string;
}): boolean {
  if (breadcrumb.category === SENTRY_BREADCRUMB_CATEGORY.DB_QUERY) {
    const msg = breadcrumb.message?.toLowerCase().trim() ?? "";
    if (msg === "begin" || msg === "commit") {
      return true;
    }
    if (msg.includes("outbox_events") && msg.includes("skip locked")) {
      return true;
    }
    // Drop periodic token cleanup cron queries specifically targeting expired tokens (< $1)
    if (
      msg.includes('delete from "refresh_tokens"') &&
      msg.includes('"expires_at" <')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Initializes Sentry SDK with dynamic sampling, PII scrubbing, and release tracking.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  initSentrySdk({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    release: formatReleaseSignature(),
    maxBreadcrumbs: 50,
    normalizeDepth: 5,
    dataCollection: {
      userInfo: false,
      cookies: false,
      databaseQueryData: false,
      stackFrameVariables: false,
      httpHeaders: {
        request: {
          deny: ["authorization", "cookie", "set-cookie"],
        },
      },
    },
    tracesSampler(samplingContext) {
      return sampleTraceTransaction(samplingContext.name);
    },
    beforeSend(event) {
      if (event.request?.headers) {
        event.request.headers = sanitizeSensitiveData(event.request.headers);
      }
      if (event.request?.data) {
        event.request.data = sanitizeSensitiveData(event.request.data);
      }
      if (event.extra) {
        event.extra = sanitizeSensitiveData(event.extra);
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (shouldDropBreadcrumb(breadcrumb)) {
        return null;
      }
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeSensitiveData(breadcrumb.data);
      }
      return breadcrumb;
    },
  });
}

/**
 * Service wrapper for Sentry error tracking, breadcrumb accumulation, user context tagging, and graceful shutdown flushing.
 */
@Injectable()
export class SentryService implements OnModuleInit, OnApplicationShutdown {
  onModuleInit(): void {
    initSentry();
  }

  /**
   * Flushes in-flight Sentry event buffers upon application termination.
   */
  async onApplicationShutdown(): Promise<void> {
    await this.flush(2000);
  }

  /**
   * Checks whether Sentry error reporting is active.
   */
  isEnabled(): boolean {
    return Boolean(env.SENTRY_DSN && isInitialized());
  }

  /**
   * Drains in-flight Sentry event queues before process termination.
   *
   * @param timeout - Maximum wait time in milliseconds
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (!this.isEnabled()) {
      return true;
    }
    return await flushSentry(timeout);
  }

  /**
   * Captures an unhandled runtime error or database exception in Sentry.
   *
   * @param error - The error or exception instance
   * @param context - Additional structured metadata, tags, or user identity
   */
  captureException(
    error: unknown,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      user?: { id?: string; email?: string; role?: string };
    },
  ): string | undefined {
    if (!this.isEnabled()) {
      return undefined;
    }

    return withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([k, v]) => {
          scope.setTag(k, v);
        });
      }

      if (context?.extra) {
        const sanitizedExtra = sanitizeSensitiveData(context.extra);
        Object.entries(sanitizedExtra).forEach(([k, v]) => {
          scope.setExtra(k, v);
        });
      }

      if (context?.user) {
        scope.setUser(context.user);
      }

      return captureSentryException(error);
    });
  }

  /**
   * Adds a user journey or operation breadcrumb to the active Sentry scope.
   *
   * @param breadcrumb - Breadcrumb payload with category, message, and diagnostic data
   */
  addBreadcrumb(breadcrumb: {
    category: SentryBreadcrumbCategory;
    message: string;
    level?: "debug" | "info" | "warning" | "error" | "fatal";
    data?: Record<string, unknown>;
  }): void {
    if (!this.isEnabled()) {
      return;
    }

    const sanitizedData = breadcrumb.data
      ? sanitizeSensitiveData(breadcrumb.data)
      : undefined;

    addSentryBreadcrumb({
      category: breadcrumb.category,
      message: breadcrumb.message,
      level: breadcrumb.level ?? "info",
      data: sanitizedData,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Associates the current execution context with authenticated user identity.
   *
   * @param user - User identity object or null to clear context
   */
  setUser(user: { id?: string; email?: string; role?: string } | null): void {
    if (!this.isEnabled()) {
      return;
    }

    setSentryUser(user);
  }

  /**
   * Sets a custom tag for filtering and grouping events in the Sentry dashboard.
   *
   * @param key - Tag key
   * @param value - Tag string value
   */
  setTag(key: string, value: string): void {
    if (!this.isEnabled()) {
      return;
    }

    setSentryTag(key, value);
  }
}
