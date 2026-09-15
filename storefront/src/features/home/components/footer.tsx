import { CopyrightYear } from "./copyright-year";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { companyConfig } from "@/config/company";

export async function Footer() {
  const t = await getTranslations("HomePage");

  return (
    <footer className="bg-muted/20 mt-10 border-t pt-14 pb-4 lg:mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Legal Entity & Overview */}
          <div>
            <Link
              href="/"
              className="font-display text-primary mb-4 block text-2xl font-black tracking-tighter transition-opacity hover:opacity-80"
            >
              {t("brand")}{" "}
              <span className="text-foreground font-light opacity-80">
                {t("branchName").toUpperCase()}
              </span>
            </Link>
            <p className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              {t("footer.companyName")}
            </p>
            <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <p className="text-muted-foreground text-xs">{t("footer.taxId")}</p>
          </div>

          {/* Column 2: Headquarters & Warehouses */}
          <div>
            <div className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
              {t("footer.headquartersTitle")}
            </div>
            <ul className="text-muted-foreground space-y-2.5 text-sm leading-relaxed">
              <li>{t("footer.headquarters")}</li>
              <li>{t("footer.branchHcm")}</li>
              <li>{t("footer.warehouse")}</li>
            </ul>
          </div>

          {/* Column 3: Services & Technical Support */}
          <div>
            <div className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
              {t("footer.servicesTitle")}
            </div>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>{t("footer.service1")}</li>
              <li>{t("footer.service2")}</li>
              <li>{t("footer.service3")}</li>
              <li>{t("footer.service4")}</li>
            </ul>
          </div>

          {/* Column 4: Projects & Contact */}
          <div>
            <div className="font-display text-foreground mb-4 text-sm font-bold tracking-widest uppercase">
              {t("footer.contactTitle")}
            </div>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                <a
                  href={`tel:${companyConfig.hotlines.project.raw}`}
                  className="hover:text-primary transition-colors"
                >
                  {companyConfig.hotlines.project.display} (Dự án)
                </a>
              </li>
              <li>
                <a
                  href={`tel:${companyConfig.hotlines.technical.raw}`}
                  className="hover:text-primary transition-colors"
                >
                  {companyConfig.hotlines.technical.display} (Kỹ thuật)
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${companyConfig.emails.project}`}
                  className="hover:text-primary transition-colors"
                >
                  {companyConfig.emails.project}
                </a>
              </li>
              <li className="pt-1 text-xs">{t("footer.workingHours")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="flex flex-col items-center justify-between gap-2 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-xs md:text-sm">
            © <CopyrightYear /> {t("footer.companyName")}.{" "}
            {t("footer.allRightsReserved")}
          </p>
          <div className="text-muted-foreground flex gap-4 text-xs md:text-sm">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <span>•</span>
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
