import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Settings, Wrench } from "lucide-react";
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
import { type TNewProduct } from "@nhatnang/database/schemas";
import { NumberWithUnitField } from "./number-with-unit-field";

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
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.model">;
              }) => (
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.power">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.power") + " *"}
                  placeholder={t("placeholders.power")}
                  field={field}
                  units={[
                    { value: "kw", label: "KW", multiplier: 1 },
                    { value: "w", label: "W", multiplier: 0.001 },
                    { value: "kva", label: "KVA", multiplier: 1 },
                  ]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="specs.voltage"
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.voltage">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.voltage")}
                  placeholder={t("placeholders.voltage")}
                  field={field}
                  units={[
                    { value: "v", label: "V", multiplier: 1 },
                    { value: "kv", label: "KV", multiplier: 1000 },
                  ]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="specs.frequency"
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.frequency">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.frequency")}
                  placeholder={t("placeholders.frequency")}
                  field={field}
                  units={[{ value: "hz", label: "Hz", multiplier: 1 }]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="specs.phase"
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct>;
              }) => (
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
                      <SelectItem value="1phase">
                        {t("phaseOptions.1phase")}
                      </SelectItem>
                      <SelectItem value="3phase">
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.ratedCurrent">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.ratedCurrent")}
                  placeholder={t("placeholders.ratedCurrent")}
                  field={field}
                  units={[{ value: "a", label: "A", multiplier: 1 }]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="specs.powerFactor"
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.powerFactor">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.powerFactor")}
                  placeholder={t("placeholders.powerFactor")}
                  field={field}
                  units={[{ value: "ratio", label: "Hệ số", multiplier: 1 }]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="specs.warranty"
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct, "specs.warranty">;
              }) => (
                <NumberWithUnitField
                  label={t("fields.warranty")}
                  placeholder={t("placeholders.warranty")}
                  field={field}
                  units={[
                    { value: "month", label: "Tháng", multiplier: 1 },
                    { value: "year", label: "Năm", multiplier: 12 },
                  ]}
                />
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct>;
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
                field: ControllerRenderProps<TNewProduct>;
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
                field: ControllerRenderProps<TNewProduct>;
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
                      <SelectItem value="gas">
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<TNewProduct>;
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
                field: ControllerRenderProps<TNewProduct>;
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
                  TNewProduct,
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
                  TNewProduct,
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
                field: ControllerRenderProps<TNewProduct>;
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
                field: ControllerRenderProps<TNewProduct>;
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
            <FormField
              control={form.control}
              name="specs.weight"
              render={({ field }: { field: ControllerRenderProps<TNewProduct, "specs.weight"> }) => (
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
              render={({ field }: { field: ControllerRenderProps<TNewProduct, "specs.length"> }) => (
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
              render={({ field }: { field: ControllerRenderProps<TNewProduct, "specs.width"> }) => (
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
              render={({ field }: { field: ControllerRenderProps<TNewProduct, "specs.height"> }) => (
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
    </>
  );
};
