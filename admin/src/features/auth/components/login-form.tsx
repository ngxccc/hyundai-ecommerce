"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/lib/validation-resolver";
import { useTranslations } from "next-intl";
import { type LoginForm as LoginFormInput, loginSchema } from "@/validators";
import { Eye, EyeOff, Headphones, Lock, Mail, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminLoginAction } from "../actions/admin-login.action";
import { useRouter } from "@/i18n/routing";
import { COMPANY_CONFIG } from "@/constants";

const REMEMBER_KEY = "hyundai_admin_email";

export interface LoginFormProps {
  supportEmail?: string;
  supportHotline?: string;
}

export const LoginForm = ({
  supportEmail = COMPANY_CONFIG.SUPPORT_EMAIL,
  supportHotline = COMPANY_CONFIG.HOTLINES.HCM,
}: LoginFormProps) => {
  const t = useTranslations("login");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [helpdeskOpen, setHelpdeskOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<LoginFormInput>({
    resolver: translatedZodResolver(loginSchema, t),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Prefill remembered email if available
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_KEY);
      if (savedEmail) {
        form.setValue("email", savedEmail);
        form.setValue("rememberMe", true);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, [form]);

  const onSubmit = (data: LoginFormInput) => {
    setFormError(null);
    startTransition(async () => {
      try {
        const result = await adminLoginAction(data);

        if (!result.success) {
          if ("fieldErrors" in result && result.fieldErrors) {
            for (const [field, messages] of Object.entries(
              result.fieldErrors,
            )) {
              const msg = messages[0];
              if (msg) {
                form.setError(field as keyof LoginFormInput, {
                  type: "server",
                  message: msg,
                });
              }
            }
            return;
          }
          if ("error" in result && result.error) {
            setFormError(result.error);
          }
          return;
        }

        // Save or remove remembered email
        try {
          if (data.rememberMe) {
            localStorage.setItem(REMEMBER_KEY, data.email);
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
        } catch {
          // Ignore localStorage errors
        }

        router.replace("/");
        router.refresh();
      } catch (err) {
        console.warn("Login submit error: ", err);
        setFormError(t("errorMessage"));
      }
    });
  };

  return (
    <Card size="dense" className="w-full p-6 shadow-lg sm:p-7">
      <CardHeader className="flex flex-col items-center justify-center gap-2 p-0 text-center">
        {/* Brand Logo */}
        <div className="relative mx-auto flex h-10 w-56 max-w-full items-center justify-center">
          <Image
            src="/brand/logo.svg"
            alt={COMPANY_CONFIG.BRAND_NAME}
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/brand/logo-dark.svg"
            alt={COMPANY_CONFIG.BRAND_NAME}
            fill
            className="hidden object-contain dark:block"
            priority
          />
        </div>

        <div className="flex flex-col items-center justify-center space-y-1 text-center">
          <CardTitle className="text-foreground justify-center text-center text-base font-semibold tracking-normal sm:text-lg">
            {t("heading")}
          </CardTitle>
          <CardDescription className="text-muted-foreground mx-auto max-w-xs text-xs font-normal">
            {t("description")}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Inline Error Alert */}
            {formError ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-relaxed font-medium">{formError}</span>
              </div>
            ) : null}
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-1 text-left">
                  <FormLabel className="text-foreground text-xs font-semibold">
                    {t("emailLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Mail className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
                      <Input
                        placeholder="you@gmail.com"
                        type="email"
                        autoComplete="email"
                        disabled={isPending}
                        className="h-10 pl-9 text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-1 text-left">
                  <FormLabel className="text-foreground text-xs font-semibold">
                    {t("passwordLabel")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Lock className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
                      <Input
                        placeholder={t("passwordPlaceholder")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isPending}
                        className="h-10 pr-10 pl-9 text-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground absolute right-3 flex items-center justify-center p-0.5 transition-colors focus:outline-none"
                        aria-label={t(
                          showPassword ? "hidePassword" : "showPassword",
                        )}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Utilities Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="text-muted-foreground hover:text-foreground m-0 cursor-pointer text-xs leading-none font-normal select-none">
                      {t("rememberMe")}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Helpdesk Support Dialog */}
              <Dialog open={helpdeskOpen} onOpenChange={setHelpdeskOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium"
                  >
                    {t("forgotPassword")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="space-y-2">
                    <div className="text-primary flex items-center gap-2">
                      <Headphones className="size-5" />
                      <DialogTitle className="text-base font-bold">
                        {t("helpdeskTitle")}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
                      {t("helpdeskDesc")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3.5 text-xs">
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <Mail className="text-muted-foreground size-3.5" />
                      <span>
                        {t("helpdeskEmail", {
                          email: supportEmail,
                        })}
                      </span>
                    </div>
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <ShieldAlert className="text-muted-foreground size-3.5" />
                      <span>
                        {t("helpdeskHotline", {
                          hotline: supportHotline,
                        })}
                      </span>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHelpdeskOpen(false)}
                    >
                      {t("close")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-10 w-full text-sm font-semibold shadow-sm"
              disabled={isPending}
            >
              {isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
