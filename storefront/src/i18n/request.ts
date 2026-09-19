import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "next-intl";

const isValidLocale = (locale: unknown): locale is Locale => {
  return (
    typeof locale === "string" && routing.locales.includes(locale as Locale)
  );
};

export default getRequestConfig(async ({ locale }) => {
  // Fallback to default locale if requested locale is invalid
  const resolvedLocale = isValidLocale(locale) ? locale : routing.defaultLocale;

  interface MessageModule {
    default: Record<string, unknown>;
  }

  // Load modular messages concurrently and merge
  const [common, home, auth, products, quote, orders] = (await Promise.all([
    import(`../../messages/${resolvedLocale}/common.json`),
    import(`../../messages/${resolvedLocale}/home.json`),
    import(`../../messages/${resolvedLocale}/auth.json`),
    import(`../../messages/${resolvedLocale}/products.json`),
    import(`../../messages/${resolvedLocale}/quote.json`),
    import(`../../messages/${resolvedLocale}/orders.json`),
  ])) as MessageModule[];

  return {
    locale: resolvedLocale,
    messages: {
      ...common.default,
      ...home.default,
      ...auth.default,
      ...products.default,
      ...quote.default,
      ...orders.default,
    },
  };
});
