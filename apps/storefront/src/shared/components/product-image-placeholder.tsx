import { ImageOff } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";
import { useTranslations } from "next-intl";

interface ProductImagePlaceholderProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function ProductImagePlaceholder({
  className,
  iconClassName,
  showText = false,
}: ProductImagePlaceholderProps) {
  const t = useTranslations("Common");

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 text-zinc-400 select-none",
        className,
      )}
    >
      <ImageOff className={cn("size-6 stroke-[1.5]", iconClassName)} />
      {showText && (
        <span className="mt-1 text-[10px] font-medium tracking-wider uppercase">
          {t("noImage")}
        </span>
      )}
    </div>
  );
}
