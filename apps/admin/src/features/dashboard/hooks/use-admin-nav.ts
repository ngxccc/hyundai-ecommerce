import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";

export const useAdminNav = () => {
  const t = useTranslations("AdminDashboard.nav");

  const navItems = [
    { icon: LayoutDashboard, label: t("overview"), href: "/" },
    { icon: Package, label: t("products"), href: "/products" },
    { icon: ShoppingCart, label: t("orders"), href: "/orders" },
    { icon: Users, label: t("customers"), href: "/customers" },
    { icon: Settings, label: t("settings"), href: "/settings" },
  ];

  return navItems;
};
