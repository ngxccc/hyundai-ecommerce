"use client";

import { useState } from "react";
import { useIsClient } from "@/shared/hooks/useIsClient";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import {
  changePasswordSchema,
  type TChangePasswordForm,
} from "@nhatnang/database/validators";
import { changePasswordAction } from "../actions/password.action";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@nhatnang/ui/components/ui/field";

export function PasswordForm() {
  const t = useTranslations("Portal");
  const tp = useTranslations("Portal.password");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isClient = useIsClient();

  const form = useForm<TChangePasswordForm>({
    resolver: translatedZodResolver(changePasswordSchema, t),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<TChangePasswordForm> = async (data) => {
    setIsLoading(true);
    try {
      const result = await changePasswordAction(data);

      if (!result.success) {
        if ("fieldErrors" in result && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof TChangePasswordForm, {
              type: "server",
              message: messages[0] ?? "",
            });
          });
          return;
        }
        toast.error("error" in result ? result.error : tp("changeError"));
        return;
      }

      toast.success(tp("changeSuccess"));
      // Redirect to login — session was revoked on all devices
      router.push("/login");
      form.reset();
    } catch {
      toast.error(tp("changeError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-4">
      <Field data-invalid={!!form.formState.errors.currentPassword}>
        <FieldLabel htmlFor="currentPassword">
          {tp("currentPasswordLabel")} *
        </FieldLabel>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          disabled={!isClient || isLoading}
          {...form.register("currentPassword")}
          aria-invalid={!!form.formState.errors.currentPassword}
        />
        <FieldError>
          {form.formState.errors.currentPassword?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!form.formState.errors.newPassword}>
        <FieldLabel htmlFor="newPassword">
          {tp("newPasswordLabel")} *
        </FieldLabel>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          disabled={!isClient || isLoading}
          {...form.register("newPassword")}
          aria-invalid={!!form.formState.errors.newPassword}
        />
        <FieldError>{form.formState.errors.newPassword?.message}</FieldError>
      </Field>

      <Field data-invalid={!!form.formState.errors.confirmPassword}>
        <FieldLabel htmlFor="confirmPassword">
          {tp("confirmPasswordLabel")} *
        </FieldLabel>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={!isClient || isLoading}
          {...form.register("confirmPassword")}
          aria-invalid={!!form.formState.errors.confirmPassword}
        />
        <FieldError>
          {form.formState.errors.confirmPassword?.message}
        </FieldError>
      </Field>

      <div className="pt-2">
        <Button type="submit" disabled={isLoading} className="min-w-36">
          {isLoading ? tp("submitting") : tp("submit")}
        </Button>
      </div>
    </form>
  );
}
