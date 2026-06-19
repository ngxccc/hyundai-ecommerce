"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { type AddressDTO } from "@nhatnang/database/dtos";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Field, FieldLabel } from "@nhatnang/ui/components/ui/field";
import { BookOpen, MapPin } from "lucide-react";
import type { CheckoutFormInput } from "./checkout-template";

interface CheckoutShippingAddressProps {
  addresses: AddressDTO[];
  onOpenAddressBook: () => void;
  isSubmitting: boolean;
}

export function CheckoutShippingAddress({
  addresses,
  onOpenAddressBook,
  isSubmitting,
}: CheckoutShippingAddressProps) {
  const t = useTranslations("Checkout");
  const ta = useTranslations("Portal.addresses");
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormInput>();

  return (
    <Card className="space-y-4 rounded-xl border border-zinc-200 bg-white px-6 py-4 shadow-sm">
      <div className="mb-0 flex items-center justify-between border-b pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <MapPin className="size-5 text-zinc-500" />
          {t("shippingAddress")}
        </h2>
        {addresses.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddressBook}
            className="gap-2 border-zinc-300"
          >
            <BookOpen className="size-4" />
            <span className="hidden sm:block">{t("selectFromBook")}</span>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Field data-invalid={!!errors.receiverName}>
          <FieldLabel htmlFor="receiverName">
            {ta("receiverNameLabel")} *
          </FieldLabel>
          <Input
            id="receiverName"
            placeholder="Nguyễn Văn A"
            {...register("receiverName", { required: true })}
            disabled={isSubmitting}
          />
        </Field>

        <Field data-invalid={!!errors.phoneNumber}>
          <FieldLabel htmlFor="phoneNumber">
            {ta("phoneNumberLabel")} *
          </FieldLabel>
          <Input
            id="phoneNumber"
            placeholder="0901 234 567"
            {...register("phoneNumber", { required: true })}
            disabled={isSubmitting}
          />
        </Field>

        <Field data-invalid={!!errors.streetAddress}>
          <FieldLabel htmlFor="streetAddress">
            {ta("streetAddressLabel")} *
          </FieldLabel>
          <Input
            id="streetAddress"
            placeholder="Số 12, ngõ 34, phố ABC"
            {...register("streetAddress", { required: true })}
            disabled={isSubmitting}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.district}>
            <FieldLabel htmlFor="district">{ta("districtLabel")} *</FieldLabel>
            <Input
              id="district"
              placeholder="Quận Cầu Giấy"
              {...register("district", { required: true })}
              disabled={isSubmitting}
            />
          </Field>

          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">{ta("cityLabel")} *</FieldLabel>
            <Input
              id="city"
              placeholder="Hà Nội"
              {...register("city", { required: true })}
              disabled={isSubmitting}
            />
          </Field>
        </div>
      </div>
    </Card>
  );
}
