import { getTranslations } from "next-intl/server";
import { Button } from "@nhatnang/ui/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { env } from "@/env";
import type { Locale } from "next-intl";
import { routing } from "@/i18n/routing";

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
    namespace: "Forbidden",
  });
  return { title: t("status") };
}

const ForbiddenPage = async ({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) => {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "Forbidden",
  });
  const storefrontUrl = env.NEXT_PUBLIC_APP_URL;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="flex max-w-md flex-col items-center space-y-6">
        <div className="bg-destructive/10 rounded-full p-6">
          <ShieldAlert className="text-destructive h-12 w-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("status")}</h1>
          <p className="text-muted-foreground">{t("errorMessage")}</p>
        </div>

        <Button asChild className="mt-8" size="lg">
          <a href={storefrontUrl}>{t("button")}</a>
        </Button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
