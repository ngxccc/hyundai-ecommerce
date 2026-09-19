"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
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

interface CompanyLinksSectionProps {
  control: Control<UpdateCompanySettingsInput>;
}

export function CompanyLinksSection({ control }: CompanyLinksSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <Globe className="size-4" />
          {t("sections.workingHours")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.workingHoursDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={control}
          name="links.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.website")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://hyundainhatnang.vn" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="links.zalo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.zalo")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://zalo.me/0901497771" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="links.facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.facebook")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://facebook.com/hyundainhatnang"
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
