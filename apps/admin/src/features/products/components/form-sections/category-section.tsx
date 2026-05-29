import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Tag } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import { type TCategory, type TBrand } from "@nhatnang/database/schemas";
import type { TCreateProductInput } from "@nhatnang/database/validators";

interface ProductCategorySectionProps {
  form: UseFormReturn<TCreateProductInput>;
  categories: TCategory[];
  brands: TBrand[];
}

export const ProductCategorySection = ({
  form,
  categories,
  brands,
}: ProductCategorySectionProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Tag className="text-primary h-5 w-5" />
          {t("fields.categoryGroup")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormField
          control={form.control}
          name="categoryId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<TCreateProductInput, "categoryId">;
          }) => (
            <FormItem>
              <FormLabel>{t("fields.category")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("fields.categoryPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-muted-foreground p-2 text-sm">
                      {t("fields.noCategoriesFound")}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brandId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<TCreateProductInput, "brandId">;
          }) => (
            <FormItem>
              <FormLabel>{t("fields.brand")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("fields.brandPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                  {brands.length === 0 && (
                    <div className="text-muted-foreground p-2 text-sm">
                      {t("fields.noBrandsFound")}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
