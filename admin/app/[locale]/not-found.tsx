import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Terminal, Home, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const t = useTranslations("notFound");

  return (
    <div className="bg-background flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center space-y-6">
        {/* Terminal Icon Badge */}
        <div className="bg-primary/10 flex size-20 items-center justify-center rounded-full">
          <Terminal className="text-primary size-10" />
        </div>

        {/* 404 Heading & Status */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <h1 className="text-foreground text-5xl font-extrabold tracking-tight sm:text-6xl">
            404
          </h1>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            {t("status")}
          </p>
        </div>

        {/* Error Code Tag */}
        <div className="bg-destructive/10 text-destructive inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium">
          <Terminal className="size-3.5" />
          <span>{t("errorCode")}</span>
        </div>

        {/* Descriptive Message */}
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed sm:text-base">
          {t("errorMessage")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            asChild
            size="default"
            className="w-full gap-2 shadow-xs sm:w-auto"
          >
            <Link href="/">
              <Home className="size-4" />
              <span>{t("actions.home.title")}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="default"
            className="w-full gap-2 shadow-xs sm:w-auto"
          >
            <Link href="/contact">
              <Headset className="size-4" />
              <span>{t("actions.support.title")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
