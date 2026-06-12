import { LoginForm } from "@/features/auth/components/login-form";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AuthPage" });

  return (
    <AuthPageShell fallbackLabel={t("loading")}>
      <LoginForm />
    </AuthPageShell>
  );
}
