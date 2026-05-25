import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "next-intl";

const isValidLocale = (locale: unknown): locale is Locale => {
  return (
    typeof locale === "string" && routing.locales.includes(locale as Locale)
  );
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  // Fallback an toàn nếu có thằng hack URL
  const locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (
      (await import(`../../messages/${locale}.json`)) as {
        default: Record<string, string>;
      }
    ).default,
  };
});
