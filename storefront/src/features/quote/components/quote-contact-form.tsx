"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressCascader, type AddressState } from "./address-cascader";

export interface QuoteFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  taxId: string;
  note: string;
}

interface QuoteContactFormProps {
  formData: QuoteFormData;
  address: AddressState;
  isPending: boolean;
  onChangeFormData: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onChangeAddress: (address: AddressState) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

/**
 * Right-column B2B customer contact & delivery location form.
 */
export function QuoteContactForm({
  formData,
  address,
  isPending,
  onChangeFormData,
  onChangeAddress,
  onSubmit,
}: QuoteContactFormProps) {
  const t = useTranslations("Quote");

  return (
    <div className="lg:col-span-5">
      <Card size="dense" className="sticky top-20">
        <CardHeader bordered size="dense" className="py-3 sm:py-4">
          <CardTitle className="text-base font-bold">
            {t("contactInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Customer Name */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("fullName")} <span className="text-destructive">*</span>
              </label>
              <Input
                name="customerName"
                required
                placeholder={t("fullNamePlaceholder")}
                value={formData.customerName}
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Customer Phone */}
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
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("email")}
              </label>
              <Input
                name="customerEmail"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={formData.customerEmail}
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Company / Organization Name */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("company")}
              </label>
              <Input
                name="companyName"
                placeholder={t("companyPlaceholder")}
                value={formData.companyName}
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Tax Identification Number */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("taxId")}
              </label>
              <Input
                name="taxId"
                placeholder={t("taxIdPlaceholder")}
                value={formData.taxId}
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Delivery Location Cascader */}
            <AddressCascader value={address} onChange={onChangeAddress} />

            {/* Technical Notes / Requirements */}
            <div>
              <label className="text-foreground/80 text-xs font-semibold">
                {t("notes")}
              </label>
              <Textarea
                name="note"
                rows={3}
                placeholder={t("notesPlaceholder")}
                value={formData.note}
                onChange={onChangeFormData}
                className="mt-1"
              />
            </div>

            {/* Submit Action */}
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
  );
}
