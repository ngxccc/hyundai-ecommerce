import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface CategoryHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export async function CategoryHeader({
  title,
  description,
  showAddButton = true,
}: CategoryHeaderProps) {
  const t = await getTranslations("adminCategories.header");

  return (
    <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {showAddButton && (
        <Button asChild variant="default" className="gap-2 shadow-xs">
          <Link href="/categories/new">
            <Plus className="size-4" />
            <span>{t("addCategory")}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
