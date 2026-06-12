import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/features/auth/components/register-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Register" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "AuthPage" });

  return (
    <AuthPageShell fallbackLabel={t("loading")} fallbackClassName="max-w-2xl">
      <RegisterForm />
    </AuthPageShell>
  );
}
