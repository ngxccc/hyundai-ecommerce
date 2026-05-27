"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createLoginSchema, type TLoginForm } from "@nhatnang/database/validators";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { adminLoginAction } from "../actions/admin-login.action";
import { useRouter } from "@/i18n/routing";

export const LoginForm = () => {
  const t = useTranslations("Login");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const errorMessages: Record<string, string> = {
    INVALID_CREDENTIALS: t("validation.invalidCredentials"),
    ACCOUNT_LOCKED: t("validation.accountLocked"),
    EMAIL_NOT_VERIFIED: t("validation.unverifiedEmail"),
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
        const result = await adminLoginAction(data);

        if (!result.success) {
          const errorMessage = errorMessages[result.code] ?? t("errorMessage");
          toast.error(errorMessage);
          return;
        }

        toast.success(t("successMessage"));
        router.push("/");
      } catch (err) {
        console.warn("Login submit error: ", err);
        toast.error(t("errorMessage"));
      }
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center space-y-2 text-lg font-bold tracking-tight">
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
            <ShieldCheck className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.rich("title", {
              br: () => <br />,
            })}
          </h1>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("emailPlaceholder")}
                      type="email"
                      autoComplete="email"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passwordLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("passwordPlaceholder")}
                      type="password"
                      autoComplete="current-password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
