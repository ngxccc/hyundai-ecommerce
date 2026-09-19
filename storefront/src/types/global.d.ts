import type { routing } from "@/i18n/routing";
import type common from "../../messages/vi/common.json";
import type home from "../../messages/vi/home.json";
import type auth from "../../messages/vi/auth.json";
import type products from "../../messages/vi/products.json";
import type quote from "../../messages/vi/quote.json";
import type orders from "../../messages/vi/orders.json";

type Messages = typeof common &
  typeof home &
  typeof auth &
  typeof products &
  typeof quote &
  typeof orders;

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}

export {};
