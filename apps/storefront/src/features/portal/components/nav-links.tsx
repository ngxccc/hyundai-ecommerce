"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@nhatnang/ui/lib/utils";
import {
  User,
  Lock,
  MapPin,
  ClipboardList,
  CreditCard,
  LogOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
}

export function NavLinks({ onClick }: NavLinksProps) {
  const t = useTranslations("Portal.nav");
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      onClick?.();
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-zinc-100 font-semibold text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                isActive ? "text-zinc-900" : "text-zinc-400",
              )}
            />
            {t(item.key)}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
      >
        <LogOut className="size-4 text-red-600" />
        {t("logout")}
      </button>
    </nav>
  );
}
