"use client";

import { Controller, useWatch } from "react-hook-form";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { Field, FieldLabel, FieldError } from "@nhatnang/ui/components/ui/field";
import type { TRegisterForm } from "@nhatnang/database/validators";
import { useTranslations } from "next-intl";
import type { AuthFormSectionProps } from "@nhatnang/shared";

export const BusinessInfoSection = ({
  form,
}: AuthFormSectionProps<TRegisterForm>) => {
  const t = useTranslations("Register");
  const businessType = useWatch({
    control: form.control,
    name: "businessType",
    defaultValue: "end_user",
  });
  const isBusinessCustomer = businessType && businessType !== "end_user";

  return (
    <div className="border-t pt-6">
      <Field data-invalid={!!form.formState.errors.businessType}>
        <FieldLabel>{t("businessTypeLabel")} *</FieldLabel>
        <Controller
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("businessTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dealer">
                  {t("businessTypeOptions.dealer")}
                </SelectItem>
                <SelectItem value="contractor">
                  {t("businessTypeOptions.contractor")}
                </SelectItem>
                <SelectItem value="end_user">
                  {t("businessTypeOptions.endUser")}
                </SelectItem>
                <SelectItem value="distributor">
                  {t("businessTypeOptions.distributor")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError>{form.formState.errors.businessType?.message}</FieldError>
      </Field>

      <p className="bg-muted/40 text-muted-foreground mt-3 rounded-lg border px-3 py-2 text-sm">
        {isBusinessCustomer ? t("b2bNotice") : t("b2cNotice")}
      </p>

      {isBusinessCustomer ? (
        <div className="mt-6 space-y-4">
          <h4 className="text-base font-semibold">{t("businessInfoTitle")}</h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.companyName}>
              <FieldLabel htmlFor="companyName">
                {t("companyNameLabel")} *
              </FieldLabel>
              <Input
                id="companyName"
                {...form.register("companyName")}
                placeholder={t("companyNamePlaceholder")}
                aria-invalid={!!form.formState.errors.companyName}
              />
              <FieldError>
                {form.formState.errors.companyName?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.taxId}>
              <FieldLabel htmlFor="taxId">{t("taxIdLabel")} *</FieldLabel>
              <Input
                id="taxId"
                {...form.register("taxId")}
                placeholder={t("taxIdPlaceholder")}
                aria-invalid={!!form.formState.errors.taxId}
              />
              <FieldError>{form.formState.errors.taxId?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.province}>
            <FieldLabel htmlFor="province">{t("provinceLabel")} *</FieldLabel>
            <Input
              id="province"
              {...form.register("province")}
              placeholder={t("provincePlaceholder")}
              aria-invalid={!!form.formState.errors.province}
            />
            <FieldError>{form.formState.errors.province?.message}</FieldError>
          </Field>
        </div>
      ) : null}
    </div>
  );
};
