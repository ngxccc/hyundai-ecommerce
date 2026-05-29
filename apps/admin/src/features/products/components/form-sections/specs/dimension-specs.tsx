import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Maximize } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { FormField } from "@nhatnang/ui/components/ui/form";
import { type TNewProduct } from "@nhatnang/database/schemas";
import { NumberWithUnitField } from "../number-with-unit-field";

interface SpecsProps {
  form: UseFormReturn<TNewProduct>;
}

export const DimensionSpecs = ({ form }: SpecsProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Maximize className="text-primary h-5 w-5" />
          {t("fields.specs_dimensions")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="specs.weight"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "specs.weight">;
            }) => (
              <NumberWithUnitField
                label={t("fields.weight")}
                placeholder={t("placeholders.weight")}
                field={field}
                units={[
                  { value: "kg", label: "KG", multiplier: 1 },
                  { value: "ton", label: "Tấn", multiplier: 1000 },
                ]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.length"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "specs.length">;
            }) => (
              <NumberWithUnitField
                label={t("fields.length")}
                placeholder={t("placeholders.length")}
                field={field}
                units={[
                  { value: "mm", label: "mm", multiplier: 1 },
                  { value: "cm", label: "cm", multiplier: 10 },
                ]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.width"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "specs.width">;
            }) => (
              <NumberWithUnitField
                label={t("fields.width")}
                placeholder={t("placeholders.width")}
                field={field}
                units={[
                  { value: "mm", label: "mm", multiplier: 1 },
                  { value: "cm", label: "cm", multiplier: 10 },
                ]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.height"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "specs.height">;
            }) => (
              <NumberWithUnitField
                label={t("fields.height")}
                placeholder={t("placeholders.height")}
                field={field}
                units={[
                  { value: "mm", label: "mm", multiplier: 1 },
                  { value: "cm", label: "cm", multiplier: 10 },
                ]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.noiseLevel"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TNewProduct, "specs.noiseLevel">;
            }) => (
              <NumberWithUnitField
                label={t("fields.noiseLevel")}
                placeholder={t("placeholders.noiseLevel")}
                field={field}
                units={[{ value: "db", label: "dB", multiplier: 1 }]}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
