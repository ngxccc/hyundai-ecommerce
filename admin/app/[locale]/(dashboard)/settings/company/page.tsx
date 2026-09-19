import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { CenteredSpinner } from "@/components/common";
import { AdminBreadcrumbs } from "@/components/common/admin-breadcrumbs";
import { companySettingsApi } from "@/features/settings/api/company-settings.api";
import { CompanySettingsHeader } from "@/features/settings/components/company-settings-header";
import { CompanySettingsForm } from "@/features/settings/components/company-settings-form";
import type { AdminCompanySettings } from "@/types/api";
import { AlertCircle } from "lucide-react";

const EMPTY_COMPANY_SETTINGS: AdminCompanySettings = {
  id: "019de1a0-0000-7000-8000-000000000099",
  legalNameVi: "",
  legalNameEn: "",
  shortName: "",
  brandName: "",
  brandTitle: "",
  brandFullName: "",
  taxId: "",
  hotlines: {
    project: {
      raw: "",
      display: "",
      formatted: "",
      labelVi: "Dự án & Báo giá B2B",
      labelEn: "B2B Projects & Quotation",
    },
    technical: {
      raw: "",
      display: "",
      formatted: "",
      labelVi: "Hỗ trợ Kỹ thuật 24/7",
      labelEn: "24/7 Technical Support",
    },
  },
  emails: { sales: "", project: "", support: "", general: "" },
  addresses: {
    headquarters: { vi: "", en: "" },
    warehouse: { vi: "", en: "" },
  },
  workingHours: { vi: "", en: "" },
  links: { website: "", zalo: "", facebook: "" },
  bank: {
    bankName: "",
    branchVi: "",
    branchEn: "",
    accountNo: "",
    accountName: "",
    bin: "",
    qrTemplate: "qr_only",
  },
  updatedAt: new Date().toISOString(),
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "adminDashboard.nav" });

  return {
    title: t("companySettings"),
  };
}

export default async function CompanySettingsPage() {
  const [tNav, tHeader, tNotice] = await Promise.all([
    getTranslations("adminDashboard.nav"),
    getTranslations("adminCompanySettings.header"),
    getTranslations("adminCompanySettings.notice"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminBreadcrumbs
        items={[
          { label: tNav("overview"), href: "/" },
          { label: tNav("companySettings") },
        ]}
      />
      <CompanySettingsHeader
        title={tHeader("title")}
        description={tHeader("description")}
      />
      <Suspense fallback={<CenteredSpinner variant="content" />}>
        <CompanySettingsContent
          noticeTitle={tNotice("notConfiguredTitle")}
          noticeDesc={tNotice("notConfiguredDescription")}
          serverErrorTitle={tNotice("serverErrorTitle")}
          serverErrorDesc={tNotice("serverErrorDescription")}
        />
      </Suspense>
    </div>
  );
}

interface CompanySettingsContentProps {
  noticeTitle: string;
  noticeDesc: string;
  serverErrorTitle: string;
  serverErrorDesc: string;
}

async function CompanySettingsContent({
  noticeTitle,
  noticeDesc,
  serverErrorTitle,
  serverErrorDesc,
}: CompanySettingsContentProps) {
  await connection();
  let initialData = EMPTY_COMPANY_SETTINGS;
  let isNotConfigured = false;
  let isConnectionError = false;

  try {
    const { data: res } = await companySettingsApi.get();
    if (res?.data) {
      initialData = res.data;
    } else {
      isNotConfigured = true;
    }
  } catch (err) {
    console.error("[CompanySettingsContent] Backend fetch failed:", err);
    isConnectionError = true;
  }

  return (
    <div className="space-y-6">
      {isConnectionError ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            <strong>{serverErrorTitle}</strong> {serverErrorDesc}
          </p>
        </div>
      ) : isNotConfigured ? (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p>
            <strong>{noticeTitle}</strong> {noticeDesc}
          </p>
        </div>
      ) : null}
      <CompanySettingsForm initialData={initialData} />
    </div>
  );
}
