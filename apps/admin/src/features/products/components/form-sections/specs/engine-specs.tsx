import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Wrench } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@nhatnang/ui/components/ui/select";
import { NumberWithUnitField } from "../number-with-unit-field";
import { toInputValue } from "@nhatnang/shared/lib/utils";
import type { TCreateProductInput } from "@nhatnang/database/validators";

interface SpecsProps {
  form: UseFormReturn<TCreateProductInput>;
}

export const EngineSpecs = ({ form }: SpecsProps) => {
  const t = useTranslations("AdminProductForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b px-4 pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <Wrench className="text-primary h-5 w-5" />
          {t("fields.specs_engine")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="specs.engine"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.engine")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.engine")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.engineBrand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.engineBrand")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.engineBrand")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.fuelType"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.fuelType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={
                    typeof field.value === "string" ? field.value : ""
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.selectFuel")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="diesel">
                      {t("fuelOptions.diesel")}
                    </SelectItem>
                    <SelectItem value="gasoline">
                      {t("fuelOptions.gasoline")}
                    </SelectItem>
                    <SelectItem value="gas">{t("fuelOptions.gas")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.coolingSystem"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.coolingSystem")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.coolingSystem")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.startingSystem"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.startingSystem")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.startingSystem")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.fuelConsumption"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                TCreateProductInput,
                "specs.fuelConsumption"
              >;
            }) => (
              <NumberWithUnitField
                label={t("fields.fuelConsumption")}
                placeholder={t("placeholders.fuelConsumption")}
                field={field}
                units={[{ value: "lh", label: "L/h", multiplier: 1 }]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.fuelTankCapacity"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                TCreateProductInput,
                "specs.fuelTankCapacity"
              >;
            }) => (
              <NumberWithUnitField
                label={t("fields.fuelTankCapacity")}
                placeholder={t("placeholders.fuelTankCapacity")}
                field={field}
                units={[{ value: "l", label: "Lít", multiplier: 1 }]}
              />
            )}
          />
          <FormField
            control={form.control}
            name="specs.alternator"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.alternator")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.alternator")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specs.alternatorBrand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<TCreateProductInput>;
            }) => (
              <FormItem>
                <FormLabel>{t("fields.alternatorBrand")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.alternatorBrand")}
                    {...field}
                    value={toInputValue(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
