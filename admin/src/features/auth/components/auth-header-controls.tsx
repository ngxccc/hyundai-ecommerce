"use client";

import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Moon, Sun } from "lucide-react";

export const AuthHeaderControls = () => {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: "vi" | "en") => {
    router.replace(pathname, { locale: newLocale });
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 gap-1.5 px-2.5 text-xs font-medium"
          >
            <Globe className="size-3.5" />
            <span className="uppercase">{locale}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          <DropdownMenuItem
            onClick={() => handleLanguageChange("vi")}
            className={locale === "vi" ? "text-primary font-bold" : ""}
          >
            Tiếng Việt (VI)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange("en")}
            className={locale === "en" ? "text-primary font-bold" : ""}
          >
            English (EN)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Switcher */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-8"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
    </div>
  );
};
