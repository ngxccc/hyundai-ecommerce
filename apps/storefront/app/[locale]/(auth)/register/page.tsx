import { RegisterForm } from "@/features/auth/components/register-form";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "Register" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm />
    </div>
  );
};
export default RegisterPage;
