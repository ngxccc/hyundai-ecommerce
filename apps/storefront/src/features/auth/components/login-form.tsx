"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createLoginSchema, type TLoginForm } from "@nhatnang/database/schemas";
import { loginAction } from "../actions/login.action";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import type { IAuthErrorMessageMap } from "@nhatnang/types";
import { LoginFormUI } from "./login-form-ui";

interface LoginFormInnerProps {
  callbackUrl: string;
}

export const LoginFormInner = ({ callbackUrl }: LoginFormInnerProps) => {
  const router = useRouter();
  const t = useTranslations("Login");
  const [isPending, startTransition] = useTransition();

  const errorMessages: IAuthErrorMessageMap = {
    [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: t("validation.invalidCredentials"),
    [AUTH_ERROR_CODES.ACCOUNT_LOCKED]: t("validation.accountLocked"),
    [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: t("validation.unverifiedEmail"),
  };

  const form = useForm<TLoginForm>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: TLoginForm) => {
    startTransition(async () => {
      try {
        const result = await loginAction(data);

        if (!result.success) {
          const errorMessage = errorMessages[result.code] ?? t("errorMessage");
          toast.error(errorMessage);
          return;
        }

        toast.success(t("successMessage"));
        router.push(callbackUrl);
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(t("errorMessage"));
      }
    });
  };

  return <LoginFormUI form={form} isPending={isPending} onSubmit={onSubmit} />;
};

/**
 * Default export with fallback callbackUrl
 * Used when callbackUrl is not needed from URL params
 */
export const LoginForm = () => {
  return <LoginFormInner callbackUrl="/dashboard" />;
};
