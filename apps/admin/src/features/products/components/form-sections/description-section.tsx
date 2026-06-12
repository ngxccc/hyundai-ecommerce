import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { RichTextEditor } from "@nhatnang/ui/editor";
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
import { type JSONContent } from "@nhatnang/ui";
import type { TCreateProductInput } from "@nhatnang/database/validators";

interface ProductDescriptionSectionProps {
  form: UseFormReturn<TCreateProductInput>;
}

export const ProductDescriptionSection = ({
  form,
}: ProductDescriptionSectionProps) => {
  const t = useTranslations("AdminProductForm");
  const tEditor = useTranslations("Editor");

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
                <div className="flex flex-col gap-2 mt-2">
                  <RichTextEditor
                    dictionary={(k) => tEditor(k as never)}
                    value={initialDescriptionVi}
                    onChange={(val) =>
                      form.setValue("descriptionVi", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
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
                <div className="flex flex-col gap-2 mt-2">
                  <RichTextEditor
                    dictionary={(k) => tEditor(k as never)}
                    value={initialDescriptionEn}
                    onChange={(val) =>
                      form.setValue("descriptionEn", val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
