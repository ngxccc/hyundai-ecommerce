import {
  AuthPageShell,
  LoginFormWithSearchParams,
} from "@/features/auth/components";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const LoginPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "AuthPage" });

  return (
    <AuthPageShell fallbackLabel={t("loading")}>
      <LoginFormWithSearchParams />
    </AuthPageShell>
  );
};

export default LoginPage;
