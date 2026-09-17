"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "system" | "light" | "dark"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium text-xs",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:text-muted-foreground group-[.toast]:border-border hover:group-[.toast]:text-foreground",
          success:
            "group-[.toaster]:border-emerald-500/20 [&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400",
          error:
            "group-[.toaster]:border-destructive/30 [&_[data-icon]]:text-destructive",
          warning:
            "group-[.toaster]:border-amber-500/30 [&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400",
          info: "group-[.toaster]:border-blue-500/30 [&_[data-icon]]:text-blue-600 dark:[&_[data-icon]]:text-blue-400",
        },
      }}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
        ),
        info: <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
        ),
        error: <OctagonXIcon className="text-destructive size-4" />,
        loading: <Loader2Icon className="text-primary size-4 animate-spin" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
