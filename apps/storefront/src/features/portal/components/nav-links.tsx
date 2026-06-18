"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@nhatnang/ui/lib/utils";
import {
  User,
  Lock,
  MapPin,
  ClipboardList,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@nhatnang/database/auth-client";

const navItems = [
  { key: "profile", href: "/portal/profile", icon: User },
  { key: "password", href: "/portal/password", icon: Lock },
  { key: "addresses", href: "/portal/addresses", icon: MapPin },
  { key: "orders", href: "/portal/orders", icon: ClipboardList },
  { key: "debt", href: "/portal/debt", icon: CreditCard },
] as const;

interface NavLinksProps {
  onClick?: () => void;
  orientation?: "vertical" | "horizontal";
}

export function NavLinks({ onClick, orientation = "vertical" }: NavLinksProps) {
  const t = useTranslations("Portal.nav");
  const pathname = usePathname();
  const locale = useLocale();
  const isHorizontal = orientation === "horizontal";

  const handleLogout = async () => {
    try {
      onClick?.();
      await authClient.signOut();
      const loginPath = locale === "vi" ? "/login" : `/${locale}/login`;
      window.location.href = loginPath;
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <>
      {isHorizontal && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `,
          }}
        />
      )}
      <nav
        className={cn(
          isHorizontal
            ? "no-scrollbar flex w-full flex-row items-center overflow-x-auto border-b border-zinc-200"
            : "flex flex-col gap-1",
        )}
        style={
          isHorizontal
            ? { msOverflowStyle: "none", scrollbarWidth: "none" }
            : undefined
        }
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center transition-all duration-200",
                isHorizontal
                  ? cn(
                      "-mb-px shrink-0 gap-1.5 rounded-none border-b-2 px-4 py-2.5 text-xs font-semibold",
                      isActive
                        ? "border-zinc-900 font-bold text-zinc-900"
                        : "border-transparent text-zinc-500 hover:text-zinc-900",
                    )
                  : cn(
                      "gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-zinc-100 font-semibold text-zinc-900"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                    ),
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors duration-200",
                  isHorizontal
                    ? "text-current"
                    : isActive
                      ? "text-zinc-900"
                      : "text-zinc-400",
                )}
              />
              {t(item.key)}
            </Link>
          );
        })}
        {!isHorizontal && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
          >
            <LogOut className="size-4 text-red-600" />
            {t("logout")}
          </button>
        )}
      </nav>
    </>
  );
}
