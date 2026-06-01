"use client";

import { useTranslations } from "next-intl";
import { Bell, List, Award, Menu } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nhatnang/ui/components/ui/sheet";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@nhatnang/ui/lib/utils";
import { useAdminNav } from "@/features/dashboard/hooks";

interface CustomerHeaderProps {
  title: string;
  description?: string;
}

export const CustomerHeader = ({ title, description }: CustomerHeaderProps) => {
  const tDashboard = useTranslations("AdminDashboard");
  const tNav = useTranslations("AdminDashboard.nav");
  const navItems = useAdminNav();
  const pathname = usePathname();

  const isTiersActive = pathname.includes("/tiers");
  const isDirectoryActive =
    pathname === "/customers" || pathname === "/customers/";

  return (
    <header className="bg-background/80 border-muted sticky top-0 z-40 flex w-full flex-col gap-4 border-b p-4 backdrop-blur-md">
      <div className="flex w-full items-center justify-between">
        {/* Mobile navbar & Title */}
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

        {/* Right tools (Bell notification & active status) */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-card text-muted-foreground hover:text-primary hover:bg-card relative flex h-10 w-10 shrink-0 rounded-full shadow-sm"
          >
            <Bell className="h-5 w-5" />
            <span className="bg-destructive absolute top-2 right-2 h-2 w-2 rounded-full"></span>
          </Button>
        </div>
      </div>

      {/* Segmented active page navigations */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <Button
          variant="ghost"
          asChild
          className={cn(
            "flex h-9 items-center gap-2 rounded-md px-4 font-semibold transition-all",
            isDirectoryActive
              ? "bg-primary hover:bg-primary text-white shadow-sm hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Link href="/customers">
            <List className="h-4 w-4" />
            {tNav("customers")}
          </Link>
        </Button>
        <Button
          variant="ghost"
          asChild
          className={cn(
            "flex h-9 items-center gap-2 rounded-md px-4 font-semibold transition-all",
            isTiersActive
              ? "bg-primary hover:bg-primary text-white shadow-sm hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Link href="/customers/tiers">
            <Award className="h-4 w-4" />
            {tNav("dealerTiers")}
          </Link>
        </Button>
      </div>
    </header>
  );
};
