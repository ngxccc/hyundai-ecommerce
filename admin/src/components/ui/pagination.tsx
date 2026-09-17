import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "cn";
import { buttonVariants, type Button } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  asChild?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  asChild = false,
  ...props
}: PaginationLinkProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

type PaginationNavProps = PaginationLinkProps & {
  label?: string;
};

function PaginationPrevious({
  className,
  label = "Previous",
  asChild,
  children,
  ...props
}: PaginationNavProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    return (
      <PaginationLink
        aria-label="Go to previous page"
        size="default"
        asChild
        className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
        {...props}
      >
        {React.cloneElement(
          child,
          {
            className: cn(child.props.className),
          },
          <>
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">
              {child.props.children ?? label}
            </span>
          </>,
        )}
      </PaginationLink>
    );
  }

  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      asChild={asChild}
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:inline">{children ?? label}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label = "Next",
  asChild,
  children,
  ...props
}: PaginationNavProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    return (
      <PaginationLink
        aria-label="Go to next page"
        size="default"
        asChild
        className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
        {...props}
      >
        {React.cloneElement(
          child,
          {
            className: cn(child.props.className),
          },
          <>
            <span className="hidden sm:inline">
              {child.props.children ?? label}
            </span>
            <ChevronRightIcon className="size-4" />
          </>,
        )}
      </PaginationLink>
    );
  }

  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      asChild={asChild}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:inline">{children ?? label}</span>
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
