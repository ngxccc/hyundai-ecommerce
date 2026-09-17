"use client";

import { useTransition, useState } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
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
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export interface EntityDeleteButtonProps {
  entityId: string;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  dialogTitle: string;
  dialogDescription: string;
  successMessage: string;
  errorMessage: string;
  cancelLabel?: string;
  confirmLabel?: string;
  deletingLabel?: string;
  buttonTooltip?: string;
}

/**
 * Reusable Enterprise Entity Deletion Button with Confirmation Alert Dialog.
 * Enforces AHA Rule of Three across Brand, Category, Warehouse, and Product deletion flows.
 */
export function EntityDeleteButton({
  entityId,
  onDelete,
  dialogTitle,
  dialogDescription,
  successMessage,
  errorMessage,
  cancelLabel = "Hủy",
  confirmLabel = "Xóa",
  deletingLabel = "Đang xóa...",
  buttonTooltip,
}: EntityDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await onDelete(entityId);

      if (result.success) {
        toast.success(successMessage);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/20 hover:text-destructive h-8 w-8 transition-colors"
          title={buttonTooltip}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? deletingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
