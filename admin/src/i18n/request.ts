import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "next-intl";

const isValidLocale = (locale: unknown): locale is Locale => {
  return (
    typeof locale === "string" && routing.locales.includes(locale as Locale)
  );
};

export default getRequestConfig(async ({ locale }) => {
  // Fallback an toàn nếu có request không hợp lệ
  const resolvedLocale = isValidLocale(locale) ? locale : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (
      (await import(`../../messages/${resolvedLocale}.json`)) as {
        default: Record<string, string>;
      }
    ).default,
  };
});
