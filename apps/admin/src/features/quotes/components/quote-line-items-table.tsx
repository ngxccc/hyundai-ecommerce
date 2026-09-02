"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Package,
  Plus,
  Trash2,
  Search,
  Wrench,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@nhatnang/ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@nhatnang/ui/components/ui/dialog";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Label } from "@nhatnang/ui/components/ui/label";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { isCloudinaryUrl } from "@/shared/utils";
import { ProductSearchModal } from "./product-search-modal";
import {
  useQuoteDraftStore,
  type AdminQuoteDraftItem,
} from "../stores/quote-draft.store";

export const QuoteLineItemsTable = () => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (key: string, params?: Record<string, unknown>) => string;

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);

  // Custom Item Form State
  const [customName, setCustomName] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customSpecs, setCustomSpecs] = useState("");
  const [customPrice, setCustomPrice] = useState("0");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customDiscount, setCustomDiscount] = useState("0");

  const items = useQuoteDraftStore((state) => state.items);
  const updateItem = useQuoteDraftStore((state) => state.updateItem);
  const removeItem = useQuoteDraftStore((state) => state.removeItem);
  const addCustomItem = useQuoteDraftStore((state) => state.addCustomItem);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addCustomItem({
      itemName: customName.trim(),
      itemModel: customModel.trim() || null,
      itemSpecs: customSpecs.trim() || null,
      unitPrice: parseFloat(customPrice) || 0,
      quantity: Math.max(1, parseInt(customQuantity, 10) || 1),
      discountPercent: Math.min(100, Math.max(0, parseFloat(customDiscount) || 0)),
    });

    // Reset form
    setCustomName("");
    setCustomModel("");
    setCustomSpecs("");
    setCustomPrice("0");
    setCustomQuantity("1");
    setCustomDiscount("0");
    setIsCustomItemModalOpen(false);
  };

  const calculateLineMetrics = (item: AdminQuoteDraftItem) => {
    const finalUnit = item.unitPrice * (1 - item.discountPercent / 100);
    const lineTotal = finalUnit * item.quantity;
    return { finalUnit, lineTotal };
  };

  return (
    <>
      <Card className="shadow-xs border border-border">
        <CardHeader className="p-4 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              {translate("composer.items.title")}
              <Badge variant="secondary" className="font-mono text-xs px-1.5">
                {items.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {translate("composer.items.description")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCustomItemModalOpen(true)}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Wrench className="h-3.5 w-3.5" />
              {translate("composer.items.addCustomItem")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsSearchModalOpen(true)}
              className="gap-1.5 h-8 text-xs font-medium shadow-xs"
            >
              <Search className="h-3.5 w-3.5" />
              {translate("composer.items.searchCatalog")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-muted-foreground stroke-1" />
              </div>
              <h4 className="text-sm font-semibold">
                {translate("composer.items.emptyTitle")}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                {translate("composer.items.emptyDescription")}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Search className="h-3.5 w-3.5" />
                  {translate("composer.items.searchCatalog")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomItemModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {translate("composer.items.addCustomItem")}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead className="min-w-[240px]">
                    {translate("composer.items.colItem")}
                  </TableHead>
                  <TableHead className="w-20 text-center">
                    {translate("composer.items.colQty")}
                  </TableHead>
                  <TableHead className="w-32 text-right">
                    {translate("composer.items.colUnitPrice")}
                  </TableHead>
                  <TableHead className="w-24 text-center">
                    {translate("composer.items.colDiscount")}
                  </TableHead>
                  <TableHead className="w-32 text-right">
                    {translate("composer.items.colFinalPrice")}
                  </TableHead>
                  <TableHead className="w-36 text-right">
                    {translate("composer.items.colTotal")}
                  </TableHead>
                  <TableHead className="w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-xs">
                {items.map((item, index) => {
                  const { finalUnit, lineTotal } = calculateLineMetrics(item);

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            {item.image && isCloudinaryUrl(item.image) ? (
                              <CldImage
                                src={item.image}
                                alt={item.itemName}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : item.image ? (
                              <Image
                                src={item.image}
                                alt={item.itemName}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                {item.isCustomItem ? (
                                  <Sparkles className="h-4 w-4" />
                                ) : (
                                  <Package className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-foreground truncate max-w-xs">
                                {item.itemName}
                              </span>
                              {item.isCustomItem ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                >
                                  {translate("composer.items.customTag")}
                                </Badge>
                              ) : item.itemModel ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] font-mono px-1 py-0 h-4"
                                >
                                  {item.itemModel}
                                </Badge>
                              ) : null}
                            </div>
                            {item.itemSpecs && (
                              <span className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                                {item.itemSpecs}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Quantity Input */}
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, {
                              quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                            })
                          }
                          className="h-8 w-16 text-center font-medium mx-auto text-xs"
                        />
                      </TableCell>

                      {/* Unit Price Input */}
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="10000"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(item.id, {
                              unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="h-8 w-28 text-right font-medium ml-auto text-xs"
                        />
                      </TableCell>

                      {/* Discount % Input */}
                      <TableCell className="text-center">
                        <div className="relative inline-flex items-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) =>
                              updateItem(item.id, {
                                discountPercent: Math.min(
                                  100,
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                ),
                              })
                            }
                            className="h-8 w-16 pr-5 text-right font-medium text-xs"
                          />
                          <span className="absolute right-2 text-muted-foreground text-[10px] pointer-events-none">
                            %
                          </span>
                        </div>
                      </TableCell>

                      {/* Final Unit Price */}
                      <TableCell className="text-right font-medium text-muted-foreground">
                        {formatVND(finalUnit)}
                      </TableCell>

                      {/* Total Line Amount */}
                      <TableCell className="text-right font-bold text-foreground">
                        {formatVND(lineTotal)}
                      </TableCell>

                      {/* Delete Action */}
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product Search Catalog Modal */}
      <ProductSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />

      {/* Ad-hoc Custom Item Creation Modal */}
      <Dialog open={isCustomItemModalOpen} onOpenChange={setIsCustomItemModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddCustomItem}>
            <DialogHeader className="pb-3 border-b">
              <DialogTitle className="text-base font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                {translate("composer.items.customModal.title")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {translate("composer.items.customModal.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label htmlFor="customName" className="font-semibold text-xs">
                  {translate("composer.items.customModal.nameLabel")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={translate("composer.items.customModal.namePlaceholder")}
                  className="h-8 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="customModel" className="font-semibold text-xs">
                    {translate("composer.items.customModal.modelLabel")}
                  </Label>
                  <Input
                    id="customModel"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="VD: ATS-100A"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="customSpecs" className="font-semibold text-xs">
                    {translate("composer.items.customModal.specsLabel")}
                  </Label>
                  <Input
                    id="customSpecs"
                    value={customSpecs}
                    onChange={(e) => setCustomSpecs(e.target.value)}
                    placeholder="VD: 100A, 3 Pha"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="customQty" className="font-semibold text-xs">
                    {translate("composer.items.customModal.qtyLabel")}
                  </Label>
                  <Input
                    id="customQty"
                    type="number"
                    min="1"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    className="h-8 text-xs text-center"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <Label htmlFor="customPrice" className="font-semibold text-xs">
                    {translate("composer.items.customModal.priceLabel")} (VND)
                  </Label>
                  <Input
                    id="customPrice"
                    type="number"
                    min="0"
                    step="10000"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="h-8 text-xs text-right font-medium"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomItemModalOpen(false)}
                className="h-8 text-xs"
              >
                {translate("composer.items.customModal.cancel")}
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs">
                {translate("composer.items.customModal.confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
