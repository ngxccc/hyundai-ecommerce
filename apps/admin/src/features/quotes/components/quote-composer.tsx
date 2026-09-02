"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { CustomerInfoForm } from "./customer-info-form";
import { QuoteLineItemsTable } from "./quote-line-items-table";
import { CommercialTermsEditor } from "./commercial-terms-editor";
import { QuoteFinancialSummary } from "./quote-financial-summary";
import { useQuoteDraftStore } from "../stores/quote-draft.store";
import { createAdminQuoteAction } from "../actions/quote.actions";

export const QuoteComposer = () => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (key: string, params?: Record<string, unknown>) => string;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const items = useQuoteDraftStore((state) => state.items);
  const customerInfo = useQuoteDraftStore((state) => state.customerInfo);
  const commercialTerms = useQuoteDraftStore((state) => state.commercialTerms);
  const resetDraft = useQuoteDraftStore((state) => state.resetDraft);

  const handleSubmitQuote = () => {
    setErrors({});

    // Client-side prerequisite check
    if (items.length === 0) {
      toast.error(translate("composer.errors.emptyItems"));
      return;
    }

    const fieldErrors: Record<string, string> = {};
    if (!customerInfo.customerName.trim()) {
      fieldErrors["customerName"] = translate("composer.errors.nameRequired");
    }
    if (!customerInfo.customerPhone.trim()) {
      fieldErrors["customerPhone"] = translate("composer.errors.phoneRequired");
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error(translate("composer.errors.formIncomplete"));
      return;
    }

    startTransition(async () => {
      const payload = {
        userId: customerInfo.userId,
        customerName: customerInfo.customerName.trim(),
        customerPhone: customerInfo.customerPhone.trim(),
        customerEmail: customerInfo.customerEmail?.trim() ?? null,
        companyName: customerInfo.companyName?.trim() ?? null,
        taxId: customerInfo.taxId?.trim() ?? null,
        shippingAddress: customerInfo.shippingAddress?.trim() ?? null,
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

      const response = await createAdminQuoteAction(payload);

      if (response.success && response.data) {
        toast.success(
          translate("composer.successToast", {
            quoteNumber: response.data.quoteNumber,
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
        }
        toast.error(response.error ?? translate("composer.errors.genericFailure"));
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* Left 2 Columns: Main Editing Canvas */}
      <div className="xl:col-span-2 space-y-6">
        <CustomerInfoForm errors={errors} />
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
