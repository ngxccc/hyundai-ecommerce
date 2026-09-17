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
  CommandShortcut,
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
      <CommandInput placeholder={t("command.searchPlaceholder")} />
      <CommandList>
        <CommandEmpty>{t("command.noResults")}</CommandEmpty>

        {/* Group 1: General Navigation */}
        <CommandGroup heading={t("nav.groups.overview")}>
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <LayoutDashboard className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.overview")}</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 2: Catalog & Warehouses */}
        <CommandGroup heading={t("nav.groups.catalog")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/products"))}
          >
            <Package className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.products")}</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/products/new"))}
          >
            <PlusCircle className="text-primary size-4 shrink-0" />
            <span className="text-primary font-medium">
              {t("header.createReport") ? "Thêm sản phẩm mới" : "Add Product"}
            </span>
            <CommandShortcut>N P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/categories"))}
          >
            <FolderTree className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.categories")}</span>
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/brands"))}
          >
            <Tags className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.brands")}</span>
            <CommandShortcut>G B</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/warehouses"))}
          >
            <Warehouse className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.warehouses")}</span>
            <CommandShortcut>G W</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 3: Sales & B2B RFQ */}
        <CommandGroup heading={t("nav.groups.sales")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/quotes"))}
          >
            <FileText className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.quotes")}</span>
            <CommandShortcut>G Q</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/orders"))}
          >
            <ShoppingCart className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.orders")}</span>
            <CommandShortcut>G O</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/customers"))}
          >
            <Users className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("nav.customers")}</span>
            <CommandShortcut>G U</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Group 4: Settings & Quick Themes */}
        <CommandGroup heading={t("userMenu.settings")}>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/profile"))}
          >
            <User className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("userMenu.profile")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("userMenu.settings")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="size-4 shrink-0 text-amber-500/80" />
            <span>{t("userMenu.light")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="size-4 shrink-0 text-blue-400/80" />
            <span>{t("userMenu.dark")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="text-muted-foreground/80 size-4 shrink-0" />
            <span>{t("userMenu.system")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Keyboard Navigation Footer */}
      <div className="border-border/60 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <kbd className="border-border/70 bg-background text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-2xs">
                ↑
              </kbd>
              <kbd className="border-border/70 bg-background text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-2xs">
                ↓
              </kbd>
            </span>
            <span>{t("command.navigate")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="border-border/70 bg-background text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-2xs">
              ↵
            </kbd>
            <span>{t("command.select")}</span>
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <kbd className="border-border/70 bg-background text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-2xs">
            ESC
          </kbd>
          <span>{t("command.close")}</span>
        </span>
      </div>
    </CommandDialog>
  );
}
