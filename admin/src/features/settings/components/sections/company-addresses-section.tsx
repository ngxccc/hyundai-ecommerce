"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UpdateCompanySettingsInput } from "@/validators";

interface CompanyAddressesSectionProps {
  control: Control<UpdateCompanySettingsInput>;
  langTab: "vi" | "en";
}

export function CompanyAddressesSection({
  control,
  langTab,
}: CompanyAddressesSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <MapPin className="size-4" />
          {t("sections.addresses")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.addressesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="space-y-4">
        {langTab === "vi" ? (
          <>
            <FormField
              control={control}
              name="addresses.headquarters.vi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hqAddress")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="310/61 Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP.HCM"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="addresses.warehouse.vi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.warehouseAddress")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Kho Sóng Thần, Dĩ An, Bình Dương"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="workingHours.vi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.workingHours")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Thứ 2 - Thứ 7: 08:00 - 17:30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={control}
              name="addresses.headquarters.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hqAddress")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="310/61 Chien Luoc, Binh Tri Dong A Ward, Binh Tan District, HCMC"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="addresses.warehouse.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.warehouseAddress")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Song Than Warehouse, Di An, Binh Duong"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="workingHours.en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.workingHours")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mon - Sat: 08:00 - 17:30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
