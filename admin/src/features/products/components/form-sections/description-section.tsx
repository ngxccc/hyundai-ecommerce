import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type JSONContent } from "@/shared/lib/action-auth";
import type { CreateProductInput } from "@/shared/validators";

interface ProductDescriptionSectionProps {
  form: UseFormReturn<CreateProductInput>;
}

export const ProductDescriptionSection = ({
  form,
}: ProductDescriptionSectionProps) => {
  const t = useTranslations("AdminProductForm");
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");

  const initialDescriptionVi = form.getValues(
    "descriptionVi",
  ) as JSONContent | null;

  const initialDescriptionEn = form.getValues(
    "descriptionEn",
  ) as JSONContent | null;

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle size="lg">
            <FileText />
            {t("fields.description")}
          </CardTitle>

          <Tabs
            value={langTab}
            onValueChange={(val) => setLangTab(val as "vi" | "en")}
            className="w-auto"
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="vi" className="h-7 px-2.5 text-xs">
                🇻🇳 {t("tabs.vi")}
              </TabsTrigger>
              <TabsTrigger value="en" className="h-7 px-2.5 text-xs">
                🇬🇧 {t("tabs.en")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent size="dense">
        <Tabs value={langTab} className="w-full">
          {/* Vietnamese Description */}
          <TabsContent value="vi" forceMount className="p-1">
            <FormField
              control={form.control}
              name="descriptionVi"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder={t("fields.descriptionPlaceholder")}
                      defaultValue={
                        typeof initialDescriptionVi === "string"
                          ? initialDescriptionVi
                          : typeof field.value === "string"
                            ? field.value
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
          </TabsContent>

          {/* English Description */}
          <TabsContent value="en" forceMount className="p-1">
            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder={t("fields.descriptionPlaceholder")}
                      defaultValue={
                        typeof initialDescriptionEn === "string"
                          ? initialDescriptionEn
                          : typeof field.value === "string"
                            ? field.value
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
