"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useQuoteStore } from "@/features/quote";
import { useIsMounted } from "@/hooks/useIsMounted";
import { normalizePriceString } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type AddressState } from "./address-cascader";
import { QuoteEmptyState } from "./quote-empty-state";
import { QuoteSuccessState } from "./quote-success-state";
import { QuoteItemsList } from "./quote-items-list";
import { QuoteContactForm, type QuoteFormData } from "./quote-contact-form";
import {
  submitQuoteRequestAction,
  type SubmitQuoteInput,
} from "../actions/quote.action";

const INITIAL_FORM_DATA: QuoteFormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  companyName: "",
  taxId: "",
  note: "",
};

const INITIAL_ADDRESS: AddressState = {
  city: "",
  district: "",
  streetAddress: "",
};

/**
 * Main B2B Quote Request view container orchestrating state, line items, and contact submission.
 */
export function QuoteRequestView() {
  const t = useTranslations("Quote");
  const isMounted = useIsMounted();
  const items = useQuoteStore((s) => s.items);
  const updateQuantity = useQuoteStore((s) => s.updateQuantity);
  const updateRequestedPrice = useQuoteStore((s) => s.updateRequestedPrice);
  const removeItem = useQuoteStore((s) => s.removeItem);
  const clearQuote = useQuoteStore((s) => s.clearQuote);

  const [isPending, startTransition] = useTransition();
  const [submittedQuote, setSubmittedQuote] = useState<{
    quoteNumber: string;
    customerName: string;
  } | null>(null);

  const [formData, setFormData] = useState<QuoteFormData>(INITIAL_FORM_DATA);
  const [address, setAddress] = useState<AddressState>(INITIAL_ADDRESS);

  const resetAllForms = () => {
    setFormData(INITIAL_FORM_DATA);
    setAddress(INITIAL_ADDRESS);
  };

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
        productId: item.productId ?? null,
        isCustomItem: item.isCustomItem ?? false,
        itemName: item.name,
        itemModel: item.model ?? null,
        itemSpecs: item.specs ?? null,
        quantity: item.quantity,
        requestedPrice:
          normalizePriceString(item.requestedPrice) ??
          (Number(item.price) > 0 ? item.price : null),
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
        resetAllForms();
      } else {
        toast.error(res.error || "Request failed");
      }
    });
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    resetAllForms();
  };

  // 1. Success state after submission
  if (submittedQuote) {
    return (
      <QuoteSuccessState
        quoteNumber={submittedQuote.quoteNumber}
        customerName={submittedQuote.customerName}
        onReset={handleReset}
      />
    );
  }

  // 2. Prevent hydration empty state flash before localStorage rehydration
  if (!isMounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card size="dense">
              <CardHeader bordered size="dense" className="py-3 sm:py-4">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent size="compact" className="space-y-4 p-4 sm:p-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-5">
            <Card size="dense">
              <CardHeader bordered size="dense" className="py-3 sm:py-4">
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty state when mounted and no items selected
  if (items.length === 0) {
    return <QuoteEmptyState />;
  }

  // 4. Main quotation form & line items layout
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <QuoteItemsList
          items={items}
          onUpdateQuantity={updateQuantity}
          onUpdateRequestedPrice={updateRequestedPrice}
          onRemoveItem={removeItem}
          onClearAll={clearQuote}
        />

        <QuoteContactForm
          formData={formData}
          address={address}
          isPending={isPending}
          onChangeFormData={handleChange}
          onChangeAddress={setAddress}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
