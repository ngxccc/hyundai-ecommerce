import type { routing } from "@/i18n/routing";
import type common from "../../messages/vi/common.json";
import type auth from "../../messages/vi/auth.json";
import type dashboard from "../../messages/vi/dashboard.json";
import type products from "../../messages/vi/products.json";
import type brands from "../../messages/vi/brands.json";
import type categories from "../../messages/vi/categories.json";
import type warehouses from "../../messages/vi/warehouses.json";
import type customers from "../../messages/vi/customers.json";
import type orders from "../../messages/vi/orders.json";
import type quotes from "../../messages/vi/quotes.json";
import type settings from "../../messages/vi/settings.json";

type Messages = typeof common &
  typeof auth &
  typeof dashboard &
  typeof products &
  typeof brands &
  typeof categories &
  typeof warehouses &
  typeof customers &
  typeof orders &
  typeof quotes &
  typeof settings;

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}

export {};
