"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import { Link } from "@/i18n/routing";
import {
  createRegisterSchema,
  type TRegisterForm,
} from "@/features/auth/schemas/auth.schema";
import { PersonalInfoSection } from "./personal-info-section";
import { BusinessInfoSection } from "./business-info-section";
import { PasswordSection } from "./password-section";
import { TermsSection } from "./terms-section";
import { Form } from "@/shared/components/ui/form";
import { registerAction } from "../actions/register.action";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";

export const RegisterForm = () => {
  const router = useRouter();
  const t = useTranslations("Register");
  const [isLoading, setIsLoading] = useState(false);
  const registerSchema = createRegisterSchema(t);

  const errorMessages: Record<string, string> = {
    [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: t("validation.emailAlreadyExists"),
    [AUTH_ERROR_CODES.PHONE_ALREADY_EXISTS]: t("validation.phoneAlreadyExists"),
  };

  const form = useForm<TRegisterForm>({
    resolver: zodResolver(registerSchema),
    shouldUnregister: true,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      taxId: "",
      businessType: "end_user",
      province: "",
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: TRegisterForm) => {
    setIsLoading(true);

    try {
      const result = await registerAction(data);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            const safeKey = key as keyof TRegisterForm;
            const errorMessage = messages[0]
              ? (errorMessages[messages[0]] ?? t("errorMessage"))
              : t("errorMessage");

            form.setError(safeKey, {
              type: "server",
              message: errorMessage,
            });
          });

          return;
        }

        const errorCode =
          typeof result.errorCode === "string" ? result.errorCode : undefined;

        const message = errorCode
          ? (errorMessages[errorCode] ?? t("errorMessage"))
          : t("errorMessage");

        toast.error(message);
        return;
      }

      toast.success(t("successMessage"));
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-base">
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            method="post"
            className="space-y-6"
          >
            <PersonalInfoSection form={form} />
            <BusinessInfoSection form={form} />
            <PasswordSection form={form} />
            <TermsSection form={form} />

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? t("submitting") : t("submit")}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                {t("loginNow")}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
