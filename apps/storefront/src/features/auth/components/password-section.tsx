"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import type { TRegisterForm } from "@/features/auth/schemas/auth.schema";

interface PasswordSectionProps {
  form: UseFormReturn<TRegisterForm>;
}

export const PasswordSection = ({ form }: PasswordSectionProps) => {
  const t = useTranslations("Register");

  return (
    <div className="border-t pt-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">{t("passwordLabel")} *</FieldLabel>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            placeholder={t("passwordPlaceholder")}
            aria-invalid={!!form.formState.errors.password}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">
            {t("confirmPasswordLabel")} *
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register("confirmPassword")}
            placeholder={t("confirmPasswordPlaceholder")}
            aria-invalid={!!form.formState.errors.confirmPassword}
          />
          <FieldError>
            {form.formState.errors.confirmPassword?.message}
          </FieldError>
        </Field>
      </div>
    </div>
  );
};
