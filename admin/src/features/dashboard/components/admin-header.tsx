"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminHeader = () => {
  const t = useTranslations("adminDashboard");

  return (
    <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {t("header.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("header.description")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="flex items-center gap-2 font-medium shadow-xs"
          variant="default"
        >
          <Plus className="size-4" />
          <span>{t("header.createReport")}</span>
        </Button>
      </div>
    </div>
  );
};
