"use client";

import { useTranslations } from "next-intl";

export function PromotionsSection() {
  const t = useTranslations("HomePage");

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-8">
        <div className="from-primary via-primary-container to-primary-container relative flex flex-col items-center justify-between overflow-hidden rounded-2xl bg-linear-to-r p-12 md:flex-row">
          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
          <div className="relative z-10 text-center md:text-left">
            <span className="font-label bg-tertiary mb-4 inline-block rounded-full px-4 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
              {t("promos.badge")}
            </span>
            <h2 className="font-headline mb-4 text-5xl leading-none font-black text-white">
              {t("promos.title")}
              <br />
              {t("promos.subtitle")}
            </h2>
            <p className="text-on-primary-container font-body max-w-md text-lg">
              {t("promos.desc")}
            </p>
          </div>
          <div className="relative z-10 mt-8 flex flex-col items-center md:mt-0 md:items-end">
            <div className="font-headline mb-4 text-8xl leading-none font-black tracking-tighter text-white opacity-20">
              {t("promos.discount")}
            </div>
            <button className="text-primary font-headline hover:bg-surface-container-lowest rounded-lg bg-white px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all">
              {t("promos.cta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
