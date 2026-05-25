import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Terminal, Home, Headset } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

const NotFoundPage = () => {
  const t = useTranslations("NotFound");

  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center p-3">
      <Card className="w-full max-w-2xl border-none shadow-none">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
            <Terminal className="text-primary h-10 w-10" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight">
            404
          </CardTitle>
          <div className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            {t("status")}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="bg-destructive/10 text-destructive inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium">
            <Terminal className="h-4 w-4" />
            {t("errorCode")}
          </div>
          <p className="text-muted-foreground mx-auto max-w-lg text-lg">
            {t("errorMessage")}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t("actions.home.title")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/contact">
              <Headset className="mr-2 h-4 w-4" />
              {t("actions.support.title")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFoundPage;
