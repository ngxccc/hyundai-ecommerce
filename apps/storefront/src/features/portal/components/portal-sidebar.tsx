"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nhatnang/ui/components/ui/sheet";
import { NavLinks } from "./nav-links";

export function PortalSidebar() {
  const t = useTranslations("Portal");
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Mobile Sticky Action Bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-white p-4 md:hidden">
        <span className="font-display text-sm font-bold tracking-tight text-zinc-800">
          {t("title")}
        </span>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-zinc-200">
              <Menu className="size-4" />
              {t("menu")}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6">
            <SheetHeader className="border-b pb-4 text-left">
              <SheetTitle className="font-display text-lg font-black tracking-tight text-zinc-900">
                {t("title")}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavLinks onClick={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
