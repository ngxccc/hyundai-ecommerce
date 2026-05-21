"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import type { TRegisterForm } from "@nhatnang/database/schemas";
import type { IAuthFormSectionProps } from "@nhatnang/types";

export const PersonalInfoSection = ({
  form,
}: IAuthFormSectionProps<TRegisterForm>) => {
  const t = useTranslations("Register");

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="name">{t("fullNameLabel")} *</FieldLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder={t("fullNamePlaceholder")}
            aria-invalid={!!form.formState.errors.name}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone">{t("phoneLabel")} *</FieldLabel>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder={t("phonePlaceholder")}
            aria-invalid={!!form.formState.errors.phone}
          />
          <FieldError>{form.formState.errors.phone?.message}</FieldError>
        </Field>
      </div>

      <Field className="mt-4" data-invalid={!!form.formState.errors.email}>
        <FieldLabel htmlFor="email">{t("emailLabel")} *</FieldLabel>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder={t("emailPlaceholder")}
          aria-invalid={!!form.formState.errors.email}
        />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </Field>
    </div>
  );
};
