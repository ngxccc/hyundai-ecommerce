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
} from "@nhatnang/ui/components/ui/dialog";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { isCloudinaryUrl } from "@/shared/utils";
import type { ProductDTO } from "@nhatnang/database/dtos";
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
    const specs = (product.specs ?? {}) as Record<string, unknown>;
    const model =
      typeof specs["model"] === "string" ? specs["model"] : product.slug;
    const power =
      specs["power"] ??
      specs["standbyPowerKva"] ??
      specs["primePowerKva"];
    const phase = specs["phase"];

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
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="p-4 pb-3 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {translate("searchModal.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {translate("searchModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/30 border-b">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translate("searchModal.inputPlaceholder")}
              className="pl-9 pr-9 h-11 bg-background text-sm font-medium focus-visible:ring-primary shadow-xs"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="max-h-[380px] min-h-[160px] overflow-y-auto p-2 divide-y divide-border/60">
          {isSearching && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
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
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-6 w-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground truncate max-w-xs">
                          {product.nameVi}
                        </span>
                        {model && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono px-1.5 py-0 uppercase bg-background"
                          >
                            {model}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {power && (
                          <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400 font-medium">
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

                      <div className="text-sm font-bold text-primary mt-0.5">
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
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-1">
              <p className="text-sm font-medium">
                {translate("searchModal.noResults")}
              </p>
              <p className="text-xs">
                {translate("searchModal.noResultsHint")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-1">
              <Search className="h-8 w-8 text-muted-foreground/40 stroke-1" />
              <p className="text-xs mt-1">
                {translate("searchModal.emptyPrompt")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
