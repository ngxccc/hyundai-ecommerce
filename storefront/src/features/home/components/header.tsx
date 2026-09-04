import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { HeaderQuote } from "@/features/quote";
import { MobileMenu } from "./mobile-menu";

export async function Header() {
  const t = await getTranslations("HomePage");
  const navItems = ["products", "solutions", "services"] as const;
  const ctaClasses =
    "font-display h-10 rounded-md px-4 text-xs font-bold uppercase tracking-widest transition-all duration-200";

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
          <HeaderQuote />

          <div className="hidden items-center gap-3 md:flex">
            <Button
              asChild
              className={`${ctaClasses} bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm`}
            >
              <Link href="/products">{t("nav.products")}</Link>
            </Button>
          </div>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
