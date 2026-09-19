"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { VIETNAM_BANKS, findBankByCodeOrBinOrName } from "@/data/vietnam-banks";
import type { UpdateCompanySettingsInput } from "@/validators";

interface CompanyBankSectionProps {
  control: Control<UpdateCompanySettingsInput>;
  langTab: "vi" | "en";
  bankOptions: ComboboxOption[];
  bankSearchFilter: (value: string, search: string) => number;
  onBankSelect: (bankName: string, bin: string) => void;
  disabled?: boolean;
}

export function CompanyBankSection({
  control,
  langTab,
  bankOptions,
  bankSearchFilter,
  onBankSelect,
  disabled = false,
}: CompanyBankSectionProps) {
  const t = useTranslations("adminCompanySettings");

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <CardTitle size="lg">
          <CreditCard className="size-4" />
          {t("sections.bank")}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {t("sections.bankDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent size="dense" className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="bank.bankName"
          render={({ field }) => {
            const currentBank = findBankByCodeOrBinOrName(field.value);
            return (
              <FormItem className="sm:col-span-2">
                <FormLabel required>{t("fields.bankName")}</FormLabel>
                <FormControl>
                  <Combobox
                    options={bankOptions}
                    value={currentBank?.code ?? field.value}
                    onChange={(selectedCode) => {
                      const matched = VIETNAM_BANKS.find(
                        (b) => b.code === selectedCode,
                      );
                      if (matched) {
                        onBankSelect(matched.name, matched.code);
                      } else {
                        field.onChange(selectedCode);
                      }
                    }}
                    placeholder={t("fields.selectBank")}
                    searchPlaceholder={t("fields.searchBank")}
                    emptyText={t("fields.emptyBank")}
                    filter={bankSearchFilter}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="bank.accountNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.accountNo")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="113002859999" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bank.accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t("fields.accountName")}</FormLabel>
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

        {langTab === "vi" ? (
          <FormField
            control={control}
            name="bank.branchVi"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("fields.branch")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Chi nhánh Tây Sài Gòn (Tùy chọn)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={control}
            name="bank.branchEn"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("fields.branch")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Tay Sai Gon Branch (Optional)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
