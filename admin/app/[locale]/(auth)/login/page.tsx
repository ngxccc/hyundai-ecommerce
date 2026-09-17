import { LoginForm, AuthHeaderControls } from "@/features/auth/components";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { COMPANY_CONFIG } from "@/constants";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "login",
  });
  return {
    title: t("metaTitle", { brandName: COMPANY_CONFIG.BRAND_NAME }),
  };
}

const AdminLoginPage = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) => {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "login",
  });
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-muted/30 flex min-h-screen w-full flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Controls (Locale / Theme) */}
      <header className="flex w-full items-center justify-end">
        <AuthHeaderControls />
      </header>

      {/* Center: Focused Authentication Card */}
      <main className="mx-auto my-auto w-full max-w-md py-6">
        <LoginForm />
      </main>

      {/* Bottom: Console Footnote & Copyright */}
      <footer className="text-muted-foreground flex w-full flex-col items-center justify-center gap-1.5 text-center text-xs font-medium sm:flex-row sm:justify-between">
        <p>
          {t("copyright", {
            year: String(currentYear),
            company: COMPANY_CONFIG.LEGAL_NAME,
          })}
        </p>
        <p className="text-muted-foreground/80 text-[11px]">
          {t("consoleFootnote", {
            version: COMPANY_CONFIG.CONSOLE_VERSION,
          })}
        </p>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
