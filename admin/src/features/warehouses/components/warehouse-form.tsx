"use client";

import { useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
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
import type { WarehouseDTO } from "@/shared/types/admin-schema.types";
import {
  type CreateWarehouseInput,
  createWarehouseSchema,
} from "@/shared/validators";
import { Save, Loader2, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

export const WarehouseForm = ({
  initialData,
  breadcrumbs,
}: {
  initialData?: WarehouseDTO;
  breadcrumbs?: ReactNode;
}) => {
  const t = useTranslations("AdminWarehouseForm");
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

  const onSubmit = (data: CreateWarehouseInput) => {
    startTransition(async () => {
      try {
        if (isEditing && initialData) {
          const res = await updateWarehouseAction(initialData.id, data);
          if (res.success) {
            toast.success(t("messages.successUpdate"));
            router.push("/warehouses");
          } else {
            toast.error(res.error || t("messages.error"));
          }
        } else {
          const res = await createWarehouseAction(data);
          if (res.success) {
            toast.success(t("messages.successCreate"));
            router.push("/warehouses");
          } else {
            toast.error(res.error || t("messages.error"));
          }
        }
      } catch (e) {
        console.error(e);
        toast.error(t("messages.error"));
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      {breadcrumbs}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {isEditing ? t("editTitle") : t("title")}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/warehouses")}
            disabled={isPending}
          >
            <X className="mr-1.5 size-4" />
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            className="min-w-28"
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            {t("buttons.save")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("placeholders.name")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("fields.streetAddress")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("placeholders.streetAddress")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.district")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("placeholders.district")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.city")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("placeholders.city")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 pt-4 sm:col-span-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0 space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        {t("fields.isActive")}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
