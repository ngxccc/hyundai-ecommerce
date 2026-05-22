import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/i18n/routing";

export function Header() {
  const t = useTranslations("HomePage");
  const navItems = ["products", "solutions", "services"] as const;
  const ctaClasses =
    "font-display h-10 rounded-md px-4 text-xs font-bold uppercase tracking-widest transition-all duration-200";

  return (
    <header className="bg-background/90 supports-backdrop-blur:bg-background/60 border-border fixed top-0 z-50 w-full border-b backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-10">
          <Link
            className="font-display text-primary focus-visible:ring-ring flex items-center gap-2 text-2xl font-black tracking-tighter transition-colors outline-none focus-visible:ring-2"
            href="/"
            aria-label="Go to homepage"
          >
            {t("brand")}
            <span className="text-muted-foreground hidden text-sm font-light tracking-widest opacity-80 sm:inline-block">
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
          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
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
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle mobile menu"
          >
            <Menu className="text-foreground size-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
