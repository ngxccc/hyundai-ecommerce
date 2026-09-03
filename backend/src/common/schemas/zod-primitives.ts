import { z } from "zod";
import { sanitizeString } from "@/common/utils/sanitize.util";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";

/**
 * UUIDv7 format regular expression conforming to RFC 9562 specification (version digit 7).
 */
const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Vietnamese 10-digit mobile phone number regular expression.
 */
const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;

/**
 * Builds a sanitized string schema that neutralizes HTML tags and trims whitespace.
 *
 * @param options Optional minimum and maximum string length boundaries
 * @returns Zod string transformation schema
 */
export function zSanitizedString(options?: { min?: number; max?: number }) {
  let schema = z
    .string({
      error: i18nZodMsg("validation.isString"),
    })
    .transform((val) => {
      const sanitized = sanitizeString(val) as string;
      return sanitized.replace(/\s+/g, " ").trim();
    });

  if (options?.min !== undefined) {
    schema = schema.refine((val) => val.length >= (options.min ?? 0), {
      message: i18nZodMsg("validation.minLength", { "0": options.min }),
    });
  }

  if (options?.max !== undefined) {
    schema = schema.refine((val) => val.length <= (options.max ?? Infinity), {
      message: i18nZodMsg("validation.maxLength", { "0": options.max }),
    });
  }

  return schema;
}

/**
 * Builds a normalized email schema that lowercases, trims, and validates email syntax.
 *
 * @returns Zod email transformation and validation schema
 */
export function zEmail() {
  return z
    .string({
      error: i18nZodMsg("validation.isString"),
    })
    .trim()
    .toLowerCase()
    .pipe(
      z.email({
        error: i18nZodMsg("validation.isEmail"),
      }),
    );
}

/**
 * Builds a strict password schema enforcing length and complexity criteria.
 *
 * @returns Zod password complexity validation schema
 */
export function zPassword() {
  return z
    .string({
      error: i18nZodMsg("validation.isString"),
    })
    .min(8, { message: i18nZodMsg("validation.minLength", { "0": 8 }) })
    .max(128, { message: i18nZodMsg("validation.maxLength", { "0": 128 }) })
    .regex(/[A-Z]/, {
      message: i18nZodMsg("validation.passwordMustContainUppercase"),
    })
    .regex(/[0-9]/, {
      message: i18nZodMsg("validation.passwordMustContainNumber"),
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: i18nZodMsg("validation.passwordMustContainSpecialChar"),
    });
}

/**
 * Builds a 10-digit Vietnamese mobile phone number validation schema.
 *
 * @returns Zod phone number validation schema
 */
export function zPhoneNumber() {
  return z
    .string({
      error: i18nZodMsg("validation.isString"),
    })
    .trim()
    .regex(VN_PHONE_REGEX, {
      message: i18nZodMsg("validation.phoneNumberInvalid"),
    });
}

/**
 * Builds an RFC 9562 UUIDv7 validation schema.
 *
 * @returns Zod UUIDv7 validation schema
 */
export function zUuidV7() {
  return z
    .string({
      error: i18nZodMsg("validation.isString"),
    })
    .regex(UUID_V7_REGEX, {
      message: i18nZodMsg("validation.isUuid"),
    });
}

/**
 * Builds a safe boolean coercion schema for query strings and JSON payloads.
 *
 * @returns Zod boolean parsing schema
 */
export function zBooleanString() {
  return z.union([
    z.boolean(),
    z.enum(["true", "false"]).transform((val) => val === "true"),
  ]);
}

/**
 * Builds a safe numeric coercion schema for query parameters and JSON numbers.
 *
 * @param options Optional boundary and integer constraints
 * @returns Zod numeric parsing schema
 */
export function zNumericString(options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}) {
  let schema = z.union([z.number(), z.string()]).transform((val, ctx) => {
    if (typeof val === "number") return val;
    const parsed = Number(val);
    if (Number.isNaN(parsed) || val.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: i18nZodMsg("validation.isNumberString"),
      });
    }
    return parsed;
  });

  if (options?.integer) {
    schema = schema.refine((val) => Number.isInteger(val), {
      message: i18nZodMsg("validation.isInt"),
    });
  }

  if (options?.min !== undefined) {
    schema = schema.refine((val) => val >= (options.min ?? -Infinity), {
      message: i18nZodMsg("validation.isPositive"),
    });
  }

  if (options?.max !== undefined) {
    schema = schema.refine((val) => val <= (options.max ?? Infinity), {
      message: i18nZodMsg("validation.maxLength", { "0": options.max }),
    });
  }

  return schema;
}
