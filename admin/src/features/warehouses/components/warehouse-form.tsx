"use client";

import { useTransition, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "@/i18n/routing";
import {
  createWarehouseAction,
  updateWarehouseAction,
} from "../actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  getProvinceNames,
  getSubUnitsByProvinceName,
  removeVietnameseTones,
} from "@/data/vietnam-provinces";
import type { AdminWarehouse } from "@/types/api";
import { type CreateWarehouseInput, createWarehouseSchema } from "@/validators";
import { Save, Loader2, X, Warehouse } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarehouseHeader } from "./warehouse-header";

const VIETNAM_LOCATION_ALIASES: Record<string, string> = {
  hcm: "ho chi minh",
  "tp.hcm": "ho chi minh",
  tphcm: "ho chi minh",
  hn: "ha noi",
  "tp.hn": "ha noi",
  tphn: "ha noi",
  dn: "da nang",
  hp: "hai phong",
  ct: "can tho",
  bd: "binh duong",
  dnai: "dong nai",
};

export const WarehouseForm = ({
  initialData,
}: {
  initialData?: AdminWarehouse;
}) => {
  const t = useTranslations("adminWarehouseForm");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<CreateWarehouseInput>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: {
      name: initialData?.nameVi ?? "",
      nameVi: initialData?.nameVi ?? "",
      nameEn: initialData?.nameEn ?? "",
      streetAddress: initialData?.streetAddress ?? "",
      district: initialData?.district ?? "",
      city: initialData?.city ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedCity = useWatch({
    control: form.control,
    name: "city",
  });

  // Transform string arrays into standard ComboboxOption[]
  const provinceOptions = useMemo<ComboboxOption[]>(() => {
    return getProvinceNames().map((name) => ({
      value: name,
      label: name,
    }));
  }, []);

  const subUnitOptions = useMemo<ComboboxOption[]>(() => {
    if (!selectedCity) return [];
    return getSubUnitsByProvinceName(selectedCity).map((name) => ({
      value: name,
      label: name,
    }));
  }, [selectedCity]);

  // cmdk custom filter for Vietnamese administrative locations
  const addressSearchFilter = useCallback(
    (itemValue: string, query: string): number => {
      const trimmed = query.trim();
      if (!trimmed) return 1;

      const normalizedQuery = removeVietnameseTones(trimmed);
      const normalizedValue = removeVietnameseTones(itemValue);
      const alias = VIETNAM_LOCATION_ALIASES[normalizedQuery];

      const isMatch =
        normalizedValue.includes(normalizedQuery) ||
        (Boolean(alias) && normalizedValue.includes(alias));

      return isMatch ? 1 : 0;
    },
    [],
  );

  const handleCityChange = (city: string) => {
    form.setValue("city", city, { shouldValidate: true });
    form.setValue("district", "", { shouldValidate: true }); // reset district when city changes
  };

  const handleDistrictChange = (district: string) => {
    form.setValue("district", district, { shouldValidate: true });
  };

  const onSubmit = (data: CreateWarehouseInput) => {
    startTransition(async () => {
      try {
        if (initialData) {
          const res = await updateWarehouseAction(initialData.id, data);
          if (res.success) {
            toast.success(t("messages.successUpdate"));
            router.push("/warehouses");
            router.refresh();
          } else {
            toast.error(res.error ?? t("messages.error"));
          }
        } else {
          const res = await createWarehouseAction(data);
          if (res.success) {
            toast.success(t("messages.successCreate"));
            router.push("/warehouses");
            router.refresh();
          } else {
            toast.error(res.error ?? t("messages.error"));
          }
        }
      } catch (e) {
        console.error(e);
        toast.error(t("messages.error"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with Cancel and Save actions in top right */}
        <WarehouseHeader
          title={isEditing ? t("editTitle") : t("title")}
          description={isEditing ? t("editDescription") : t("description")}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shadow-xs"
                onClick={() => router.push("/warehouses")}
                disabled={isPending}
              >
                <X className="mr-1.5 h-4 w-4" />
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 shadow-xs"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                {isEditing ? t("buttons.save") : t("buttons.create")}
              </Button>
            </div>
          }
        />

        <div className="mx-auto space-y-6">
          <Card size="dense">
            <CardHeader bordered size="dense">
              <CardTitle size="lg">
                <Warehouse className="size-4" />
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent size="dense" className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.name")}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("fields.streetAddress")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.streetAddress")}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Tỉnh/Thành phố chọn trước */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("fields.city")}</FormLabel>
                      <FormControl>
                        <Combobox
                          options={provinceOptions}
                          value={field.value}
                          onChange={handleCityChange}
                          filter={addressSearchFilter}
                          placeholder={t("placeholders.city")}
                          searchPlaceholder="Tìm tỉnh/thành phố..."
                          emptyText="Không tìm thấy tỉnh/thành phố"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quận/Huyện chọn dựa theo Tỉnh/Thành phố */}
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("fields.district")}</FormLabel>
                      <FormControl>
                        <Combobox
                          options={subUnitOptions}
                          value={field.value}
                          onChange={handleDistrictChange}
                          filter={addressSearchFilter}
                          disabled={isPending || !selectedCity}
                          placeholder={
                            selectedCity
                              ? t("placeholders.district")
                              : "Chọn Tỉnh/Thành trước"
                          }
                          searchPlaceholder="Tìm quận/huyện/thị xã..."
                          emptyText="Không tìm thấy quận/huyện"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="border-border/60 flex flex-row items-center space-y-0 space-x-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">
                        {t("fields.isActive")}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};
