import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { cn } from "@nhatnang/ui/lib/utils";

interface SectionCardProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
}

export function SectionCard({
  title,
  icon,
  children,
  className,
  contentClassName,
  headerClassName,
  titleClassName,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-xl border border-zinc-200 p-0 shadow-sm",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-col gap-0 border-b bg-zinc-50/50 p-4!",
          headerClassName,
        )}
      >
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-base font-semibold text-zinc-900",
            titleClassName,
          )}
        >
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
