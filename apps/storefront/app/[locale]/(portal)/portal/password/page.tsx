import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { PasswordForm } from "@/features/portal/components/password-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Portal.password" });
  return { title: `${t("title")} | Hyundai B2B Storefront` };
}

export default async function PasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Portal.password" });

  return (
    <div>
      <div className="mb-6 border-b border-zinc-100 pb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("description")}</p>
      </div>

      <PasswordForm />
    </div>
  );
}
