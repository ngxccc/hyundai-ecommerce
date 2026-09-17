"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/lib/validation-resolver";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions/category.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocaleTabs } from "@/components/common/locale-tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminCategory } from "@/types/api";
import { type CreateCategoryInput, createCategorySchema } from "@/validators";
import { Save, Loader2, X, Info, FolderTree } from "lucide-react";
import { CategoryHeader } from "./category-header";

export const CategoryForm = ({
  initialData,
  categories = [],
}: {
  initialData?: AdminCategory;
  categories?: AdminCategory[];
}) => {
  const t = useTranslations("adminCategoryForm");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");

  const form = useForm<CreateCategoryInput>({
    resolver: translatedZodResolver(createCategorySchema, tErrors),
    defaultValues: isEditing
      ? {
          slug: initialData.slug,
          parentId: initialData.parentId,
          sortOrder: 0,
          isActive: initialData.isActive,
          translations: initialData.translations?.map((tr) => ({
            locale: tr.locale as "vi" | "en",
            name: tr.name,
            description: tr.description ?? "",
          })) ?? [
            { locale: "vi", name: "", description: "" },
            { locale: "en", name: "", description: "" },
          ],
        }
      : {
          slug: "",
          parentId: null,
          sortOrder: 0,
          isActive: true,
          translations: [
            { locale: "vi", name: "", description: "" },
            { locale: "en", name: "", description: "" },
          ],
        },
  });

  const onSubmit = (data: CreateCategoryInput) => {
    startTransition(async () => {
      const payload: CreateCategoryInput = {
        slug: data.slug,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        translations: data.translations,
      };

      const finalFormData = new FormData();
      finalFormData.append("payload", JSON.stringify(payload));

      const result = isEditing
        ? await updateCategoryAction(initialData.id, finalFormData)
        : await createCategoryAction(finalFormData);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );
        router.push("/categories");
        router.refresh();
      } else {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            const message = errors[0];
            if (message) {
              form.setError(field as keyof CreateCategoryInput, {
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

  const availableParentCategories = categories.filter(
    (c) => !isEditing || c.id !== initialData.id,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with Cancel and Submit actions on top right */}
        <CategoryHeader
          title={isEditing ? t("editTitle") : t("title")}
          description={isEditing ? t("editDescription") : t("description")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shadow-xs"
                onClick={() => router.push("/categories")}
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
          {/* General Translations Section */}
          <Card size="dense">
            <CardHeader bordered size="dense">
              <div className="flex items-center justify-between">
                <CardTitle size="lg">
                  <Info className="size-4" />
                  {t("sections.general")}
                </CardTitle>
                <LocaleTabs
                  activeLocale={langTab}
                  onLocaleChange={setLangTab}
                />
              </div>
            </CardHeader>
            <CardContent size="dense" className="space-y-4">
              {langTab === "vi" ? (
                <>
                  <FormField
                    control={form.control}
                    name="translations.0.name"
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
                    name="translations.0.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fields.description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("placeholders.description")}
                            rows={3}
                            disabled={isPending}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="translations.1.name"
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
                    name="translations.1.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fields.description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("placeholders.description")}
                            rows={3}
                            disabled={isPending}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Classification & Hierarchy Section */}
          <Card size="dense">
            <CardHeader bordered size="dense">
              <CardTitle size="lg">
                <FolderTree className="size-4" />
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent size="dense" className="space-y-4">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.parentId")}</FormLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "none" ? null : val)
                      }
                      value={field.value ?? "none"}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("placeholders.parentId")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t("labels.none")}</SelectItem>
                        {availableParentCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
        </div>
      </form>
    </Form>
  );
};
