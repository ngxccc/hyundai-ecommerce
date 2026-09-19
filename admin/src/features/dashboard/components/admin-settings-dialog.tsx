"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "@/i18n/routing";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Palette,
  Globe,
  Shield,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { cn } from "cn";

export type SettingsTabKey = "account" | "appearance" | "language" | "security";

export interface AdminSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}

export function AdminSettingsDialog({
  open,
  onOpenChange,
  user,
}: AdminSettingsDialogProps) {
  const t = useTranslations("adminDashboard.settingsDialog");
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("account");

  const navItems: { key: SettingsTabKey; label: string; icon: typeof User }[] =
    useMemo(
      () => [
        { key: "account", label: t("tabs.profile"), icon: User },
        { key: "appearance", label: t("tabs.appearance"), icon: Palette },
        { key: "language", label: t("tabs.language"), icon: Globe },
        { key: "security", label: t("tabs.security"), icon: Shield },
      ],
      [t],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background flex max-h-[85vh] w-[94vw] flex-col gap-0 overflow-hidden border p-0 shadow-2xl sm:h-120 sm:max-w-2xl sm:flex-row sm:rounded-2xl lg:max-w-3xl"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>

        {/* Left Sidebar Menu */}
        <aside className="bg-muted/15 flex w-full shrink-0 flex-col justify-between border-b p-3.5 sm:w-45 sm:border-r sm:border-b-0">
          <div className="space-y-3">
            <span className="text-muted-foreground/70 px-2.5 text-[10px] font-semibold tracking-wider uppercase">
              {t("generalGroup")}
            </span>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <Button
                    key={item.key}
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      "h-8 w-full cursor-pointer justify-start gap-2 rounded-lg px-2.5 text-xs font-medium",
                      isActive
                        ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <section className="bg-background flex h-full flex-1 flex-col overflow-hidden">
          {/* Header Row */}
          <div className="border-border/40 flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-foreground text-sm font-bold capitalize">
              {t(`tabs.${activeTab === "account" ? "profile" : activeTab}`)}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer rounded-md"
              aria-label={t("close")}
            >
              <X className="size-3.5" />
            </Button>
          </div>

          {/* Lazy Tab Body Container */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "account" && <AccountTabPanel user={user} />}
            {activeTab === "appearance" && <AppearanceTabPanel />}
            {activeTab === "language" && <LanguageTabPanel />}
            {activeTab === "security" && <SecurityTabPanel />}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

/** 1. Account Tab Panel */
function AccountTabPanel({
  user,
}: {
  user: { fullName: string; email: string; role: string };
}) {
  const t = useTranslations("adminDashboard.settingsDialog.profile");

  return (
    <div className="divide-border/40 space-y-3 divide-y">
      {/* User Info Row */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full text-xs font-bold uppercase">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <p className="text-foreground text-xs leading-snug font-semibold">
              {user.fullName}
            </p>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[11px]">
              <Mail className="size-2.5" />
              {user.email}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="px-2 py-0.5 text-[10px] font-semibold uppercase"
        >
          {user.role}
        </Badge>
      </div>

      {/* Role Row */}
      <div className="flex items-center justify-between pt-3">
        <div className="space-y-0.5">
          <p className="text-foreground text-xs font-medium">{t("role")}</p>
          <p className="text-muted-foreground text-[11px]">
            {user.role === "ADMIN" ? t("badgeAdmin") : user.role}
          </p>
        </div>
      </div>
    </div>
  );
}

/** 2. Appearance Tab Panel */
function AppearanceTabPanel() {
  const t = useTranslations("adminDashboard.settingsDialog.appearance");
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* Light Option */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
          theme === "light"
            ? "border-primary bg-primary/5 shadow-xs"
            : "border-border/70 bg-card hover:bg-muted/30",
        )}
      >
        {theme === "light" && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-3.5 items-center justify-center rounded-full">
            <Check className="size-2" />
          </span>
        )}
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Sun className="size-4" />
        </div>
        <p className="text-foreground text-xs font-semibold">{t("light")}</p>
      </button>

      {/* Dark Option */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
          theme === "dark"
            ? "border-primary bg-primary/5 shadow-xs"
            : "border-border/70 bg-card hover:bg-muted/30",
        )}
      >
        {theme === "dark" && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-3.5 items-center justify-center rounded-full">
            <Check className="size-2" />
          </span>
        )}
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Moon className="size-4" />
        </div>
        <p className="text-foreground text-xs font-semibold">{t("dark")}</p>
      </button>

      {/* System Option */}
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={cn(
          "hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
          theme === "system"
            ? "border-primary bg-primary/5 shadow-xs"
            : "border-border/70 bg-card hover:bg-muted/30",
        )}
      >
        {theme === "system" && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-3.5 items-center justify-center rounded-full">
            <Check className="size-2" />
          </span>
        )}
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Laptop className="size-4" />
        </div>
        <p className="text-foreground text-xs font-semibold">{t("system")}</p>
      </button>
    </div>
  );
}

/** 3. Language Tab Panel */
function LanguageTabPanel() {
  const t = useTranslations("adminDashboard.settingsDialog.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (nextLocale: "vi" | "en") => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="space-y-2.5">
      {/* Vietnamese Row */}
      <div className="border-border/60 bg-card/60 flex items-center justify-between rounded-xl border px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🇻🇳</span>
          <p className="text-foreground text-xs font-semibold">{t("vi")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={locale === "vi" ? "default" : "outline"}
          onClick={() => handleLanguageChange("vi")}
          className="h-7 px-2.5 text-xs font-medium"
        >
          {locale === "vi" ? t("active") : t("select")}
        </Button>
      </div>

      {/* English Row */}
      <div className="border-border/60 bg-card/60 flex items-center justify-between rounded-xl border px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🇬🇧</span>
          <p className="text-foreground text-xs font-semibold">{t("en")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={locale === "en" ? "default" : "outline"}
          onClick={() => handleLanguageChange("en")}
          className="h-7 px-2.5 text-xs font-medium"
        >
          {locale === "en" ? t("active") : t("select")}
        </Button>
      </div>
    </div>
  );
}

/** 4. Security Tab Panel */
function SecurityTabPanel() {
  const t = useTranslations("adminDashboard.settingsDialog.security");

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-xs leading-relaxed">{t("notice")}</p>
    </div>
  );
}
