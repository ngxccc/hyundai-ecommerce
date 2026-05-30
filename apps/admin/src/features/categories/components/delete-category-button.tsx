"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@nhatnang/ui/components/ui/alert-dialog";
import { deleteCategoryAction } from "../actions/category.actions";
import { useRouter } from "next/navigation";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
}

export const DeleteCategoryButton = ({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) => {
  const t = useTranslations("AdminCategories");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (result.success) {
        toast.success(t("messages.deleteSuccess"));
        router.refresh();
      } else {
        toast.error(result.error ?? t("messages.deleteError"));
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/20 hover:text-destructive h-8 w-8 transition-colors"
          title={t("card.actions.delete")}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialogs.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialogs.delete.description", { categoryName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("dialogs.delete.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending
              ? t("dialogs.delete.deleting")
              : t("dialogs.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
