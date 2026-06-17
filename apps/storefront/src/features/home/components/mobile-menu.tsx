"use client";

import { useState } from "react";
import { Menu, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@nhatnang/ui/components/ui/sheet";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { authClient } from "@nhatnang/database/auth-client";

interface MobileMenuProps {
  isLoggedIn: boolean;
  userName?: string;
}

export function MobileMenu({ isLoggedIn, userName }: MobileMenuProps) {
  const t = useTranslations("HomePage");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navItems = ["products", "solutions", "services"] as const;
  const ctaClasses =
    "font-display h-10 rounded-md px-4 text-xs font-bold uppercase tracking-widest transition-all duration-200";

  const close = () => setIsOpen(false);

  const handleLogout = async () => {
    close();
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="text-foreground size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full w-70 flex-col p-6 sm:w-[320px]"
      >
        <SheetHeader className="border-b pb-4 text-left">
          <SheetTitle>
            <Link
              className="font-display text-primary flex items-center gap-2 text-xl font-black tracking-tighter"
              href="/"
              onClick={(e) => {
                close();
                if (pathname === "/") {
                  e.preventDefault();
                }
              }}
            >
              {t("brand")}
              <span className="text-muted-foreground ml-1 text-xs font-light tracking-widest">
                {t("branchName")}
              </span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Mobile navigation menu
          </SheetDescription>
        </SheetHeader>

        {/* Navigation List */}
        <nav className="flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item}
              className="font-display text-muted-foreground hover:text-primary focus-visible:ring-ring text-sm font-bold tracking-widest uppercase transition-all duration-300 outline-none hover:pl-2"
              href={`/${item}`}
              onClick={(e) => {
                close();
                if (pathname === `/${item}`) {
                  e.preventDefault();
                }
              }}
            >
              {t(`nav.${item}`)}
            </Link>
          ))}
        </nav>

        {/* Actions Area */}
        <div className="mt-auto flex flex-col gap-3 border-t border-zinc-100 pt-6">
          {isLoggedIn ? (
            <>
              <Button
                asChild
                variant="outline"
                className={`${ctaClasses} w-full gap-2 border-zinc-200 bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`}
                onClick={close}
              >
                <Link href="/portal/profile">
                  <UserCircle className="size-4" />
                  {userName ?? t("header.myAccount")}
                </Link>
              </Button>

              <Button
                variant="ghost"
                className={`${ctaClasses} w-full text-red-600 hover:bg-red-50 hover:text-red-700`}
                onClick={handleLogout}
              >
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className={`${ctaClasses} w-full border-zinc-200 bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`}
                onClick={(e) => {
                  close();
                  if (pathname === "/login") {
                    e.preventDefault();
                  }
                }}
              >
                <Link href="/login">{t("header.login")}</Link>
              </Button>

              <Button
                asChild
                className={`${ctaClasses} w-full shadow-md`}
                onClick={(e) => {
                  close();
                  if (pathname === "/register") {
                    e.preventDefault();
                  }
                }}
              >
                <Link href="/register">{t("header.register")}</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
