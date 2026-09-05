"use client";

import { useState, useEffect, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, Plus, Check, Zap, Package } from "lucide-react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { isCloudinaryUrl } from "@/shared/utils";
import type { ProductDTO } from "@/shared/types/admin-schema.types";
import { searchProductsAction } from "@/features/products/actions";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface ProductSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProduct?: (product: ProductDTO) => void;
  trigger?: ReactNode;
}

export const ProductSearchModal = ({
  open,
  onOpenChange,
  onSelectProduct,
}: ProductSearchModalProps) => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (
    key: string,
    params?: Record<string, unknown>,
  ) => string;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const addProductToDraft = useQuoteDraftStore((state) => state.addProduct);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(isOpen);
  };

  // Debounced search query execution (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || !open) {
      return;
    }

    const timer = setTimeout(() => {
      startSearchTransition(async () => {
        const response = await searchProductsAction(trimmed, 8);
        if (response.success) {
          setResults(response.data);
        } else {
          toast.error(response.error);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (product: ProductDTO) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      addProductToDraft(product);
      toast.success(
        translate("searchModal.productAddedToast", { name: product.nameVi }),
      );
    }

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
  };

  const formatPrice = (priceStr: string | null) => {
    const num = parseFloat(priceStr ?? "0");
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const extractModelAndPower = (product: ProductDTO) => {
    const specs = product.specs ?? {};
    const model = typeof specs.model === "string" ? specs.model : product.slug;
    const power = specs.power ?? specs.standbyPowerKva ?? specs.primePowerKva;
    const phase = specs.phase;

    const powerStr =
      typeof power === "number" || typeof power === "string"
        ? `${power}kVA`
        : null;
    const phaseStr =
      typeof phase === "string"
        ? phase === "1phase"
          ? "1 Pha"
          : phase === "3phase"
            ? "3 Pha"
            : phase
        : null;

    return {
      model,
      power: powerStr,
      phase: phaseStr,
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Search className="text-primary h-5 w-5" />
            {translate("searchModal.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {translate("searchModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 border-b p-4">
          <div className="relative flex items-center">
            <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translate("searchModal.inputPlaceholder")}
              className="bg-background focus-visible:ring-primary h-11 pr-9 pl-9 text-sm font-medium shadow-xs"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="text-muted-foreground absolute right-3 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        <div className="divide-border/60 max-h-[380px] min-h-[160px] divide-y overflow-y-auto p-2">
          {isSearching && results.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12">
              <Loader2 className="text-primary h-6 w-6 animate-spin" />
              <p className="text-xs">{translate("searchModal.searching")}</p>
            </div>
          ) : results.length > 0 ? (
            results.map((product) => {
              const { model, power, phase } = extractModelAndPower(product);
              const image = product.images?.[0];
              const inStock = (product.totalStockCache ?? 0) > 0;
              const isJustAdded = recentlyAddedId === product.id;

              return (
                <div
                  key={product.id}
                  className="hover:bg-muted/50 group flex items-center justify-between gap-3 rounded-lg p-3 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-md border">
                      {image && isCloudinaryUrl(image) ? (
                        <CldImage
                          src={image}
                          alt={product.nameVi}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : image ? (
                        <Image
                          src={image}
                          alt={product.nameVi}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground max-w-xs truncate text-sm font-semibold">
                          {product.nameVi}
                        </span>
                        {model && (
                          <Badge
                            variant="outline"
                            className="bg-background px-1.5 py-0 font-mono text-[10px] uppercase"
                          >
                            {model}
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        {power && (
                          <span className="flex items-center gap-0.5 font-medium text-orange-600 dark:text-orange-400">
                            <Zap className="h-3 w-3" />
                            {power}
                          </span>
                        )}
                        {phase && <span>• {phase}</span>}
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            inStock
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {inStock
                            ? translate("searchModal.inStock", {
                                count: product.totalStockCache,
                              })
                            : translate("searchModal.outOfStock")}
                        </span>
                      </div>

                      <div className="text-primary mt-0.5 text-sm font-bold">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isJustAdded ? "secondary" : "default"}
                    onClick={() => handleSelect(product)}
                    className="shrink-0 gap-1.5 font-medium shadow-xs"
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        {translate("searchModal.added")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        {translate("searchModal.select")}
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-1 py-10">
              <p className="text-sm font-medium">
                {translate("searchModal.noResults")}
              </p>
              <p className="text-xs">
                {translate("searchModal.noResultsHint")}
              </p>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-1 py-10">
              <Search className="text-muted-foreground/40 h-8 w-8 stroke-1" />
              <p className="mt-1 text-xs">
                {translate("searchModal.emptyPrompt")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
