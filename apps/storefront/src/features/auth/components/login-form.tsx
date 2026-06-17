"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { type TLoginForm, loginSchema } from "@nhatnang/database/validators";
import { loginAction } from "../actions/login.action";
import { useRouter, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import { useCartStore, mergeLocalCartAction } from "@/features/cart";

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = rawCallbackUrl?.startsWith("/") ? rawCallbackUrl : "/";

  const router = useRouter();
  const t = useTranslations("Login");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TLoginForm>({
    resolver: translatedZodResolver(loginSchema, t),
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
          if ("fieldErrors" in result && result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([key, messages]) => {
              const safeKey = key as keyof TLoginForm;
              const errorCode = messages[0];
              const errorMessage = errorCode
                ? t(errorCode as never)
                : t("errorMessage");

              form.setError(safeKey, {
                type: "server",
                message: errorMessage,
              });
            });
            return;
          }

          if ("error" in result && result.error) {
            toast.error(result.error);
          } else {
            toast.error(t("errorMessage"));
          }
          return;
        }

        // Merge guest cart if items exist
        const localItems = useCartStore.getState().items;
        if (localItems.length > 0) {
          try {
            const mergeResult = await mergeLocalCartAction(
              localItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            );
            if (mergeResult.success) {
              useCartStore.getState().clearCart();
            }
          } catch (mergeError) {
            console.error("Cart merge failed:", mergeError);
          }
        }

        toast.success(t("successMessage"));
        router.push(callbackUrl);
        form.reset();
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(t("errorMessage"));
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
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
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2 h-12 w-full text-base"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>

            <div className="mt-4 flex flex-col items-center space-y-2">
              <p className="text-muted-foreground text-center text-sm">
                {t("noAccountYet")}{" "}
                <Link
                  href="/register"
                  className="text-primary font-medium hover:underline"
                >
                  {t("registerNow")}
                </Link>
              </p>

              {/* TODO: Implement forgot password flow */}
              <Button
                variant="link"
                className="text-primary lg:text-muted-foreground hover:text-primary h-auto px-0 text-center text-sm font-normal"
                type="button"
              >
                {t("forgotPassword")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
