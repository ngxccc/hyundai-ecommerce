import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  const t = useTranslations("HomePage");

  return (
    <section className="bg-background relative flex min-h-[92vh] items-center overflow-hidden pt-32 pb-20">
      {/* Background Image Area */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/may-phat-dien-mitsubishi.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-xl">
          <div className="relative isolate p-0 md:p-2">
            <h1 className="font-display mb-6 text-6xl leading-[1.05] font-black tracking-tighter text-white md:text-7xl">
              {t("hero.titleLine1")} <br />
              <span className="text-primary font-light italic">
                {t("hero.titleLine2")}
              </span>
            </h1>

            <p className="mb-10 max-w-md font-sans text-lg leading-relaxed text-slate-200">
              {t("hero.description")}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="font-display hover:bg-primary/80 font-semi-bold rounded-full text-sm tracking-widest uppercase"
              >
                {t("hero.primaryCta")}
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="font-display font-semi-bold rounded-full border-white/20 px-8 text-sm tracking-widest uppercase hover:bg-white/80"
              >
                {t("hero.secondaryCta")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
