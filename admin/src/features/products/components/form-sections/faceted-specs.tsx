"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateProductInput } from "@/shared/validators";
import { toInputValue } from "@/shared/lib/utils";

interface FacetedSpecsProps {
  form: UseFormReturn<CreateProductInput>;
}

export const FacetedSpecs = ({ form }: FacetedSpecsProps) => {
  const t = useTranslations("AdminProductForm");
  const productType = form.watch("productType");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <SlidersHorizontal />
          {t("fields.facetedTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent size="dense">
        {/* Product Type Selection */}
        <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  {t("fields.productType")}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue
                        placeholder={t("fields.selectProductType")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="generator">
                      {t("productTypeOptions.generator")}
                    </SelectItem>
                    <SelectItem value="ups">
                      {t("productTypeOptions.ups")}
                    </SelectItem>
                    <SelectItem value="ats">
                      {t("productTypeOptions.ats")}
                    </SelectItem>
                    <SelectItem value="accessory">
                      {t("productTypeOptions.accessory")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="powerKva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.powerKva")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="50"
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="powerKw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.powerKw")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="40"
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="standbyPowerKva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.standbyPowerKva")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="55"
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.phase")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
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
                    <SelectItem value="multi_phase">
                      {t("phaseOptions.multi_phase")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voltage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.voltage")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.voltage")}
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.frequency")} (Hz)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("placeholders.frequency")}
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.fuelType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
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
            name="canopyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.canopyType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t("fields.selectCanopy")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="silent">
                      {t("canopyOptions.silent")}
                    </SelectItem>
                    <SelectItem value="super_silent">
                      {t("canopyOptions.super_silent")}
                    </SelectItem>
                    <SelectItem value="open_frame">
                      {t("canopyOptions.open_frame")}
                    </SelectItem>
                    <SelectItem value="closed_case">
                      {t("canopyOptions.closed_case")}
                    </SelectItem>
                    <SelectItem value="tower">
                      {t("canopyOptions.tower")}
                    </SelectItem>
                    <SelectItem value="rackmount">
                      {t("canopyOptions.rackmount")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.startMethod")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue
                        placeholder={t("fields.selectStartMethod")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electric">
                      {t("startOptions.electric")}
                    </SelectItem>
                    <SelectItem value="recoil">
                      {t("startOptions.recoil")}
                    </SelectItem>
                    <SelectItem value="remote">
                      {t("startOptions.remote")}
                    </SelectItem>
                    <SelectItem value="auto_ats">
                      {t("startOptions.auto_ats")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="engineBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.engineBrand")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.engineBrand")}
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternatorBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.alternatorBrand")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.alternatorBrand")}
                    {...field}
                    value={toInputValue(field.value)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* UPS Specific Attributes (Conditional) */}
        {productType === "ups" && (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="upsTopology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.upsTopology")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={t("fields.selectTopology")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="online_double_conversion">
                        {t("topologyOptions.online_double_conversion")}
                      </SelectItem>
                      <SelectItem value="line_interactive">
                        {t("topologyOptions.line_interactive")}
                      </SelectItem>
                      <SelectItem value="offline">
                        {t("topologyOptions.offline")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="upsBatteryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.upsBatteryType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={t("fields.selectBattery")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="internal">
                        {t("batteryOptions.internal")}
                      </SelectItem>
                      <SelectItem value="external">
                        {t("batteryOptions.external")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
