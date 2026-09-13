/**
 * Supported I18N locale codes across the platform.
 */
export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * System-wide default primary locale for commercial documents, internal calculations,
 * and database queries when no client locale is specified.
 */
export const DEFAULT_LOCALE: SupportedLocale = "vi";
