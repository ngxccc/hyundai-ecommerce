import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Settings, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { type TNewProduct } from "@nhatnang/database/schemas";

interface ProductTechnicalSpecsProps {
  form: UseFormReturn<TNewProduct>;
}

export const ProductTechnicalSpecs = ({ form }: ProductTechnicalSpecsProps) => {
  const t = useTranslations("AdminProductForm");

  const toInputValue = (value: unknown) =>
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
      ? String(value)
      : "";

  return (
    <>
      <Card className="py-4 shadow-sm">
        <CardHeader className="border-b pb-1!">
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <Settings className="text-primary h-5 w-5" />
            {t("fields.specs_electrical")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="specs.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.model")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.model")}
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
              name="specs.power"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.power")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.power")}
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
              name="specs.voltage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.voltage")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.voltage")}
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
              name="specs.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.frequency")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.frequency")}
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
              name="specs.phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.phase")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={
                      typeof field.value === "string" ? field.value : ""
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.selectPhase")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 Phase">
                        {t("phaseOptions.1phase")}
                      </SelectItem>
                      <SelectItem value="3 Phase">
                        {t("phaseOptions.3phase")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specs.ratedCurrent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.ratedCurrent")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.ratedCurrent")}
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
              name="specs.powerFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.powerFactor")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.powerFactor")}
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
              name="specs.warranty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.warranty")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.warranty")}
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

      <Card className="py-4 shadow-sm">
        <CardHeader className="border-b pb-1!">
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <Wrench className="text-primary h-5 w-5" />
            {t("fields.specs_engine")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="specs.engine"
              render={({ field }) => (
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
              render={({ field }) => (
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
              render={({ field }) => (
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
                      <SelectItem value="Diesel">
                        {t("fuelOptions.diesel")}
                      </SelectItem>
                      <SelectItem value="Gasoline">
                        {t("fuelOptions.gasoline")}
                      </SelectItem>
                      <SelectItem value="Gas">
                        {t("fuelOptions.gas")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specs.coolingSystem"
              render={({ field }) => (
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
              render={({ field }) => (
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.fuelConsumption")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.fuelConsumption")}
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
              name="specs.fuelTankCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.fuelTankCapacity")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.fuelTankCapacity")}
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
              name="specs.alternator"
              render={({ field }) => (
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
              render={({ field }) => (
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
            <FormField
              control={form.control}
              name="specs.weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.weight")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.weight")}
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
              name="specs.dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.dimensions")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.dimensions")}
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
              name="specs.noiseLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.noiseLevel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.noiseLevel")}
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
    </>
  );
};
