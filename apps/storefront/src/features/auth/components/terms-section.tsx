"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Link } from "@/i18n/routing";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import type { TRegisterForm } from "@/features/auth/schemas/auth.schema";

interface TermsSectionProps {
  form: UseFormReturn<TRegisterForm>;
}

export const TermsSection = ({ form }: TermsSectionProps) => {
  const t = useTranslations("Register");

  return (
    <Field data-invalid={!!form.formState.errors.agreeTerms}>
      <div className="flex items-start space-x-2 pt-4">
        <Controller
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <Checkbox
              id="agreeTerms"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <FieldLabel htmlFor="agreeTerms" className="text-sm leading-snug">
          {t("agreeTermsPrefix")}{" "}
          <Link
            href="/terms"
            className="text-primary hover:text-primary/80 underline"
          >
            {t("termsOfService")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href="/privacy"
            className="text-primary hover:text-primary/80 underline"
          >
            {t("privacyPolicy")}
          </Link>{" "}
          {t("ofHyundaiNhatNang")}
        </FieldLabel>
      </div>
      <FieldError>{form.formState.errors.agreeTerms?.message}</FieldError>
    </Field>
  );
};
