import { Suspense } from "react";
import { LoginForm, AuthHeaderControls } from "@/features/auth/components";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { COMPANY_CONFIG } from "@/constants";
import { companySettingsApi } from "@/features/settings/api/company-settings.api";
import type { Metadata } from "next";
import { connection } from "next/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "login",
  });

  return {
    title: t("metaTitle", { brandName: COMPANY_CONFIG.BRAND_NAME }),
  };
}

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "login",
  });

  return (
    <div className="bg-muted/30 flex min-h-screen w-full flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Controls (Locale / Theme) */}
      <header className="flex w-full items-center justify-end">
        <AuthHeaderControls />
      </header>

      {/* Center: Focused Authentication Card */}
      <main className="mx-auto my-auto w-full max-w-md py-6">
        <Suspense fallback={<LoginForm />}>
          <LoginDynamicCard />
        </Suspense>
      </main>

      {/* Bottom: Console Footnote & Copyright */}
      <footer className="text-muted-foreground flex w-full flex-col items-center justify-center gap-1.5 text-center text-xs font-medium sm:flex-row sm:justify-between">
        <Suspense
          fallback={
            <p>
              {t("copyright", {
                year: "2026",
                company: COMPANY_CONFIG.LEGAL_NAME,
              })}
            </p>
          }
        >
          <LoginFooterCopyright locale={locale} />
        </Suspense>
        <p className="text-muted-foreground/80 text-[11px]">
          {t("consoleFootnote", {
            version: COMPANY_CONFIG.CONSOLE_VERSION,
          })}
        </p>
      </footer>
    </div>
  );
}

async function LoginDynamicCard() {
  await connection();
  let supportEmail: string = COMPANY_CONFIG.SUPPORT_EMAIL;
  let supportHotline: string = COMPANY_CONFIG.HOTLINES.HCM;

  try {
    const { data: res } = await companySettingsApi.get();
    if (res?.data) {
      supportEmail =
        res.data.emails.support ||
        res.data.emails.general ||
        COMPANY_CONFIG.SUPPORT_EMAIL;
      supportHotline =
        res.data.hotlines.technical.display ||
        res.data.hotlines.project.display ||
        COMPANY_CONFIG.HOTLINES.HCM;
    }
  } catch {
    // Fail-open to default constants if backend is offline
  }

  return (
    <LoginForm supportEmail={supportEmail} supportHotline={supportHotline} />
  );
}

async function LoginFooterCopyright({ locale }: { locale: Locale }) {
  await connection();
  const t = await getTranslations({ locale, namespace: "login" });
  const currentYear = new Date().getFullYear();
  let legalName: string = COMPANY_CONFIG.LEGAL_NAME;

  try {
    const { data: res } = await companySettingsApi.get();
    if (res?.data) {
      legalName =
        locale === "en"
          ? res.data.legalNameEn || res.data.legalNameVi
          : res.data.legalNameVi;
    }
  } catch {
    // Fail-open to default constants if backend is offline
  }

  return (
    <p>
      {t("copyright", {
        year: String(currentYear),
        company: legalName,
      })}
    </p>
  );
}
