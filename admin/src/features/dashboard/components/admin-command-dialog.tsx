"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tags,
  Warehouse,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  User,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface AdminCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCommandDialog({
  open,
  onOpenChange,
}: AdminCommandDialogProps) {
  const t = useTranslations("adminDashboard");
  const router = useRouter();
  const { setTheme } = useTheme();

  // Listen for Cmd+K or Ctrl+K globally
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("quickSearch")} />
      <CommandList>
        <CommandEmpty>{t("header.searchPlaceholder")}</CommandEmpty>

        {/* Group 1: General Navigation */}
        <CommandGroup heading={t("nav.groups.overview")}>
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <LayoutDashboard className="mr-2 size-4" />
            <span>{t("nav.overview")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 2: Catalog & Warehouses */}
        <CommandGroup heading={t("nav.groups.catalog")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/products"))}
          >
            <Package className="mr-2 size-4" />
            <span>{t("nav.products")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/products/new"))}
          >
            <PlusCircle className="text-primary mr-2 size-4" />
            <span>Thêm sản phẩm mới</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/categories"))}
          >
            <FolderTree className="mr-2 size-4" />
            <span>{t("nav.categories")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/brands"))}
          >
            <Tags className="mr-2 size-4" />
            <span>{t("nav.brands")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/warehouses"))}
          >
            <Warehouse className="mr-2 size-4" />
            <span>{t("nav.warehouses")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 3: Sales & B2B RFQ */}
        <CommandGroup heading={t("nav.groups.sales")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/quotes"))}
          >
            <FileText className="mr-2 size-4" />
            <span>{t("nav.quotes")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/orders"))}
          >
            <ShoppingCart className="mr-2 size-4" />
            <span>{t("nav.orders")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/customers"))}
          >
            <Users className="mr-2 size-4" />
            <span>{t("nav.customers")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 4: Settings & Quick Themes */}
        <CommandGroup heading={t("userMenu.settings")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/profile"))}
          >
            <User className="mr-2 size-4" />
            <span>{t("userMenu.profile")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 size-4" />
            <span>{t("userMenu.settings")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 size-4" />
            <span>{t("userMenu.light")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 size-4" />
            <span>{t("userMenu.dark")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 size-4" />
            <span>{t("userMenu.system")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
