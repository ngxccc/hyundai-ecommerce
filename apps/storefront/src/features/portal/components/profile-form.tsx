"use client";

import { useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { useIsClient } from "@/shared/hooks/useIsClient";
import {
  updateProfileSchema,
  type TUpdateProfileForm,
} from "@nhatnang/database/validators";
import { updateProfileAction } from "../actions/profile.action";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@nhatnang/ui/components/ui/field";
import { Separator } from "@nhatnang/ui/components/ui/separator";
import { businessTypeEnum } from "@nhatnang/database/schemas";

interface ProfileFormProps {
  defaultValues: TUpdateProfileForm;
  email: string;
  isDealer: boolean;
}

export function ProfileForm({
  defaultValues,
  email,
  isDealer,
}: ProfileFormProps) {
  const t = useTranslations("Portal");
  const tp = useTranslations("Portal.profile");
  const [isLoading, setIsLoading] = useState(false);
  const isClient = useIsClient();

  const form = useForm<TUpdateProfileForm>({
    resolver: translatedZodResolver(updateProfileSchema, t),
    defaultValues,
  });

  const onSubmit: SubmitHandler<TUpdateProfileForm> = async (data) => {
    setIsLoading(true);
    try {
      const result = await updateProfileAction(data);

      if (!result.success) {
        if ("fieldErrors" in result && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof TUpdateProfileForm, {
              type: "server",
              message: messages[0] ?? "",
            });
          });
          return;
        }
        toast.error("error" in result ? result.error : tp("updateError"));
        return;
      }

      toast.success(tp("updateSuccess"));
    } catch {
      toast.error(tp("updateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 lg:space-y-4"
    >
      {/* Personal Information */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="name">{tp("nameLabel")} *</FieldLabel>
            <Input
              id="name"
              {...form.register("name")}
              disabled={!isClient || isLoading}
              placeholder="Nguyễn Văn A"
              aria-invalid={!!form.formState.errors.name}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone">{tp("phoneLabel")} *</FieldLabel>
            <Input
              id="phone"
              {...form.register("phone")}
              disabled={!isClient || isLoading}
              placeholder="0901 234 567"
              aria-invalid={!!form.formState.errors.phone}
            />
            <FieldError>{form.formState.errors.phone?.message}</FieldError>
          </Field>
        </div>

        <Field className="mt-4">
          <FieldLabel htmlFor="email">{tp("emailLabel")}</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="cursor-not-allowed bg-zinc-50 text-zinc-400"
          />
          <FieldDescription>{tp("emailNote")}</FieldDescription>
        </Field>
      </section>

      {/* B2B Business Information — Dealers only */}
      {isDealer && (
        <>
          <Separator />
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
              {tp("businessSection")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.companyName}>
                <FieldLabel htmlFor="companyName">
                  {tp("companyNameLabel")}
                </FieldLabel>
                <Input
                  id="companyName"
                  {...form.register("companyName")}
                  disabled={true}
                  placeholder="Công ty TNHH ABC"
                  aria-invalid={!!form.formState.errors.companyName}
                />
                <FieldError>
                  {form.formState.errors.companyName?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.taxId}>
                <FieldLabel htmlFor="taxId">{tp("taxIdLabel")}</FieldLabel>
                <Input
                  id="taxId"
                  {...form.register("taxId")}
                  disabled={true}
                  placeholder="0123456789"
                  aria-invalid={!!form.formState.errors.taxId}
                />
                <FieldError>{form.formState.errors.taxId?.message}</FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.businessType}>
                <FieldLabel htmlFor="businessType">
                  {tp("businessTypeLabel")}
                </FieldLabel>
                <Select
                  disabled={true}
                  value={businessType ?? ""}
                  onValueChange={(v) =>
                    form.setValue("businessType", v as typeof businessType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="businessType"
                    aria-invalid={!!form.formState.errors.businessType}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeEnum.enumValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {tp(`businessTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>
                  {form.formState.errors.businessType?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.province}>
                <FieldLabel htmlFor="province">
                  {tp("provinceLabel")}
                </FieldLabel>
                <Input
                  id="province"
                  {...form.register("province")}
                  disabled={true}
                  placeholder="TP. Hồ Chí Minh"
                  aria-invalid={!!form.formState.errors.province}
                />
                <FieldError>
                  {form.formState.errors.province?.message}
                </FieldError>
              </Field>
            </div>
          </section>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? tp("saving") : tp("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
