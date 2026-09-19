"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
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

interface CompanyEmailsSectionProps {
  control: Control<UpdateCompanySettingsInput>;
}

export function CompanyEmailsSection({ control }: CompanyEmailsSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <Mail className="size-4" />
          {t("sections.emails")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.emailsDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="emails.sales"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.salesEmail")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="sales@hyundainhatnang.vn"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="emails.project"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.projectEmail")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="duan@hyundainhatnang.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="emails.support"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.supportEmail")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="support@hyundainhatnang.vn"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="emails.general"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.generalEmail")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="contact@hyundainhatnang.vn"
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
