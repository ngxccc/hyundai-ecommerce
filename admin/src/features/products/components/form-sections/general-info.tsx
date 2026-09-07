import { useState } from "react";
import type { UseFormReturn, ControllerRenderProps } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatNumberInput } from "@/shared/lib/utils";
import type { CreateProductInput } from "@/shared/validators";

interface ProductGeneralInfoProps {
  form: UseFormReturn<CreateProductInput>;
}

export const ProductGeneralInfo = ({ form }: ProductGeneralInfoProps) => {
  const t = useTranslations("adminProductForm");
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");

  const nameViError = Boolean(form.formState.errors.nameVi);
  const nameEnError = Boolean(form.formState.errors.nameEn);

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle size="lg">
            <Info />
            {t("fields.specs_general")}
          </CardTitle>

          {/* Language Switcher Tabs */}
          <Tabs
            value={langTab}
            onValueChange={(val) => setLangTab(val as "vi" | "en")}
            className="w-auto"
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="vi" className="h-7 px-2.5 text-xs">
                🇻🇳 {t("tabs.vi")}
                {nameViError && (
                  <span className="bg-destructive ml-1.5 size-1.5 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="en" className="h-7 px-2.5 text-xs">
                🇬🇧 {t("tabs.en")}
                {nameEnError && (
                  <span className="bg-destructive ml-1.5 size-1.5 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent size="dense">
        {/* Language-dependent fields */}
        <Tabs value={langTab} className="w-full">
          {/* Vietnamese Fields (forceMount ensures RHF state is preserved) */}
          <TabsContent value="vi" forceMount className="space-y-4">
            <FormField
              control={form.control}
              name="nameVi"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateProductInput, "nameVi">;
              }) => (
                <FormItem>
                  <FormLabel required>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.namePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescriptionVi"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  CreateProductInput,
                  "shortDescriptionVi"
                >;
              }) => (
                <FormItem>
                  <FormLabel>{t("fields.shortDescription")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fields.shortDescriptionPlaceholder")}
                      className="min-h-0 resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* English Fields (forceMount ensures RHF state is preserved) */}
          <TabsContent value="en" forceMount className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateProductInput, "nameEn">;
              }) => (
                <FormItem>
                  <FormLabel>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.namePlaceholder")}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescriptionEn"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  CreateProductInput,
                  "shortDescriptionEn"
                >;
              }) => (
                <FormItem>
                  <FormLabel>{t("fields.shortDescription")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fields.shortDescriptionPlaceholder")}
                      className="min-h-0 resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Shared fields (Slug, Price) */}
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateProductInput, "slug">;
            }) => (
              <FormItem>
                <FormLabel required>{t("fields.slug")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("fields.slugPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateProductInput, "price">;
            }) => (
              <FormItem>
                <FormLabel required>{t("fields.price")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 font-medium">
                      ₫
                    </span>
                    <Input
                      className="pl-8"
                      placeholder={t("fields.pricePlaceholder")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatNumberInput(e.target.value));
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isQuoteOnly"
          render={({
            field,
          }: {
            field: ControllerRenderProps<CreateProductInput, "isQuoteOnly">;
          }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  {t("fields.isQuoteOnly")}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
