import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  FolderTree,
  Warehouse,
  FileText,
} from "lucide-react";

export const useAdminNav = () => {
  const t = useTranslations("AdminDashboard.nav");

  const navItems = [
    { icon: LayoutDashboard, label: t("overview"), href: "/" },
    { icon: Package, label: t("products"), href: "/products" },
    { icon: FolderTree, label: t("categories"), href: "/categories" },
    { icon: Tags, label: t("brands"), href: "/brands" },
    { icon: Warehouse, label: t("warehouses"), href: "/warehouses" },
    { icon: ShoppingCart, label: t("orders"), href: "/orders" },
    { icon: FileText, label: t("quotes"), href: "/quotes" },
    { icon: Users, label: t("customers"), href: "/customers" },
  ];

  return navItems;
};
