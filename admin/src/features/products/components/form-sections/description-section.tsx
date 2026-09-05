import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type JSONContent } from "@/shared/lib/action-auth";
import type { CreateProductInput } from "@/shared/validators";

interface ProductDescriptionSectionProps {
  form: UseFormReturn<CreateProductInput>;
}

export const ProductDescriptionSection = ({
  form,
}: ProductDescriptionSectionProps) => {
  const t = useTranslations("AdminProductForm");

  const initialDescriptionVi = form.getValues(
    "descriptionVi",
  ) as JSONContent | null;

  const initialDescriptionEn = form.getValues(
    "descriptionEn",
  ) as JSONContent | null;

  return (
    <Card className="gap-0 border-none py-0 shadow-sm">
      <CardHeader className="border border-b-0 pt-4 pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <FileText className="text-primary h-5 w-5" />
          {t("fields.description")}
        </CardTitle>
      </CardHeader>
      <CardContent className="border-none p-0">
        <FormField
          control={form.control}
          name="descriptionVi"
          render={() => (
            <FormItem className="border p-4">
              <FormLabel className="font-semibold">
                {t("fields.description")} (VI)
              </FormLabel>
              <FormControl>
                <textarea
                  className="focus:border-primary focus:ring-primary mt-2 w-full rounded-md border border-zinc-200 p-3 text-sm outline-none focus:ring-1"
                  rows={5}
                  defaultValue={
                    typeof initialDescriptionVi === "string"
                      ? initialDescriptionVi
                      : ""
                  }
                  onChange={(e) =>
                    form.setValue("descriptionVi", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descriptionEn"
          render={() => (
            <FormItem className="border border-t-0 p-4">
              <FormLabel className="font-semibold">
                {t("fields.description")} (EN)
              </FormLabel>
              <FormControl>
                <textarea
                  className="focus:border-primary focus:ring-primary mt-2 w-full rounded-md border border-zinc-200 p-3 text-sm outline-none focus:ring-1"
                  rows={5}
                  defaultValue={
                    typeof initialDescriptionEn === "string"
                      ? initialDescriptionEn
                      : ""
                  }
                  onChange={(e) =>
                    form.setValue("descriptionEn", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
