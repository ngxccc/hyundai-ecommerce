"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Save, Loader2 } from "lucide-react";
import { LocaleTabs } from "@/components/common/locale-tabs";
import type { ComboboxOption } from "@/components/ui/combobox";
import { VIETNAM_BANKS } from "@/data/vietnam-banks";
import type { AdminCompanySettings } from "@/types/api";
import {
  updateCompanySettingsInputSchema,
  type UpdateCompanySettingsInput,
} from "@/validators";
import { updateCompanySettingsAction } from "../actions/company-settings.actions";
import { CompanyLegalSection } from "./sections/company-legal-section";
import { CompanyHotlinesSection } from "./sections/company-hotlines-section";
import { CompanyEmailsSection } from "./sections/company-emails-section";
import { CompanyAddressesSection } from "./sections/company-addresses-section";
import { CompanyBankSection } from "./sections/company-bank-section";
import { CompanyLinksSection } from "./sections/company-links-section";

interface CompanySettingsFormProps {
  initialData: AdminCompanySettings;
}

export function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [langTab, setLangTab] = useState<"vi" | "en">("vi");
  const t = useTranslations("adminCompanySettings");

  const bankOptions: ComboboxOption[] = useMemo(
    () =>
      VIETNAM_BANKS.map((b) => ({
        value: b.code,
        label: b.name,
      })),
    [],
  );

  const bankSearchFilter = (value: string, search: string): number => {
    const bank = VIETNAM_BANKS.find((b) => b.code === value);
    if (!bank) return 0;
    const s = search.toLowerCase().trim();
    if (
      bank.code.toLowerCase().includes(s) ||
      bank.shortName.toLowerCase().includes(s) ||
      bank.name.toLowerCase().includes(s) ||
      bank.bin.includes(s)
    ) {
      return 1;
    }
    return 0;
  };

  const form = useForm<UpdateCompanySettingsInput>({
    resolver: zodResolver(updateCompanySettingsInputSchema),
    defaultValues: {
      legalNameVi: initialData.legalNameVi,
      legalNameEn: initialData.legalNameEn,
      shortName: initialData.shortName,
      brandName: initialData.brandName,
      brandTitle: initialData.brandTitle,
      brandFullName: initialData.brandFullName,
      taxId: initialData.taxId,
      hotlines: {
        project: {
          raw: initialData.hotlines.project.raw,
          display: initialData.hotlines.project.display,
          formatted: initialData.hotlines.project.formatted ?? "",
          labelVi: initialData.hotlines.project.labelVi ?? "",
          labelEn: initialData.hotlines.project.labelEn ?? "",
        },
        technical: {
          raw: initialData.hotlines.technical.raw,
          display: initialData.hotlines.technical.display,
          formatted: initialData.hotlines.technical.formatted ?? "",
          labelVi: initialData.hotlines.technical.labelVi ?? "",
          labelEn: initialData.hotlines.technical.labelEn ?? "",
        },
        general: {
          raw: initialData.hotlines.general?.raw ?? "",
          display: initialData.hotlines.general?.display ?? "",
          formatted: initialData.hotlines.general?.formatted ?? "",
        },
      },
      emails: {
        sales: initialData.emails.sales,
        project: initialData.emails.project,
        support: initialData.emails.support,
        general: initialData.emails.general,
      },
      addresses: {
        headquarters: {
          vi: initialData.addresses.headquarters.vi,
          en: initialData.addresses.headquarters.en,
        },
        warehouse: {
          vi: initialData.addresses.warehouse.vi,
          en: initialData.addresses.warehouse.en,
        },
      },
      workingHours: {
        vi: initialData.workingHours.vi,
        en: initialData.workingHours.en,
      },
      links: {
        website: initialData.links.website,
        zalo: initialData.links.zalo ?? "",
        facebook: initialData.links.facebook ?? "",
      },
      bank: {
        bankName: initialData.bank.bankName,
        branchVi: initialData.bank.branchVi,
        branchEn: initialData.bank.branchEn,
        accountNo: initialData.bank.accountNo,
        accountName: initialData.bank.accountName,
        bin: initialData.bank.bin,
        qrTemplate: initialData.bank.qrTemplate,
      },
    },
  });

  const hasViErrors = Boolean(
    form.formState.errors.legalNameVi ??
    form.formState.errors.addresses?.headquarters?.vi ??
    form.formState.errors.addresses?.warehouse?.vi ??
    form.formState.errors.workingHours?.vi ??
    form.formState.errors.bank?.branchVi ??
    form.formState.errors.hotlines?.project?.labelVi ??
    form.formState.errors.hotlines?.technical?.labelVi,
  );

  const hasEnErrors = Boolean(
    form.formState.errors.legalNameEn ??
    form.formState.errors.addresses?.headquarters?.en ??
    form.formState.errors.addresses?.warehouse?.en ??
    form.formState.errors.workingHours?.en ??
    form.formState.errors.bank?.branchEn ??
    form.formState.errors.hotlines?.project?.labelEn ??
    form.formState.errors.hotlines?.technical?.labelEn,
  );

  const handleBankSelect = (bankName: string, bin: string) => {
    form.setValue("bank.bankName", bankName, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("bank.bin", bin, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = (data: UpdateCompanySettingsInput) => {
    startTransition(async () => {
      try {
        const res = await updateCompanySettingsAction(data);
        if (res.success) {
          toast.success(t("messages.successUpdate"));
        } else {
          toast.error(res.error ?? t("messages.error"));
        }
      } catch {
        toast.error(t("messages.unexpectedError"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Sticky Control Bar */}
        <div className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-xs">
          <div className="flex items-center gap-4">
            <LocaleTabs
              activeLocale={langTab}
              onLocaleChange={setLangTab}
              hasErrors={{ vi: hasViErrors, en: hasEnErrors }}
            />
            <span className="text-muted-foreground hidden text-xs sm:inline">
              {t("lastUpdated")}{" "}
              <strong className="text-foreground">
                {new Date(initialData.updatedAt).toLocaleString()}
              </strong>
            </span>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 shadow-xs"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("buttons.save")}
          </Button>
        </div>

        {/* 1. Legal & Brand Identity */}
        <CompanyLegalSection control={form.control} langTab={langTab} />

        {/* 2. Contact Hotlines */}
        <CompanyHotlinesSection control={form.control} langTab={langTab} />

        {/* 3. Corporate Emails */}
        <CompanyEmailsSection control={form.control} />

        {/* 4. Operating Locations & Working Hours */}
        <CompanyAddressesSection control={form.control} langTab={langTab} />

        {/* 5. Banking Details & VietQR */}
        <CompanyBankSection
          control={form.control}
          langTab={langTab}
          bankOptions={bankOptions}
          bankSearchFilter={bankSearchFilter}
          onBankSelect={handleBankSelect}
          disabled={isPending}
        />

        {/* 6. Web & Social Media Links */}
        <CompanyLinksSection control={form.control} />
      </form>
    </Form>
  );
}
