import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { RichTextEditor } from "@/shared/components/editor";
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
import { type TNewProduct } from "@nhatnang/database/schemas";
import { type JSONContent } from "@tiptap/core";

interface ProductDescriptionSectionProps {
  form: UseFormReturn<TNewProduct>;
}

export const ProductDescriptionSection = ({
  form,
}: ProductDescriptionSectionProps) => {
  const t = useTranslations("AdminProductForm");

  const initialDescription = form.getValues(
    "description",
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
          name="description"
          render={() => (
            <FormItem>
              <FormLabel className="sr-only">
                {t("fields.description")}
              </FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    value={initialDescription}
                    onChange={(val) =>
                      form.setValue("description", val, {
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
