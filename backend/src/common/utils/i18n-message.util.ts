import type { Path } from "nestjs-i18n";
import type { I18nTranslations } from "@/generated/i18n.generated";

/**
 * Formats an i18n translation key and arguments into a serialized token string for Zod schemas.
 *
 * @param key Translation path key
 * @param args Optional dynamic interpolation arguments
 * @returns Encoded "key|{args}" message string decoded by GlobalExceptionFilter
 */
export function i18nZodMsg(
  key: Path<I18nTranslations>,
  args?: Record<string, unknown>,
): string {
  return `${key}|${JSON.stringify(args ?? {})}`;
}
