"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/lib/validation-resolver";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { createBrandAction, updateBrandAction } from "../actions/brand.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocaleTabs } from "@/components/common/locale-tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminBrand } from "@/types/api";
import { type CreateBrandInput, createBrandSchema } from "@/validators";
import { Save, Loader2, X, Info, Globe } from "lucide-react";
import { BrandHeader } from "./brand-header";

export const BrandForm = ({
  initialData,
}: {
  initialData?: AdminBrand | null;
}) => {
  const t = useTranslations("adminBrandForm");
  const tErrors = useTranslations("errors");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");

  const form = useForm<CreateBrandInput>({
    resolver: translatedZodResolver(createBrandSchema, tErrors),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      sortOrder: 0,
      translations: [
        {
          locale: "vi",
          description:
            initialData?.translations?.find((tr) => tr.locale === "vi")
              ?.description ??
            initialData?.description ??
            "",
        },
        {
          locale: "en",
          description:
            initialData?.translations?.find((tr) => tr.locale === "en")
              ?.description ?? "",
        },
      ],
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = (data: CreateBrandInput) => {
    startTransition(async () => {
      const payload: CreateBrandInput = {
        name: data.name,
        slug: data.slug,
        sortOrder: data.sortOrder,
        translations: data.translations,
        isActive: data.isActive,
      };

      const finalFormData = new FormData();
      finalFormData.append("payload", JSON.stringify(payload));

      const result = isEditing
        ? await updateBrandAction(initialData.id, finalFormData)
        : await createBrandAction(finalFormData);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );
        router.push("/brands");
        router.refresh();
      } else {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            const message = errors[0];
            if (message) {
              form.setError(field as keyof CreateBrandInput, {
                type: "server",
                message,
              });
            }
          });
        }
        toast.error(result.error ?? t("messages.error"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with Cancel and Save actions in top right */}
        <BrandHeader
          title={isEditing ? t("editTitle") : t("title")}
          description={isEditing ? t("editDescription") : t("description")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shadow-xs"
                onClick={() => router.push("/brands")}
                disabled={isPending}
              >
                <X className="mr-1.5 h-4 w-4" />
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 shadow-xs"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                {isEditing ? t("buttons.save") : t("buttons.create")}
              </Button>
            </div>
          }
        />

        <div className="mx-auto space-y-6">
          {/* General Information Section */}
          <Card size="dense">
            <CardHeader bordered size="dense">
              <CardTitle size="lg">
                <Info className="size-4" />
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent size="dense" className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("fields.name")}</FormLabel>
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
                    <FormLabel required>{t("fields.slug")}</FormLabel>
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="border-border/60 flex flex-row items-center space-y-0 space-x-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">
                        {t("fields.isActive")}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Multilingual Description Section */}
          <Card size="dense">
            <CardHeader bordered size="dense">
              <div className="flex items-center justify-between">
                <CardTitle size="lg">
                  <Globe className="size-4" />
                  {t("fields.description")}
                </CardTitle>
                <LocaleTabs
                  activeLocale={langTab}
                  onLocaleChange={setLangTab}
                />
              </div>
            </CardHeader>
            <CardContent size="dense" className="space-y-4">
              {langTab === "vi" ? (
                <FormField
                  control={form.control}
                  name="translations.0.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t("placeholders.description")}
                          rows={4}
                          disabled={isPending}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="translations.1.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t("placeholders.description")}
                          rows={4}
                          disabled={isPending}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};
