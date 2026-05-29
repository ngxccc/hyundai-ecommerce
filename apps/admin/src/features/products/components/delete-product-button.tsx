"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
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
import { deleteProductAction } from "../actions/product.actions";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export const DeleteProductButton = ({
  productId,
  productName,
}: DeleteProductButtonProps) => {
  const t = useTranslations("AdminProducts");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(productId);

      if (result.success) {
        toast.success(t("messages.deleteSuccess"));
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
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialogs.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialogs.delete.description", { productName })}
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
