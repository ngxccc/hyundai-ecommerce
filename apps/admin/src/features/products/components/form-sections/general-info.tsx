import type { UseFormReturn, ControllerRenderProps } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import { Textarea } from "@nhatnang/ui/components/ui/textarea";
import { formatNumberInput } from "@/shared/lib/utils";
import { type TNewProduct } from "@nhatnang/database/schemas";

interface ProductGeneralInfoProps {
  form: UseFormReturn<TNewProduct>;
}

export const ProductGeneralInfo = ({ form }: ProductGeneralInfoProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Info className="text-primary h-5 w-5" />
          {t("fields.specs_general")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "name">;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.name")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("fields.namePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "slug">;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.slug")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("fields.slugPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="price"
          render={({
            field,
          }: {
            field: ControllerRenderProps<TNewProduct, "price">;
          }) => (
            <FormItem>
              <FormLabel>{t("fields.price")} *</FormLabel>
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
        <FormField
          control={form.control}
          name="shortDescription"
          render={({
            field,
          }: {
            field: ControllerRenderProps<TNewProduct, "shortDescription">;
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
        <FormField
          control={form.control}
          name="isQuoteOnly"
          render={({
            field,
          }: {
            field: ControllerRenderProps<TNewProduct, "isQuoteOnly">;
          }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
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
