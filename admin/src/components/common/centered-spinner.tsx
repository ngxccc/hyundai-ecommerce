import { Loader2 } from "lucide-react";
import { cn } from "cn";

interface CenteredSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "screen" | "content";
}

export function CenteredSpinner({
  className,
  size = "default",
  variant = "content",
}: CenteredSpinnerProps) {
  const sizeClasses = {
    sm: "size-5",
    default: "size-8",
    lg: "size-10",
  };

  const variantClasses = {
    screen: "min-h-[100dvh] w-full",
    content: "flex-1 min-h-[calc(100dvh-12rem)] w-full",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variantClasses[variant],
        className,
      )}
    >
      <Loader2
        className={cn("text-muted-foreground animate-spin", sizeClasses[size])}
      />
    </div>
  );
}
