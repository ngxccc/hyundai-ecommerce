"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
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

interface CompanyHotlinesSectionProps {
  control: Control<UpdateCompanySettingsInput>;
  langTab: "vi" | "en";
}

export function CompanyHotlinesSection({
  control,
  langTab,
}: CompanyHotlinesSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <Phone className="size-4" />
          {t("sections.hotlines")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.hotlinesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="space-y-4">
        {/* Project Hotline */}
        <div className="bg-muted/20 rounded-lg border p-4">
          <h4 className="text-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            {t("subsections.projectHotline")}
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={control}
              name="hotlines.project.raw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hotlineRaw")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0901497771" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hotlines.project.display"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hotlineDisplay")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0901 49 7771" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {langTab === "vi" ? (
              <FormField
                control={control}
                name="hotlines.project.labelVi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.hotlineLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dự án & Báo giá B2B" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={control}
                name="hotlines.project.labelEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.hotlineLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="B2B Projects & Quotation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Technical Hotline */}
        <div className="bg-muted/20 rounded-lg border p-4">
          <h4 className="text-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            {t("subsections.technicalHotline")}
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={control}
              name="hotlines.technical.raw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hotlineRaw")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0982890698" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="hotlines.technical.display"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fields.hotlineDisplay")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0982 89 0698" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {langTab === "vi" ? (
              <FormField
                control={control}
                name="hotlines.technical.labelVi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.hotlineLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hỗ trợ Kỹ thuật 24/7" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={control}
                name="hotlines.technical.labelEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.hotlineLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="24/7 Technical Support" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
