"use client";

import { useTranslations } from "next-intl";
import { FileText, Calendar, ShieldCheck, CreditCard, Truck, FileSignature } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Textarea } from "@nhatnang/ui/components/ui/textarea";
import { Label } from "@nhatnang/ui/components/ui/label";
import { useQuoteDraftStore } from "../stores/quote-draft.store";

export const CommercialTermsEditor = () => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (key: string) => string;

  const commercialTerms = useQuoteDraftStore((state) => state.commercialTerms);
  const setCommercialTerms = useQuoteDraftStore((state) => state.setCommercialTerms);

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader className="p-4 pb-3 border-b bg-muted/20">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {translate("composer.terms.title")}
        </CardTitle>
        <CardDescription className="text-xs">
          {translate("composer.terms.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Validity Days */}
          <div className="space-y-1.5">
            <Label htmlFor="validityDays" className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {translate("composer.terms.validityLabel")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="validityDays"
                type="number"
                min="1"
                max="365"
                value={commercialTerms.validityDays}
                onChange={(e) =>
                  setCommercialTerms({
                    validityDays: Math.max(1, parseInt(e.target.value, 10) || 15),
                  })
                }
                className="h-9 w-24 text-center font-medium"
              />
              <span className="text-muted-foreground text-xs">
                {translate("composer.terms.daysUnit")}
              </span>
            </div>
          </div>

          {/* VAT Rate */}
          <div className="space-y-1.5">
            <Label htmlFor="vatRate" className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              {translate("composer.terms.vatLabel")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="vatRate"
                type="number"
                min="0"
                max="100"
                value={commercialTerms.vatRate}
                onChange={(e) =>
                  setCommercialTerms({
                    vatRate: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="h-9 w-24 text-center font-medium"
              />
              <span className="text-muted-foreground text-xs">%</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="space-y-1.5">
          <Label htmlFor="paymentSchedule" className="text-xs font-semibold flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            {translate("composer.terms.paymentLabel")}
          </Label>
          <Input
            id="paymentSchedule"
            value={commercialTerms.paymentSchedule ?? ""}
            onChange={(e) => setCommercialTerms({ paymentSchedule: e.target.value || null })}
            placeholder={translate("composer.terms.paymentPlaceholder")}
            className="h-9 text-xs"
          />
        </div>

        {/* Warranty Terms */}
        <div className="space-y-1.5">
          <Label htmlFor="warrantyTerms" className="text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            {translate("composer.terms.warrantyLabel")}
          </Label>
          <Input
            id="warrantyTerms"
            value={commercialTerms.warrantyTerms ?? ""}
            onChange={(e) => setCommercialTerms({ warrantyTerms: e.target.value || null })}
            placeholder={translate("composer.terms.warrantyPlaceholder")}
            className="h-9 text-xs"
          />
        </div>

        {/* Delivery Terms (Time & Location) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryTime" className="text-xs font-semibold flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              {translate("composer.terms.deliveryTimeLabel")}
            </Label>
            <Input
              id="deliveryTime"
              value={commercialTerms.deliveryTime ?? ""}
              onChange={(e) => setCommercialTerms({ deliveryTime: e.target.value || null })}
              placeholder={translate("composer.terms.deliveryTimePlaceholder")}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryLocation" className="text-xs font-semibold flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              {translate("composer.terms.deliveryLocationLabel")}
            </Label>
            <Input
              id="deliveryLocation"
              value={commercialTerms.deliveryLocation ?? ""}
              onChange={(e) => setCommercialTerms({ deliveryLocation: e.target.value || null })}
              placeholder={translate("composer.terms.deliveryLocationPlaceholder")}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Notes & Special Terms */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs font-semibold flex items-center gap-1.5">
            <FileSignature className="h-3.5 w-3.5 text-muted-foreground" />
            {translate("composer.terms.notesLabel")}
          </Label>
          <Textarea
            id="note"
            rows={3}
            value={commercialTerms.note ?? ""}
            onChange={(e) => setCommercialTerms({ note: e.target.value || null })}
            placeholder={translate("composer.terms.notesPlaceholder")}
            className="text-xs resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
