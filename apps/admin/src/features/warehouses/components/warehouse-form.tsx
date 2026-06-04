"use client";

import { useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { useTranslations } from "next-intl";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import {
  createWarehouseAction,
  updateWarehouseAction,
} from "../actions/warehouse.actions";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { type TWarehouse } from "@nhatnang/database/schemas";
import { type TCreateWarehouseInput, createWarehouseSchema } from "@nhatnang/database/validators";
import { Save, Loader2, X, Info } from "lucide-react";

export const WarehouseForm = ({
  initialData,
  breadcrumbs,
}: {
  initialData?: TWarehouse;
  breadcrumbs?: ReactNode;
}) => {
  const t = useTranslations("AdminWarehouseForm");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<TCreateWarehouseInput>({
    resolver: translatedZodResolver(createWarehouseSchema, t),
    defaultValues: {
      name: initialData?.name ?? "",
      streetAddress: initialData?.streetAddress ?? "",
      district: initialData?.district ?? "",
      city: initialData?.city ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = (data: TCreateWarehouseInput) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateWarehouseAction(initialData.id, {
            ...data,
            id: initialData.id,
          })
        : await createWarehouseAction(data);

      if (result.success) {
        toast.success(
          isEditing ? t("messages.successUpdate") : t("messages.successCreate"),
        );
        router.push("/warehouses");
        router.refresh();
      } else {
        toast.error(result.error ?? t("messages.error"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-background/80 sticky top-15 z-30 -mx-4 mb-2 flex items-center justify-between rounded-none px-4 pb-2 backdrop-blur-md sm:top-20 sm:-mx-6 sm:px-6 sm:pt-1 sm:pb-2">
          <div className="hidden flex-1 sm:block">{breadcrumbs}</div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-fit">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/warehouses")}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? t("buttons.save") : t("buttons.create")}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 gap-4 py-4 shadow-sm md:col-span-2 lg:col-span-2">
            <CardHeader className="border-b px-4 pb-1!">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <Info className="text-primary h-5 w-5" />
                {t("sections.general")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.name")}</FormLabel>
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
                    <FormLabel>{t("fields.streetAddress")}</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.district")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.district")}
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.city")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.city")}
                          disabled={isPending}
                          {...field}
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
                  <FormItem className="mt-2 flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t("fields.isActive")}</FormLabel>
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
