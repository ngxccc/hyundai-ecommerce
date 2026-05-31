"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  Globe,
  Palette,
} from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@nhatnang/ui/components/ui/button";
import { useAdminNav } from "../hooks/use-admin-nav";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { authClient } from "@nhatnang/database/auth-client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@nhatnang/ui/components/ui/dropdown-menu";
import { useTheme } from "@nhatnang/ui";

export const AdminSidebar = () => {
  const t = useTranslations("AdminDashboard");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "vi" | "en" });
  };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = useAdminNav();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success(t("logoutSuccess"));
      router.refresh();
      router.push("/login");
    } catch {
      toast.error(t("logoutError"));
    }
  };

  return (
    <aside
      className={cn(
        "border-border bg-card relative z-40 hidden h-screen flex-col border-r shadow-sm transition-all duration-300 md:flex",
        isCollapsed ? "w-20" : "w-50",
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "group relative mb-8 flex items-center px-4 pt-6 transition-all",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex size-8 shrink-0 items-center justify-center">
            <Image
              src="/logo-without-text.png"
              alt="Hyundai Nhat Nang Logo"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <h1 className="text-primary truncate text-xl font-bold">
              {t("title")}
            </h1>
          )}
        </div>

        {isCollapsed ? (
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="absolute top-6 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 shrink-0 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item, index) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={index}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 transition-colors",
                isCollapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "shrink-0",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5",
                  isActive && "text-primary fill-primary/20",
                )}
              />
              {!isCollapsed && (
                <span className="group-hover:text-primary text-sm font-medium transition-colors">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div className="border-border/50 hover:bg-muted/50 mt-auto flex items-center justify-center border-t p-2 transition-colors">
        {isPending ? (
          <div className="flex w-full animate-pulse gap-3">
            <div className="bg-secondary h-10 w-10 rounded-full" />
            {!isCollapsed && (
              <div className="flex-1 space-y-2">
                <div className="bg-secondary h-4 w-3/4 rounded"></div>
                <div className="bg-secondary h-3 w-1/2 rounded"></div>
              </div>
            )}
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                className={cn(
                  "-mx-2 flex w-full cursor-pointer items-center gap-3 rounded-md p-2",
                  isCollapsed && "justify-center",
                )}
              >
                <div className="bg-secondary text-secondary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold uppercase">
                  {user?.name?.[0] ?? "U"}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-foreground truncate text-sm font-bold">
                      {user?.name ?? "Unknow"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {user?.email ?? "unknow"}
                    </p>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="right"
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuLabel>{t("userMenu.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t("userMenu.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("userMenu.settings")}</span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>{t("userMenu.theme")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={theme ?? "system"}
                      onValueChange={setTheme}
                    >
                      <DropdownMenuRadioItem value="light">
                        {t("userMenu.light")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        {t("userMenu.dark")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        {t("userMenu.system")}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t("userMenu.language")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={locale}
                      onValueChange={handleLanguageChange}
                    >
                      <DropdownMenuRadioItem value="vi">
                        {t("userMenu.vietnamese")}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="en">
                        {t("userMenu.english")}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("userMenu.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
};
