import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCategory, AdminBrand } from "@/types/api";
import type { CreateProductInput } from "@/shared/validators";

interface ProductCategorySectionProps {
  form: UseFormReturn<CreateProductInput>;
  categories: AdminCategory[];
  brands: AdminBrand[];
}

export const ProductCategorySection = ({
  form,
  categories,
  brands,
}: ProductCategorySectionProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <Tag />
          {t("fields.categoryGroup")}
        </CardTitle>
      </CardHeader>
      <CardContent size="dense">
        <FormField
          control={form.control}
          name="categoryId"
          render={({
            field,
          }: {
            field: ControllerRenderProps<CreateProductInput, "categoryId">;
          }) => (
            <FormItem>
              <FormLabel required>{t("fields.category")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      {category.nameVi}
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
            field: ControllerRenderProps<CreateProductInput, "brandId">;
          }) => (
            <FormItem>
              <FormLabel required>{t("fields.brand")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
