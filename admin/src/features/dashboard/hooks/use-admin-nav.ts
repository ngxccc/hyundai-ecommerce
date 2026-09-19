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
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const useAdminNavGroups = (): NavGroup[] => {
  const t = useTranslations("adminDashboard.nav");

  return [
    {
      id: "overview",
      title: t("groups.overview"),
      items: [
        {
          icon: LayoutDashboard,
          label: t("overview"),
          href: "/",
        },
      ],
    },
    {
      id: "catalog",
      title: t("groups.catalog"),
      items: [
        {
          icon: Package,
          label: t("products"),
          href: "/products",
        },
        {
          icon: FolderTree,
          label: t("categories"),
          href: "/categories",
        },
        {
          icon: Tags,
          label: t("brands"),
          href: "/brands",
        },
        {
          icon: Warehouse,
          label: t("warehouses"),
          href: "/warehouses",
        },
      ],
    },
    {
      id: "sales",
      title: t("groups.sales"),
      items: [
        {
          icon: FileText,
          label: t("quotes"),
          href: "/quotes",
        },
        {
          icon: ShoppingCart,
          label: t("orders"),
          href: "/orders",
        },
        {
          icon: Users,
          label: t("customers"),
          href: "/customers",
        },
      ],
    },
    {
      id: "settings",
      title: t("groups.settings"),
      items: [
        {
          icon: Building2,
          label: t("companySettings"),
          href: "/settings/company",
        },
      ],
    },
  ];
};

export const useAdminNav = (): NavItem[] => {
  const groups = useAdminNavGroups();
  return groups.flatMap((group) => group.items);
};
