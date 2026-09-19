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
  const [
    common,
    auth,
    dashboard,
    products,
    brands,
    categories,
    warehouses,
    customers,
    orders,
    quotes,
    settings,
  ] = (await Promise.all([
    import(`../../messages/${resolvedLocale}/common.json`),
    import(`../../messages/${resolvedLocale}/auth.json`),
    import(`../../messages/${resolvedLocale}/dashboard.json`),
    import(`../../messages/${resolvedLocale}/products.json`),
    import(`../../messages/${resolvedLocale}/brands.json`),
    import(`../../messages/${resolvedLocale}/categories.json`),
    import(`../../messages/${resolvedLocale}/warehouses.json`),
    import(`../../messages/${resolvedLocale}/customers.json`),
    import(`../../messages/${resolvedLocale}/orders.json`),
    import(`../../messages/${resolvedLocale}/quotes.json`),
    import(`../../messages/${resolvedLocale}/settings.json`),
  ])) as MessageModule[];

  return {
    locale: resolvedLocale,
    messages: {
      ...common.default,
      ...auth.default,
      ...dashboard.default,
      ...products.default,
      ...brands.default,
      ...categories.default,
      ...warehouses.default,
      ...customers.default,
      ...orders.default,
      ...quotes.default,
      ...settings.default,
    },
  };
});
