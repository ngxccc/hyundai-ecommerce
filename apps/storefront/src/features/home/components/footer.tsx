import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

const FOOTERPRODUCTS = [
  "industrialGenerators",
  "residentialGen",
  "portablePower",
  "atsPanels",
] as const;

export function Footer() {
  const t = useTranslations("HomePage");

  // eslint-disable-next-line @typescript-eslint/require-await
  const subscribeToNewsletter = async (formData: FormData) => {
    "use server";
    const email = formData.get("email");
    console.log("Đã nhận được email từ server:", email);
    // TODO: Gọi DB hoặc API mailchimp ở đây
  };

  return (
    <footer className="bg-muted/20 mt-14 border-t pt-14 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1 & 2: Brand + Newsletter */}
          <div className="col-span-1 lg:col-span-2">
            <Link
              href="/"
              className="font-display text-primary mb-6 block text-3xl font-black tracking-tighter transition-opacity hover:opacity-80"
            >
              {t("brand")}{" "}
              <span className="text-foreground font-light opacity-80">
                {t("branchName").toUpperCase()}
              </span>
            </Link>
            <p className="text-muted-foreground mb-8 max-w-md font-sans text-sm leading-relaxed">
              {t("footer.description")}
            </p>

            {/* Newsletter Form */}
            <form
              action={subscribeToNewsletter}
              className="flex w-full max-w-sm items-center space-x-2"
            >
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t("footer.emailPlaceholder")}
                required
                className="bg-background"
              />
              <Button
                type="submit"
                className="font-bold tracking-wider uppercase"
              >
                {t("footer.subscribe")}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Products */}
          <div>
            <h5 className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
              {t("footer.productsTitle")}
            </h5>
            <nav aria-label="Footer Products Navigation">
              <ul className="space-y-2">
                {FOOTERPRODUCTS.map((item) => (
                  <li key={item}>
                    <Link
                      className="text-muted-foreground hover:text-primary font-sans text-sm transition-colors"
                      href={`/products?category=${item}`}
                    >
                      {t(`footer.products.${item}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
              {t("footer.supportTitle")}
            </h5>
            <nav aria-label="Footer Support Navigation">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t("footer.contactQuote")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/warranty"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t("footer.supportTitle")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manuals"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {t("footer.technicalDocs")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="flex flex-col items-center justify-between gap-2 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-xs md:text-sm">
            © {new Date().getFullYear()} {t("brand")}{" "}
            {t("branchName").toUpperCase()}. {t("footer.allRightsReserved")}
          </p>
          <div className="text-muted-foreground flex gap-2 text-xs md:text-sm">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
