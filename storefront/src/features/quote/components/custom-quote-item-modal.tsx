"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuoteStore } from "@/features/quote";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

export function CustomQuoteItemModal() {
  const t = useTranslations("Quote");
  const addCustomItem = useQuoteStore((s) => s.addCustomItem);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    model: "",
    specs: "",
    quantity: 1,
    requestedPrice: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "requestedPrice") {
      const digits = parseNumberInput(value);
      setForm((prev) => ({
        ...prev,
        requestedPrice: digits ? formatNumberInput(digits) : "",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

  const handleAdd = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t("itemNameRequired"));
      return;
    }

    addCustomItem({
      name: form.name.trim(),
      model: form.model.trim() || null,
      specs: form.specs.trim() || null,
      quantity: form.quantity,
      requestedPrice: parseNumberInput(form.requestedPrice) || null,
    });

    toast.success(t("addedSuccess", { name: form.name }));
    setForm({
      name: "",
      model: "",
      specs: "",
      quantity: 1,
      requestedPrice: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/5 hover:border-primary flex w-full items-center justify-center gap-2 border-dashed py-5 text-sm font-semibold transition-all"
        >
          <PlusCircle className="size-4" />
          {t("addCustomProduct")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleAdd}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t("customProductModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("customProductModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-4">
            {/* Item Name */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("customItemName")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                name="name"
                required
                placeholder={t("customItemNamePlaceholder")}
                value={form.name}
                onChange={handleChange}
                className="mt-1 text-sm"
              />
            </div>

            {/* Model / Part Code */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("customItemModel")}
              </label>
              <Input
                name="model"
                placeholder={t("customItemModelPlaceholder")}
                value={form.model}
                onChange={handleChange}
                className="mt-1 text-sm"
              />
            </div>

            {/* Technical Specifications */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("customItemSpecs")}
              </label>
              <Textarea
                name="specs"
                rows={3}
                placeholder={t("customItemSpecsPlaceholder")}
                value={form.specs}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            {/* Quantity & Target Price */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-foreground/80 text-xs font-semibold">
                  {t("customItemQuantity")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  name="quantity"
                  type="number"
                  min={1}
                  required
                  value={form.quantity}
                  onChange={handleChange}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <label className="text-foreground/80 text-xs font-semibold">
                  {t("customItemRequestedPrice")}
                </label>
                <Input
                  name="requestedPrice"
                  type="text"
                  placeholder={t("customItemRequestedPricePlaceholder")}
                  value={form.requestedPrice}
                  onChange={handleChange}
                  className="mt-1 text-sm"
                />
                <p className="text-muted-foreground/70 mt-1 text-[11px] leading-tight">
                  {t("customItemRequestedPriceHint")}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-border/50 mt-4 flex flex-row items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-20"
            >
              {t("cancel")}
            </Button>
            <Button type="submit" className="min-w-28 font-semibold">
              {t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
