"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function Header() {
  const t = useTranslations("HomePage");
  const navItems = ["products", "solutions", "services"] as const;

  return (
    <header className="bg-surface/90 fixed top-0 z-50 w-full shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            className="font-display text-primary text-2xl font-black tracking-tighter"
            href="/"
          >
            {t("brand")}
            <span className="text-on-surface ml-2 align-middle text-sm font-light tracking-widest opacity-60">
              {t("branchName")}
            </span>
          </Link>
          <nav className="hidden gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                className="font-display text-outline hover:text-primary text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
                href="/"
              >
                {t(`nav.${item}`)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="font-display text-on-surface hover:text-primary hidden text-xs font-bold tracking-widest uppercase transition-colors md:flex">
            {t("header.support")}
          </button>
          <button className="bg-primary hover:bg-primary/90 text-on-primary font-display shadow-primary/20 transform rounded-full px-6 py-3 text-[10px] font-bold tracking-widest uppercase shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            {t("header.requestQuote")}
          </button>
        </div>
      </div>
    </header>
  );
}
