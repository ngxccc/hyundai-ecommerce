"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "@/components/ui/sonner";
import { CustomerInfoForm } from "./customer-info-form";
import { QuoteLineItemsTable } from "./quote-line-items-table";
import { CommercialTermsEditor } from "./commercial-terms-editor";
import { QuoteFinancialSummary } from "./quote-financial-summary";
import { useQuoteDraftStore } from "../stores/quote-draft.store";
import { createAdminQuoteAction } from "../actions/quote.actions";
import { createAdminQuoteSchema } from "@/validators";
import { formatFieldErrors } from "@/lib/validation";
export const QuoteComposer = () => {
  const t = useTranslations("adminQuotes");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const items = useQuoteDraftStore((state) => state.items);
  const customerInfo = useQuoteDraftStore((state) => state.customerInfo);
  const commercialTerms = useQuoteDraftStore((state) => state.commercialTerms);
  const resetDraft = useQuoteDraftStore((state) => state.resetDraft);

  const handleFieldErrorChange = (field: string, error: string | null) => {
    setErrors((prev) => {
      if (!error && !prev[field]) return prev;
      const updated = { ...prev };
      if (!error) {
        delete updated[field];
      } else {
        updated[field] = error;
      }
      return updated;
    });
  };

  const handleSubmitQuote = () => {
    setErrors({});

    const payload = {
      userId: customerInfo.userId,
      customerName: customerInfo.customerName.trim(),
      customerPhone: customerInfo.customerPhone.trim(),
      customerEmail: customerInfo.customerEmail?.trim()
        ? customerInfo.customerEmail.trim()
        : null,
      companyName: customerInfo.companyName?.trim()
        ? customerInfo.companyName.trim()
        : null,
      taxId: customerInfo.taxId?.trim() ? customerInfo.taxId.trim() : null,
      shippingAddress: customerInfo.shippingAddress?.trim()
        ? customerInfo.shippingAddress.trim()
        : null,
      vatRate: commercialTerms.vatRate,
      commercialTerms: {
        validityDays: commercialTerms.validityDays,
        paymentSchedule: commercialTerms.paymentSchedule,
        warrantyTerms: commercialTerms.warrantyTerms,
        deliveryTime: commercialTerms.deliveryTime,
        deliveryLocation: commercialTerms.deliveryLocation,
      },
      note: commercialTerms.note,
      items: items.map((item) => ({
        productId: item.productId,
        isCustomItem: item.isCustomItem,
        itemName: item.itemName,
        itemModel: item.itemModel,
        itemSpecs: item.itemSpecs,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
      })),
    };

    const validation = createAdminQuoteSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = formatFieldErrors(validation.error, (key, args) =>
        t(key, args),
      );
      if (fieldErrors.items) {
        toast.error(fieldErrors.items);
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const response = await createAdminQuoteAction(validation.data);

      if (response.success) {
        toast.success(
          t("composer.successToast", {
            quoteNumber: String(response.data.quoteNumber ?? ""),
          }),
        );
        resetDraft();
        router.push(`/quotes/${response.data.id}` as never);
      } else {
        if (response.fieldErrors) {
          const flattened: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(response.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              flattened[key] = msgs[0] ?? "";
            }
          }
          setErrors(flattened);
        } else {
          toast.error(response.error);
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
      {/* Left 2 Columns: Main Editing Canvas */}
      <div className="space-y-6 xl:col-span-2">
        <CustomerInfoForm
          errors={errors}
          onFieldErrorChange={handleFieldErrorChange}
        />
        <QuoteLineItemsTable />
        <CommercialTermsEditor />
      </div>

      {/* Right Column: Financial Calculation & Submission Panel */}
      <div className="xl:col-span-1">
        <QuoteFinancialSummary
          isSubmitting={isPending}
          onSubmitQuote={handleSubmitQuote}
        />
      </div>
    </div>
  );
};
