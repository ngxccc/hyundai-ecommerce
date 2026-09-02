"use client";

import { useTranslations } from "next-intl";
import { User, Building2, Phone, Mail, MapPin, FileSpreadsheet } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Label } from "@nhatnang/ui/components/ui/label";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export interface CustomerInfoFormProps {
  errors?: Record<string, string>;
}

export const CustomerInfoForm = ({ errors = {} }: CustomerInfoFormProps) => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (key: string) => string;
  const customerInfo = useQuoteDraftStore((state) => state.customerInfo);
  const setCustomerInfo = useQuoteDraftStore((state) => state.setCustomerInfo);

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader className="p-4 pb-3 border-b bg-muted/20">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          {translate("composer.customer.title")}
        </CardTitle>
        <CardDescription className="text-xs">
          {translate("composer.customer.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="customerName" className="text-xs font-semibold flex items-center gap-1">
            {translate("composer.customer.nameLabel")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerName"
              value={customerInfo.customerName}
              onChange={(e) => setCustomerInfo({ customerName: e.target.value })}
              placeholder={translate("composer.customer.namePlaceholder")}
              className={`pl-8 h-9 text-sm ${errors["customerName"] ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors["customerName"] && (
            <p className="text-[11px] text-destructive font-medium">{errors["customerName"]}</p>
          )}
        </div>

        {/* Customer Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="customerPhone" className="text-xs font-semibold flex items-center gap-1">
            {translate("composer.customer.phoneLabel")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerPhone"
              value={customerInfo.customerPhone}
              onChange={(e) => setCustomerInfo({ customerPhone: e.target.value })}
              placeholder={translate("composer.customer.phonePlaceholder")}
              className={`pl-8 h-9 text-sm ${errors["customerPhone"] ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors["customerPhone"] && (
            <p className="text-[11px] text-destructive font-medium">{errors["customerPhone"]}</p>
          )}
        </div>

        {/* Customer Email */}
        <div className="space-y-1.5">
          <Label htmlFor="customerEmail" className="text-xs font-semibold">
            {translate("composer.customer.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerEmail"
              type="email"
              value={customerInfo.customerEmail ?? ""}
              onChange={(e) => setCustomerInfo({ customerEmail: e.target.value || null })}
              placeholder={translate("composer.customer.emailPlaceholder")}
              className={`pl-8 h-9 text-sm ${errors["customerEmail"] ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {errors["customerEmail"] && (
            <p className="text-[11px] text-destructive font-medium">{errors["customerEmail"]}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-xs font-semibold">
            {translate("composer.customer.companyLabel")}
          </Label>
          <div className="relative">
            <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="companyName"
              value={customerInfo.companyName ?? ""}
              onChange={(e) => setCustomerInfo({ companyName: e.target.value || null })}
              placeholder={translate("composer.customer.companyPlaceholder")}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {/* Tax Identification Number */}
        <div className="space-y-1.5">
          <Label htmlFor="taxId" className="text-xs font-semibold">
            {translate("composer.customer.taxIdLabel")}
          </Label>
          <div className="relative">
            <FileSpreadsheet className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="taxId"
              value={customerInfo.taxId ?? ""}
              onChange={(e) => setCustomerInfo({ taxId: e.target.value || null })}
              placeholder={translate("composer.customer.taxIdPlaceholder")}
              className="pl-8 h-9 text-sm font-mono"
            />
          </div>
        </div>

        {/* Shipping / Installation Address */}
        <div className="space-y-1.5">
          <Label htmlFor="shippingAddress" className="text-xs font-semibold">
            {translate("composer.customer.addressLabel")}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="shippingAddress"
              value={customerInfo.shippingAddress ?? ""}
              onChange={(e) => setCustomerInfo({ shippingAddress: e.target.value || null })}
              placeholder={translate("composer.customer.addressPlaceholder")}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
