"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("HomePage");
  const footerProducts = [
    "industrialGenerators",
    "residentialGen",
    "portablePower",
    "atsPanels",
  ] as const;

  return (
    <footer className="bg-surface pt-24 pb-12">
      <div className="mx-auto mb-20 grid max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 md:col-span-2">
          <span className="font-display text-primary mb-6 block text-2xl font-bold tracking-tighter">
            {t("brand")}{" "}
            <span className="text-on-surface font-light opacity-60">
              {t("branchNameUpper")}
            </span>
          </span>
          <p className="text-outline mb-8 max-w-sm font-sans text-sm">
            {t("footer.description")}
          </p>
          {/* Newsletter Subscribe */}
          <div className="flex max-w-md items-end gap-4">
            <div className="flex-1">
              <label
                className="font-display text-primary mb-2 block text-[10px] font-bold tracking-widest uppercase"
                htmlFor="newsletter-email-input"
              >
                {t("footer.newsletterLabel")}
              </label>
              <input
                id="newsletter-email-input"
                type="email"
                autoComplete="email"
                placeholder={t("footer.emailPlaceholder")}
                className="ghost-input text-on-surface w-full py-2 font-sans"
              />
            </div>
            <button className="font-display text-on-surface hover:text-primary pb-2 text-xs font-bold tracking-widest uppercase transition-colors">
              {t("footer.subscribe")}
            </button>
          </div>
        </div>

        <div>
          <h5 className="font-display text-primary mb-6 text-xs font-bold tracking-widest uppercase">
            {t("footer.productsTitle")}
          </h5>
          <ul className="space-y-4">
            {footerProducts.map((item) => (
              <li key={item}>
                <Link
                  className="text-outline hover:text-primary font-sans text-sm transition-colors"
                  href="/"
                >
                  {t(`footer.products.${item}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
