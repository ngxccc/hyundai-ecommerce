"use client";

import { useTransition, type ReactNode } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import { createBrandAction, updateBrandAction } from "../actions/brand.actions";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Textarea } from "@nhatnang/ui/components/ui/textarea";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { type TBrand } from "@nhatnang/database/schemas";
import {
  getCreateBrandSchema,
  type TCreateBrandInput,
} from "@nhatnang/database/validators";
import { Save, Loader2, X, Info } from "lucide-react";

import { SYSTEM_ERROR_CODES } from "@nhatnang/shared/constants";
import { BrandImageSection } from "./images-section";

export const BrandForm = ({
  initialData,
  breadcrumbs,
}: {
  initialData?: TBrand;
  breadcrumbs?: ReactNode;
}) => {
  const t = useTranslations("AdminBrandForm");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<TCreateBrandInput>({
    resolver: zodResolver(
      getCreateBrandSchema(t),
    ) as Resolver<TCreateBrandInput>,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      logo: initialData?.logo ?? "",
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const logo = useWatch({ control: form.control, name: "logo" }) ?? "";

  const onSubmit = (data: TCreateBrandInput) => {
    startTransition(async () => {
      const payload = {
        ...data,
      };

      const result = isEditing
        ? await updateBrandAction(initialData.id, {
            ...payload,
            id: initialData.id,
          })
        : await createBrandAction(payload);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );
        router.push("/brands");
        router.refresh();
      } else {
        if (
          result.code === SYSTEM_ERROR_CODES.VALIDATION_ERROR &&
          result.error === "validation.slugExists"
        ) {
          form.setError("slug", { message: t("validation.slugExists") });
        } else {
          toast.error(result.error ?? t("messages.error"));
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-background/80 sticky top-15 z-30 -mx-4 mb-2 flex items-center justify-between rounded-none px-4 pb-2 backdrop-blur-md sm:top-20 sm:-mx-6 sm:px-6 sm:pt-1 sm:pb-2">
          <div className="hidden flex-1 sm:block">{breadcrumbs}</div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-fit">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/brands")}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? t("buttons.save") : t("buttons.create")}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 gap-4 py-4 shadow-sm">
            <CardHeader className="border-b px-4 pb-1!">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <Info className="text-primary h-5 w-5" />
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.name")}
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.slug")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.slug")}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("placeholders.description")}
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                        className="min-h-0 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("fields.isActive")}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="col-span-1">
            <BrandImageSection
              logo={logo}
              setLogo={(val) =>
                form.setValue("logo", val, { shouldValidate: true })
              }
            />
          </div>
        </div>
      </form>
    </Form>
  );
};
