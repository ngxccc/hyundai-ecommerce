"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export interface LocaleTabsProps {
  activeLocale: "vi" | "en";
  onLocaleChange: (locale: "vi" | "en") => void;
  hasErrors?: {
    vi?: boolean;
    en?: boolean;
  };
  className?: string;
}

export function LocaleTabs({
  activeLocale,
  onLocaleChange,
  hasErrors,
  className,
}: LocaleTabsProps) {
  const t = useTranslations("adminProductForm");

  return (
    <Tabs
      value={activeLocale}
      onValueChange={(val) => onLocaleChange(val as "vi" | "en")}
      className={className ?? "w-auto"}
    >
      <TabsList className="h-8 p-0.5">
        <TabsTrigger value="vi" className="h-7 px-2.5 text-xs">
          🇻🇳 {t("tabs.vi")}
          {hasErrors?.vi && (
            <span className="bg-destructive ml-1.5 size-1.5 rounded-full" />
          )}
        </TabsTrigger>
        <TabsTrigger value="en" className="h-7 px-2.5 text-xs">
          🇬🇧 {t("tabs.en")}
          {hasErrors?.en && (
            <span className="bg-destructive ml-1.5 size-1.5 rounded-full" />
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
