"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
  {
    variants: {
      size: {
        default: "gap-6 py-6",
        dense: "gap-0",
        compact: "gap-0 p-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:grid-rows-[auto_auto]",
  {
    variants: {
      size: {
        default: "px-6 [.border-b]:pb-6",
        dense: "px-4 py-2.5",
      },
      bordered: {
        true: "border-b group-data-[state=closed]/card:border-b-0",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      bordered: false,
    },
  },
);

const cardContentVariants = cva("", {
  variants: {
    size: {
      default: "px-6",
      dense: "space-y-4 p-4",
      compact: "p-0",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const cardTitleVariants = cva(
  "flex items-center gap-2 leading-none font-semibold [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      size: {
        default:
          "text-sm font-semibold text-foreground [&_svg:not([class*='size-']):not([class*='h-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        lg: "text-[15px] font-semibold text-foreground [&_svg:not([class*='size-']):not([class*='h-'])]:size-4.5 [&_svg:not([class*='text-'])]:text-muted-foreground",
        xl: "text-lg font-bold text-foreground [&_svg:not([class*='size-']):not([class*='h-'])]:size-5 [&_svg:not([class*='text-'])]:text-primary",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const CardCollapseContext = React.createContext<{
  collapsible: boolean;
  isOpen?: boolean;
  toggle?: () => void;
}>({
  collapsible: false,
});

export interface CardProps
  extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Card({
  className,
  size,
  collapsible = false,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: CardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen =
    controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const toggle = React.useCallback(() => {
    handleOpenChange(!isOpen);
  }, [isOpen, handleOpenChange]);

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={handleOpenChange} asChild>
        <div
          data-slot="card"
          data-collapsible={collapsible}
          className={cn("group/card", cardVariants({ size }), className)}
          {...props}
        >
          <CardCollapseContext.Provider
            value={{ collapsible: true, isOpen, toggle }}
          >
            {children}
          </CardCollapseContext.Provider>
        </div>
      </Collapsible>
    );
  }

  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof cardHeaderVariants> {}

function CardHeader({
  className,
  size,
  bordered,
  children,
  onClick,
  ...props
}: CardHeaderProps) {
  const { collapsible, toggle } = React.useContext(CardCollapseContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (!collapsible || !toggle || e.defaultPrevented) return;

    const target = e.target as HTMLElement | null;
    if (
      target?.closest(
        "button, input, select, textarea, a, [role='tab'], [role='combobox'], [data-slot='tabs'], [data-slot='select-trigger']",
      )
    ) {
      return;
    }

    toggle();
  };

  return (
    <div
      data-slot="card-header"
      className={cn(
        cardHeaderVariants({ size, bordered }),
        collapsible && "cursor-pointer select-none",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {collapsible ? (
        <div className="flex w-full items-center justify-between gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
              aria-label="Thu gọn / Mở rộng"
            >
              <ChevronDown className="size-4.5 transition-transform duration-200 group-data-[state=closed]/card:rotate-0 group-data-[state=open]/card:rotate-180" />
            </button>
          </CollapsibleTrigger>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export interface CardTitleProps
  extends React.ComponentProps<"div">, VariantProps<typeof cardTitleVariants> {}

function CardTitle({ className, size, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

export interface CardContentProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof cardContentVariants> {}

function CardContent({
  className,
  size,
  children,
  ...props
}: CardContentProps) {
  const { collapsible } = React.useContext(CardCollapseContext);

  const content = (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  );

  if (collapsible) {
    return <CollapsibleContent>{content}</CollapsibleContent>;
  }

  return content;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardContentVariants,
};
