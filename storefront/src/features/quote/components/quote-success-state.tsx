"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { StorefrontCompanySettings } from "@/types/api";
import {
  CheckCircle2,
  PhoneCall,
  Mail,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface QuoteSuccessStateProps {
  quoteNumber: string;
  customerName: string;
  company: StorefrontCompanySettings;
  onReset?: () => void;
}
/**
 * Rendered upon successful submission of a B2B quote request.
 */
export function QuoteSuccessState({
  quoteNumber,
  customerName,
  company,
  onReset,
}: QuoteSuccessStateProps) {
  const t = useTranslations("Quote");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      {/* Brand-consistent success icon */}
      <div className="bg-primary/10 text-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-full">
        <CheckCircle2 className="size-10" />
      </div>

      <h1 className="font-display text-foreground text-2xl font-bold sm:text-3xl">
        {t("successTitle")}
      </h1>
      <p className="text-muted-foreground mt-3">
        {t("successDesc", { name: customerName })}
      </p>

      <div className="border-border bg-muted/40 my-8 rounded-xl border p-6 text-left">
        <div className="border-border flex items-center justify-between border-b pb-3">
          <span className="text-muted-foreground text-sm">
            {t("quoteNumberLabel")}
          </span>
          <span className="text-primary font-mono text-base font-bold">
            {quoteNumber}
          </span>
        </div>
        <div className="text-muted-foreground mt-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <PhoneCall className="text-primary size-4" />
            <span>
              {t("hotline")}{" "}
              <strong className="text-foreground">
                {company.hotlines.project.display}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="text-primary size-4" />
            <span>
              {t("emailSales")}{" "}
              <strong className="text-foreground">
                {company.emails.sales}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="gap-2" onClick={onReset}>
          <Link href="/products">
            {t("continueBrowsing")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          {t("createNewQuote")}
        </Button>
      </div>
    </div>
  );
}
