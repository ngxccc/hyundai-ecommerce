import { LoginForm } from "@/features/auth/components/login-form";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "Login",
  });
  return {
    title: t.rich("title", {
      br: () => "",
    }),
  };
}

const AdminLoginPage = () => {
  return (
    <div className="bg-muted/20 flex h-full flex-col items-center justify-center p-3">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
