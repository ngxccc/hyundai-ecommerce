"use client";

import { useTranslations } from "next-intl";
import { NavLinks } from "./nav-links";

export function PortalSidebar() {
  const t = useTranslations("Portal");

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 md:flex">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-display mb-4 px-3 text-xs font-bold tracking-wider text-zinc-400 uppercase">
            {t("title")}
          </h2>
          <NavLinks />
        </div>
      </aside>

      {/* Mobile Horizontal Navigation Tab Bar */}
      <div className="md:hidden">
        <NavLinks orientation="horizontal" />
      </div>
    </>
  );
}
