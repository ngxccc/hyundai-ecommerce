import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Terminal,
  Home,
  Headset,
  ArrowRight,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <main className="bg-background relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05]">
        <Activity
          className="h-[120vw] w-[120vw] md:h-[60vw] md:w-[60vw]"
          strokeWidth={0.5}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Cột Trái: Báo lỗi Hệ thống */}
        <div className="flex flex-col items-start text-left lg:col-span-7">
          <div className="text-primary mb-6 flex items-center gap-4 text-sm tracking-[0.3em] uppercase">
            <span className="bg-primary h-px w-12"></span>
            <span className="font-bold">{t("status")}</span>
          </div>

          <h1 className="font-display text-foreground mb-8 flex flex-col text-[12vw] leading-[0.85] font-black tracking-tighter lg:text-[10rem]">
            <span className="opacity-20">ERROR</span>
            <span className="text-primary -mt-4 lg:-mt-10">404</span>
          </h1>

          <div className="mb-12 flex flex-col gap-2">
            <code className="text-destructive flex items-center gap-3 text-lg font-bold lg:text-xl">
              <Terminal className="h-5 w-5" />
              {t("errorCode")}
            </code>
            <p className="border-muted text-muted-foreground mt-4 max-w-md border-l-2 py-2 pl-6 text-lg">
              {t("errorMessage")}
            </p>
          </div>
        </div>

        {/* Cột Phải: Các nút điều hướng (Interaction Matrix) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Action Card 1: Về Trang Chủ */}
          <Card className="group border-muted/50 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <Link href="/" className="block cursor-pointer p-8">
              <CardContent className="p-0">
                <div className="mb-12 flex items-start justify-between">
                  <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                    <Home className="h-6 w-6" />
                  </div>
                  <span className="text-muted-foreground text-xs tracking-widest uppercase">
                    {t("actions.home.tag")}
                  </span>
                </div>

                <h3 className="font-display text-foreground group-hover:text-primary mb-2 text-2xl font-bold transition-colors">
                  {t("actions.home.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("actions.home.description")}
                </p>

                <div className="text-primary mt-6 flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-all group-hover:gap-4">
                  {t("actions.home.button")} <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Action Card 2: Liên hệ Hỗ trợ */}
          <Card className="group border-muted/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <Link href="/contact" className="block cursor-pointer p-8">
              <CardContent className="p-0">
                <div className="mb-12 flex items-start justify-between">
                  <div className="bg-muted text-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                    <Headset className="h-6 w-6" />
                  </div>
                  <span className="text-muted-foreground text-xs tracking-widest uppercase">
                    {t("actions.support.tag")}
                  </span>
                </div>

                <h3 className="font-display text-foreground mb-2 text-2xl font-bold">
                  {t("actions.support.title")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("actions.support.description")}
                </p>

                <div className="text-foreground mt-6 flex items-center gap-2 text-sm font-bold tracking-wider uppercase transition-all group-hover:gap-4">
                  {t("actions.support.button")}{" "}
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
