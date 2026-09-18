"use client";

import { useTranslations } from "next-intl";
import { User, Building2, Phone, Mail, FileSpreadsheet } from "lucide-react";
import { cn } from "cn";
import {
  QuoteAddressCascader,
  type QuoteAddressState,
} from "./quote-address-cascader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface CustomerInfoFormProps {
  errors?: Record<string, string>;
}

interface FormInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
  error?: string;
  className?: string;
}

const FormInputField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  type = "text",
  error,
  className,
}: FormInputFieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <Label
      htmlFor={id}
      className="flex items-center gap-1 text-xs font-semibold"
    >
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <div className="relative">
      <Icon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 pl-8 text-sm",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
    </div>
    {error && (
      <p className="text-destructive text-[11px] font-medium">{error}</p>
    )}
  </div>
);

export const CustomerInfoForm = ({ errors = {} }: CustomerInfoFormProps) => {
  const t = useTranslations("adminQuotes.composer.customer");
  const customerInfo = useQuoteDraftStore((state) => state.customerInfo);
  const setCustomerInfo = useQuoteDraftStore((state) => state.setCustomerInfo);

  const addressState: QuoteAddressState = {
    city: customerInfo.city ?? "",
    district: customerInfo.district ?? "",
    streetAddress: customerInfo.streetAddress ?? "",
  };

  const handleAddressChange = (newAddress: QuoteAddressState) => {
    const fullAddress = [
      newAddress.streetAddress.trim(),
      newAddress.district.trim(),
      newAddress.city.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    setCustomerInfo({
      city: newAddress.city || null,
      district: newAddress.district || null,
      streetAddress: newAddress.streetAddress || null,
      shippingAddress: fullAddress || null,
    });
  };

  return (
    <Card size="dense">
      <CardHeader bordered size="dense" className="bg-muted/20">
        <CardTitle>
          <User />
          {t("title")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent
        size="dense"
        className="grid grid-cols-1 gap-4 space-y-0 md:grid-cols-2"
      >
        <FormInputField
          id="customerName"
          label={t("nameLabel")}
          required
          icon={User}
          value={customerInfo.customerName}
          onChange={(val) => setCustomerInfo({ customerName: val })}
          placeholder={t("namePlaceholder")}
          error={errors.customerName}
        />

        <FormInputField
          id="customerPhone"
          label={t("phoneLabel")}
          required
          icon={Phone}
          value={customerInfo.customerPhone}
          onChange={(val) => setCustomerInfo({ customerPhone: val })}
          placeholder={t("phonePlaceholder")}
          error={errors.customerPhone}
        />

        <FormInputField
          id="companyName"
          label={t("companyLabel")}
          icon={Building2}
          value={customerInfo.companyName ?? ""}
          onChange={(val) => setCustomerInfo({ companyName: val || null })}
          placeholder={t("companyPlaceholder")}
        />

        <FormInputField
          id="taxId"
          label={t("taxIdLabel")}
          icon={FileSpreadsheet}
          value={customerInfo.taxId ?? ""}
          onChange={(val) => setCustomerInfo({ taxId: val || null })}
          placeholder={t("taxIdPlaceholder")}
        />

        <FormInputField
          id="customerEmail"
          label={t("emailLabel")}
          type="email"
          icon={Mail}
          value={customerInfo.customerEmail ?? ""}
          onChange={(val) => setCustomerInfo({ customerEmail: val || null })}
          placeholder={t("emailPlaceholder")}
          error={errors.customerEmail}
          className="col-span-full md:col-span-2"
        />

        <QuoteAddressCascader
          value={addressState}
          onChange={handleAddressChange}
        />
      </CardContent>
    </Card>
  );
};
