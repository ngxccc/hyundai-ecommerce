"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Edit, Package, FilePlus, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { canUseCldImage } from "@/lib";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "@/components/ui/sonner";
import type { ProductGridItem } from "../product-form-types";
import { deleteProductAction } from "../actions/product.actions";
import { useQuoteDraftStore } from "@/features/quotes/stores";
import { cn } from "cn";
import { formatCurrency } from "@/lib/utils";
export const ProductCard = ({ product }: { product: ProductGridItem }) => {
  const t = useTranslations("adminProducts");
  const router = useRouter();
  const addProductToDraft = useQuoteDraftStore((s) => s.addProduct);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOutOfStock = product.totalStockCache <= 0;
  const statusKey = isOutOfStock ? "outOfStock" : "active";

  const image =
    product.images[0] || "https://placehold.co/400x300/png?text=No+Image";

  const formattedPrice = formatCurrency(product.price);

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addProductToDraft(product);

    toast.success(
      t("card.actions.addedToQuoteSuccess", { name: product.name }),
      {
        action: {
          label: t("card.actions.viewQuoteDraft"),
          onClick: () => router.push("/quotes/new"),
        },
      },
    );
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if (result.success) {
        toast.success(t("messages.deleteSuccess"));
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? t("messages.deleteError"));
      }
    });
  };

  return (
    <>
      <Card
        size="dense"
        className="group relative justify-between overflow-hidden transition-all duration-200 hover:shadow-md"
      >
        {/* Top Edge-to-Edge Image Container with Link */}
        <div className="border-border/60 bg-muted/20 relative aspect-4/3 w-full overflow-hidden border-b">
          <Link
            href={`/products/${product.id}/edit`}
            className="relative block h-full w-full focus-visible:outline-none"
            tabIndex={-1}
          >
            {canUseCldImage(image) ? (
              <CldImage
                src={image}
                alt={product.name}
                width={400}
                height={300}
                className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            ) : (
              <Image
                src={image}
                alt={product.name}
                width={400}
                height={300}
                unoptimized
                className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            )}
          </Link>

          {/* Floating Badges & Action Menu */}
          <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 z-10 flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn(
                "bg-background/85 pointer-events-auto px-2.5 py-0.5 text-xs font-medium shadow-xs backdrop-blur-md",
                isOutOfStock
                  ? "border-destructive/40 text-destructive"
                  : "border-border/80 text-foreground",
              )}
            >
              {t(`card.status.${statusKey}`)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="border-border/40 bg-background/85 text-muted-foreground hover:bg-background hover:text-foreground pointer-events-auto size-7 rounded-full border shadow-xs backdrop-blur-md focus-visible:ring-1"
                  aria-label={t("card.actions.edit")}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="cursor-pointer gap-2"
                  >
                    <Edit className="size-4" />
                    <span>{t("card.actions.edit")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/products/${product.id}/inventory`}
                    className="cursor-pointer gap-2"
                  >
                    <Package className="size-4" />
                    <span>{t("card.actions.inventory")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsDeleteDialogOpen(true)}
                  variant="destructive"
                  className="text-destructive focus:text-destructive cursor-pointer gap-2"
                >
                  <Trash2 className="size-4" />
                  <span>{t("card.actions.delete")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Content Body */}
        <CardContent size="compact" className="flex flex-1 flex-col p-3.5 pt-2">
          <div className="mb-2">
            <p className="text-muted-foreground font-mono text-xs font-medium">
              {product.slug}
            </p>
            <h3 className="text-foreground hover:text-primary line-clamp-2 text-sm font-semibold tracking-tight">
              <Link href={`/products/${product.id}/edit`}>{product.name}</Link>
            </h3>
          </div>

          {/* Footer: Price, Stock & Primary Action */}
          <CardFooter
            size="compact"
            className="border-border/50 mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-2 border-t pt-2.5"
          >
            <div className="min-w-fit">
              <p
                className={cn(
                  "mb-0.5 text-xs",
                  isOutOfStock
                    ? "text-destructive font-medium"
                    : "text-muted-foreground",
                )}
              >
                {t("card.stock", { count: String(product.totalStockCache) })}
              </p>
              <p className="text-primary text-base font-bold sm:text-lg">
                {product.isQuoteOnly ? t("card.contact") : formattedPrice}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddToQuote}
              className="hover:bg-primary hover:text-primary-foreground hover:border-primary h-8 gap-1.5 px-2.5 text-xs font-medium shadow-2xs transition-colors"
              title={t("card.actions.addToQuote")}
            >
              <FilePlus className="size-3.5" />
              <span>{t("card.actions.addToQuote")}</span>
            </Button>
          </CardFooter>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.delete.description", { productName: product.name })}
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
    </>
  );
};
