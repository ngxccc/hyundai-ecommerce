import { getCachedSession } from "@/shared/lib/session";
import { getTranslations } from "next-intl/server";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Link } from "@/i18n/routing";
import { UserCircle } from "lucide-react";
import { HeaderCart } from "./header-cart";
import { MobileMenu } from "./mobile-menu";

export async function Header() {
  const t = await getTranslations("HomePage");
  const navItems = ["products", "solutions", "services"] as const;
  const ctaClasses =
    "font-display h-10 rounded-md px-4 text-xs font-bold uppercase tracking-widest transition-all duration-200";

  const session = await getCachedSession();
  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name;

  return (
    <header className="bg-background/90 supports-backdrop-blur:bg-background/60 border-border fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-10">
          <Link
            className="font-display text-primary focus-visible:ring-ring flex items-center gap-2 text-2xl font-black tracking-tighter transition-colors outline-none focus-visible:ring-2"
            href="/"
          >
            {t("brand")}
            <span className="text-muted-foreground hidden text-sm font-light tracking-widest sm:inline-block">
              {t("branchName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                className="font-display text-muted-foreground hover:text-primary focus-visible:ring-ring text-xs font-bold tracking-widest uppercase transition-all duration-300 outline-none hover:scale-105 focus-visible:ring-2"
                href={`/${item}`}
              >
                {t(`nav.${item}`)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4">
          <HeaderCart />

          {/* Desktop Auth Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <Button
                asChild
                variant="outline"
                className={`${ctaClasses} gap-2 border-zinc-200 bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`}
              >
                <Link href="/portal/profile">
                  <UserCircle className="size-4" />
                  {userName ?? t("header.myAccount")}
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className={`${ctaClasses} border-zinc-200 bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`}
                >
                  <Link href="/login">{t("header.login")}</Link>
                </Button>

                <Button asChild className={`${ctaClasses} shadow-md`}>
                  <Link href="/register">{t("header.register")}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <MobileMenu isLoggedIn={isLoggedIn} {...(userName && { userName })} />
          </div>
        </div>
      </div>
    </header>
  );
}
