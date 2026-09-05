"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useQuoteStore } from "@/features/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { priceFormatter } from "@/shared/lib/utils";
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
    totalAmount: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    companyName: "",
    taxId: "",
    shippingAddress: "",
    note: "",
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

    const payload: SubmitQuoteInput = {
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim() || null,
      companyName: formData.companyName.trim() || null,
      taxId: formData.taxId.trim() || null,
      shippingAddress: formData.shippingAddress.trim() || null,
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
          quoteNumber: res.data.quoteNumber,
          customerName: res.data.customerName,
          totalAmount: res.data.totalAmount,
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
        <h1 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
          {t("successTitle")}
        </h1>
        <p className="mt-3 text-zinc-600">
          {t("successDesc", { name: submittedQuote.customerName })}
        </p>

        <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-left">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <span className="text-sm text-zinc-500">
              {t("quoteNumberLabel")}
            </span>
            <span className="text-primary font-mono text-base font-bold">
              {submittedQuote.quoteNumber}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <PhoneCall className="text-primary size-4" />
              <span>
                {t("hotline")}{" "}
                <strong className="text-zinc-900">0901 234 567</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-primary size-4" />
              <span>
                {t("emailSales")}{" "}
                <strong className="text-zinc-900">
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
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <FileText className="size-7" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">{t("emptyTitle")}</h2>
        <p className="mt-2 text-sm text-zinc-500">{t("emptyDescription")}</p>
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Selected Products list */}
        <div className="lg:col-span-7">
          <Card className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-zinc-900">
                  {t("selectedProducts")} ({items.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={clearQuote}
                >
                  {t("clearAll")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-100 p-0">
              {items.map((item) => {
                const itemPriceNum = Number(item.price);
                const hasPrice = itemPriceNum > 0;

                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 sm:p-6"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 sm:size-20">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-zinc-400">
                          Ảnh
                        </div>
                      )}
                    </div>

                    <div className="flex grow flex-col">
                      <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                        {t("referencePrice")}{" "}
                        <span className="text-primary font-semibold">
                          {hasPrice
                            ? priceFormatter.format(itemPriceNum)
                            : t("contactForPrice")}
                        </span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-md border border-zinc-200">
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
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
                          <span className="w-8 text-center text-sm font-bold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center text-zinc-500 hover:bg-zinc-100"
                            onClick={() => {
                              updateQuantity(item.productId, item.quantity + 1);
                            }}
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-zinc-400 transition-colors hover:text-red-500"
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
          <Card className="sticky top-20 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <CardTitle className="text-base font-bold text-zinc-900">
                {t("contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t("fullName")} <span className="text-red-500">*</span>
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
                  <label className="text-xs font-semibold text-zinc-700">
                    {t("phone")} <span className="text-red-500">*</span>
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
                  <label className="text-xs font-semibold text-zinc-700">
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
                  <label className="text-xs font-semibold text-zinc-700">
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
                  <label className="text-xs font-semibold text-zinc-700">
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

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t("shippingAddress")}
                  </label>
                  <Input
                    name="shippingAddress"
                    placeholder={t("shippingAddressPlaceholder")}
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t("notes")}
                  </label>
                  <textarea
                    name="note"
                    rows={3}
                    placeholder={t("notesPlaceholder")}
                    value={formData.note}
                    onChange={handleChange}
                    className="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-zinc-200 p-2.5 text-sm text-zinc-900 outline-none focus:ring-1"
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

                <p className="text-center text-xs text-zinc-400">
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
