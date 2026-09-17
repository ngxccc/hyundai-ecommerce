import { ImageOff } from "lucide-react";
import { cn } from "cn";

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
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground/60 flex size-full flex-col items-center justify-center select-none",
        className,
      )}
    >
      <ImageOff className={cn("size-4 stroke-[1.5]", iconClassName)} />
      {showText && (
        <span className="text-muted-foreground mt-1 text-[10px] font-medium tracking-wider uppercase">
          No Image
        </span>
      )}
    </div>
  );
}
