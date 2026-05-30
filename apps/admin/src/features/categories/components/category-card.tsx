"use client";

import { useTranslations } from "next-intl";
import { Edit, Trash } from "lucide-react";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Button } from "@nhatnang/ui/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { TCategory } from "@nhatnang/database/schemas";

import { useTransition } from "react";
import { deleteCategoryAction } from "../actions/category.actions";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { useRouter } from "next/navigation";

export const CategoryCard = ({ category }: { category: TCategory }) => {
  const t = useTranslations("AdminCategories.card");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = category.isActive ? "active" : "inactive";
  const image = category.image?.length ? category.image : "https://placehold.co/400x300/png?text=No+Image";

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this category?")) {
      startTransition(async () => {
        const result = await deleteCategoryAction(category.id);
        if (result.success) {
          toast.success("Category deleted successfully");
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to delete category");
        }
      });
    }
  };

  return (
    <Card className="group relative flex flex-col gap-0 p-3 shadow-sm">
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="secondary"
          className={`border-transparent font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="bg-muted relative mb-4 aspect-4/3 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={category.name}
          width={400}
          height={300}
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 dark:mix-blend-normal"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          {category.slug}
        </p>
        <h3 className="text-primary mb-1 line-clamp-2 text-base font-semibold">
          {category.name}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
          {category.description ?? "No description"}
        </p>

        <div className="mt-auto flex items-end justify-end">
          <div className="flex gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Link href={`/categories/${category.id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8 transition-colors"
                title={t("actions.edit")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/20 hover:text-destructive h-8 w-8 transition-colors"
              title={t("actions.delete")}
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
