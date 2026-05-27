import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { type TNewProduct, type TCategory } from "@nhatnang/database/schemas";

interface ProductCategorySectionProps {
  form: UseFormReturn<TNewProduct>;
  categories: TCategory[];
}

export const ProductCategorySection = ({
  form,
  categories,
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
          render={({ field }) => (
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
      </CardContent>
    </Card>
  );
};
