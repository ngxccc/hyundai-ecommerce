"use client";

import { useTranslations } from "next-intl";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { useAdminNav } from "@/features/dashboard/hooks";

interface ProductHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export const ProductHeader = ({
  title,
  description,
  showAddButton = true,
}: ProductHeaderProps) => {
  const t = useTranslations("AdminProducts.header");
  const tDashboard = useTranslations("AdminDashboard");
  const navItems = useAdminNav();
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-40 flex w-full items-center justify-between px-4 pt-4 pb-2 backdrop-blur-md md:px-2">
      {/* Mobile navbar */}
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-70 p-0">
            <SheetHeader className="p-6 text-left">
              <SheetTitle className="text-primary text-xl font-bold">
                {tDashboard("title")}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3">
              {navItems.map((item, index) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive && "text-primary fill-primary/20",
                      )}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-col gap-1">
          <h2 className="text-primary text-xl font-bold md:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground hidden text-sm sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="w-62.5 rounded-full pr-4 pl-10 shadow-sm"
            placeholder={t("searchPlaceholder")}
            type="text"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="bg-card text-muted-foreground hover:text-primary hover:bg-card relative flex h-10 w-10 shrink-0 rounded-full shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <span className="bg-destructive absolute top-2 right-2 h-2 w-2 rounded-full"></span>
        </Button>

        {showAddButton && (
          <Button
            className="flex shrink-0 items-center gap-2 rounded-lg shadow-sm"
            variant="default"
            asChild
          >
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("addProduct")}</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};
