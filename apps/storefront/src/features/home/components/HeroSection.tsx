"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("HomePage");

  return (
    <section className="bg-surface relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/may-phat-dien-1.jpg"
          alt="Industrial power system"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="eager"
        />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-xl">
          <div className="relative isolate rounded-3xl p-6 md:p-8">
            <div className="bg-surface/45 pointer-events-none absolute inset-0 -z-10 rounded-3xl backdrop-blur-md" />

            <div className="bg-surface-container-high mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm">
              <span className="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
              <span className="font-display text-on-surface text-[10px] font-bold tracking-widest uppercase">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="font-display text-on-surface mb-6 text-6xl leading-[1.05] font-black tracking-tighter md:text-7xl">
              {t("hero.titleLine1")} <br />
              <span className="text-primary font-light italic">
                {t("hero.titleLine2")}
              </span>
            </h1>
            <p className="text-outline mb-10 max-w-md font-sans text-lg leading-relaxed">
              {t("hero.description")}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="bg-on-surface text-on-primary font-display hover:bg-primary flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors">
                {t("hero.primaryCta")}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
              <button className="font-display bg-surface-container text-on-surface hover:bg-surface-container-high flex items-center justify-center rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors">
                {t("hero.secondaryCta")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
