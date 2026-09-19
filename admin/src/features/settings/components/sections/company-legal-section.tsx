"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
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

interface CompanyLegalSectionProps {
  control: Control<UpdateCompanySettingsInput>;
  langTab: "vi" | "en";
}

export function CompanyLegalSection({
  control,
  langTab,
}: CompanyLegalSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <Building2 className="size-4" />
          {t("sections.legal")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.legalDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="grid gap-4 sm:grid-cols-2">
        {langTab === "vi" ? (
          <FormField
            control={control}
            name="legalNameVi"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel required>{t("fields.legalNameVi")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={control}
            name="legalNameEn"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel required>{t("fields.legalNameEn")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.taxId")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0316447814" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shortName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.shortName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Hyundai Nhật Năng" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brandTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.brandTitle")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="HYUNDAI POWER PRODUCTS" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brandFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.brandFullName")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Hyundai Power Products Vietnam"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
