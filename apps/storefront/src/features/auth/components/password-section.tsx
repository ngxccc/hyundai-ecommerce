"use client";

import { useTranslations } from "next-intl";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Field, FieldLabel, FieldError } from "@nhatnang/ui/components/ui/field";
import type { TRegisterForm } from "@nhatnang/database/validators";
import type { IAuthFormSectionProps } from "@nhatnang/types";

export const PasswordSection = ({
  form,
}: IAuthFormSectionProps<TRegisterForm>) => {
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
