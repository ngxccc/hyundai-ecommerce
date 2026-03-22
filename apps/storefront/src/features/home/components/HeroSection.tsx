"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function HeroSection() {
  const t = useTranslations("HomePage");

  return (
    <section className="bg-surface-container-low relative flex min-h-[90vh] items-center overflow-hidden pt-32 pb-20">
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
        <div className="max-w-xl">
          <div className="bg-surface-container-high mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1">
            <span className="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
            <span className="font-display text-on-surface text-[10px] font-semibold tracking-widest uppercase">
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="font-display text-on-surface mb-6 text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl">
            {t("hero.titleLine1")} <br />
            <span className="text-primary italic">{t("hero.titleLine2")}</span>
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
            <button className="font-display text-on-surface hover:bg-surface-container-high flex items-center justify-center rounded-full px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors">
              {t("hero.secondaryCta")}
            </button>
          </div>
        </div>
        {/* Hero Image */}
        <div className="relative h-90 w-full md:-mr-[15%] md:h-130 md:w-[115%]">
          <Image
            src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=2832&auto=format&fit=crop"
            alt="Industrial power system"
            width={2832}
            height={1888}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 55vw"
            className="h-full w-full rounded-l-3xl object-cover object-center shadow-2xl"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
