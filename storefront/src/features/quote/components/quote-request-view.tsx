"use client";

import { useState, useTransition } from "react";
import { ProductImage } from "@/components";
import { Link } from "@/i18n/routing";
import { useQuoteStore } from "@/features/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressCascader, type AddressState } from "./address-cascader";
import { priceFormatter } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  FileText,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Mail,
} from "lucide-react";
import {
  submitQuoteRequestAction,
  type SubmitQuoteInput,
} from "../actions/quote.action";

export function QuoteRequestView() {
  const t = useTranslations("Quote");
  const items = useQuoteStore((s) => s.items);
  const updateQuantity = useQuoteStore((s) => s.updateQuantity);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const clearQuote = useQuoteStore((s) => s.clearQuote);

  const [isPending, startTransition] = useTransition();
  const [submittedQuote, setSubmittedQuote] = useState<{
    quoteNumber: string;
    customerName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    companyName: "",
    taxId: "",
    note: "",
  });
  const [address, setAddress] = useState<AddressState>({
    city: "",
    district: "",
    streetAddress: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error(t("fullNameRequired"));
      return;
    }

    if (!formData.customerPhone.trim()) {
      toast.error(t("phoneRequired"));
      return;
    }

    if (items.length === 0) {
      toast.error(t("emptyTitle"));
      return;
    }

    const fullShippingAddress = [
      address.streetAddress.trim(),
      address.district.trim(),
      address.city.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    const payload: SubmitQuoteInput = {
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim() || null,
      companyName: formData.companyName.trim() || null,
      taxId: formData.taxId.trim() || null,
      shippingAddress: fullShippingAddress || null,
      note: formData.note.trim() || null,
      items: items.map((item) => ({
        productId: item.productId,
        itemName: item.name,
        quantity: item.quantity,
        requestedPrice: Number(item.price) > 0 ? item.price : null,
      })),
    };
    startTransition(async () => {
      const res = await submitQuoteRequestAction(payload);
      if (res.success) {
        setSubmittedQuote({
          quoteNumber: res.data.quoteNumber ?? "",
          customerName: res.data.customerName ?? "",
        });
        clearQuote();
        toast.success(t("successTitle"));
      } else {
        toast.error(res.error || "Request failed");
      }
    });
  };

  // 1. Success Screen after submission
  if (submittedQuote) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="font-display text-foreground text-2xl font-bold sm:text-3xl">
          {t("successTitle")}
        </h1>
        <p className="text-muted-foreground mt-3">
          {t("successDesc", { name: submittedQuote.customerName })}
        </p>

        <div className="border-border bg-muted/40 my-8 rounded-xl border p-6 text-left">
          <div className="border-border flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground text-sm">
              {t("quoteNumberLabel")}
            </span>
            <span className="text-primary font-mono text-base font-bold">
              {submittedQuote.quoteNumber}
            </span>
          </div>
          <div className="text-muted-foreground mt-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <PhoneCall className="text-primary size-4" />
              <span>
                {t("hotline")}{" "}
                <strong className="text-foreground">0901 234 567</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-primary size-4" />
              <span>
                {t("emailSales")}{" "}
                <strong className="text-foreground">
                  sales@hyundainhatnang.vn
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/products">
              {t("continueBrowsing")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <FileText className="size-7" />
        </div>
        <h2 className="text-foreground text-xl font-bold">{t("emptyTitle")}</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {t("emptyDescription")}
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/products">{t("exploreProducts")}</Link>
        </Button>
      </div>
    );
  }

  // 3. Main Request Form & Line Items List
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Selected Products list */}
        <div className="lg:col-span-7">
          <Card size="dense">
            <CardHeader bordered size="dense" className="py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">
                  {t("selectedProducts")} ({items.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                  onClick={clearQuote}
                >
                  {t("clearAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent size="compact" className="divide-border/60 divide-y">
              {items.map((item) => {
                const itemPriceNum = Number(item.price);
                const hasPrice = itemPriceNum > 0;

                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 sm:p-6"
                  >
                    <div className="border-border bg-muted/40 relative size-16 shrink-0 overflow-hidden rounded-md border sm:size-20">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                        iconClassName="size-5"
                      />
                    </div>

                    <div className="flex grow flex-col">
                      <h3 className="text-foreground text-sm font-semibold sm:text-base">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                        {t("referencePrice")}{" "}
                        <span className="text-primary font-semibold">
                          {hasPrice
                            ? priceFormatter.format(itemPriceNum)
                            : t("contactForPrice")}
                        </span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="border-border flex items-center rounded-md border">
                          <button
                            type="button"
                            className="text-muted-foreground hover:bg-muted flex size-8 items-center justify-center disabled:opacity-40"
                            onClick={() => {
                              updateQuantity(
                                item.productId,
                                Math.max(1, item.quantity - 1),
                              );
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-foreground w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:bg-muted flex size-8 items-center justify-center"
                            onClick={() => {
                              updateQuantity(item.productId, item.quantity + 1);
                            }}
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => {
                            removeItem(item.productId);
                          }}
                          title={t("deleteItem")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right column: B2B Contact Form */}
        <div className="lg:col-span-5">
          <Card size="dense" className="sticky top-20">
            <CardHeader bordered size="dense" className="py-3 sm:py-4">
              <CardTitle className="text-base font-bold">
                {t("contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("fullName")} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="customerName"
                    required
                    placeholder={t("fullNamePlaceholder")}
                    value={formData.customerName}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("phone")} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="customerPhone"
                    type="tel"
                    required
                    placeholder={t("phonePlaceholder")}
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("email")}
                  </label>
                  <Input
                    name="customerEmail"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("company")}
                  </label>
                  <Input
                    name="companyName"
                    placeholder={t("companyPlaceholder")}
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("taxId")}
                  </label>
                  <Input
                    name="taxId"
                    placeholder={t("taxIdPlaceholder")}
                    value={formData.taxId}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <AddressCascader value={address} onChange={setAddress} />

                <div>
                  <label className="text-foreground/80 text-xs font-semibold">
                    {t("notes")}
                  </label>
                  <textarea
                    name="note"
                    rows={3}
                    placeholder={t("notesPlaceholder")}
                    value={formData.note}
                    onChange={handleChange}
                    className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/50 mt-1 w-full rounded-md border p-2.5 text-sm outline-none focus:ring-1"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="mt-2 w-full font-bold tracking-wider uppercase"
                >
                  {isPending ? t("submitting") : t("submitButton")}
                </Button>

                <p className="text-muted-foreground/80 text-center text-xs">
                  {t("privacyNote")}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
