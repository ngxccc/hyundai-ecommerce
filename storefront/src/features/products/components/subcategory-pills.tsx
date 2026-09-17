import { Link } from "@/i18n/routing";
import type { StorefrontCategoryWithChildren } from "@/services";
import { cn } from "cn";

interface SubcategoryPillsProps {
  categories: StorefrontCategoryWithChildren[];
  currentCategorySlug?: string | undefined;
  className?: string;
}

interface PillItem {
  id: string;
  name: string;
  href: string;
  isActive: boolean;
}

export function SubcategoryPills({
  categories,
  currentCategorySlug,
  className,
}: SubcategoryPillsProps) {
  if (categories.length === 0) return null;

  const pills: PillItem[] = [];

  if (!currentCategorySlug) {
    // We are on /products (All Products page)
    pills.push({
      id: "all",
      name: "Tất cả danh mục",
      href: "/products",
      isActive: true,
    });

    categories.forEach((cat) => {
      pills.push({
        id: cat.id,
        name: cat.name,
        href: `/categories/${cat.slug}`,
        isActive: false,
      });
    });
  } else {
    // Find current category or find parent if current is a subcategory
    let parentCat: StorefrontCategoryWithChildren | null = null;
    let targetCat: StorefrontCategoryWithChildren | null = null;

    for (const root of categories) {
      if (root.slug === currentCategorySlug) {
        targetCat = root;
        break;
      }
      const childMatch = root.children.find(
        (c) => c.slug === currentCategorySlug,
      );
      if (childMatch) {
        parentCat = root;
        targetCat = childMatch;
        break;
      }
    }

    if (parentCat) {
      // Current category is a child
      pills.push({
        id: `all-${parentCat.id}`,
        name: `Tất cả ${parentCat.name}`,
        href: `/categories/${parentCat.slug}`,
        isActive: false,
      });

      parentCat.children.forEach((child) => {
        pills.push({
          id: child.id,
          name: child.name,
          href: `/categories/${child.slug}`,
          isActive: child.slug === currentCategorySlug,
        });
      });
    } else if (targetCat && targetCat.children.length > 0) {
      // Current category is a parent with children
      pills.push({
        id: `all-${targetCat.id}`,
        name: `Tất cả ${targetCat.name}`,
        href: `/categories/${targetCat.slug}`,
        isActive: true,
      });

      targetCat.children.forEach((child) => {
        pills.push({
          id: child.id,
          name: child.name,
          href: `/categories/${child.slug}`,
          isActive: false,
        });
      });
    } else {
      // Flat category or root list
      pills.push({
        id: "all",
        name: "Tất cả sản phẩm",
        href: "/products",
        isActive: false,
      });

      categories.forEach((cat) => {
        pills.push({
          id: cat.id,
          name: cat.name,
          href: `/categories/${cat.slug}`,
          isActive: cat.slug === currentCategorySlug,
        });
      });
    }
  }

  return (
    <div
      className={cn(
        "flex w-full [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {pills.map((pill) => (
        <Link
          key={pill.id}
          href={pill.href}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all select-none",
            pill.isActive
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
          )}
        >
          {pill.name}
        </Link>
      ))}
    </div>
  );
}
