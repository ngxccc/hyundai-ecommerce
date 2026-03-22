"use client";

import { BadgeCheck, Handshake, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrustSignalsSection() {
  const t = useTranslations("HomePage");

  const signals = [
    {
      key: "warranty" as const,
      icon: BadgeCheck,
    },
    {
      key: "support" as const,
      icon: UsersRound,
    },
    {
      key: "dealer" as const,
      icon: Handshake,
    },
  ];

  return (
    <section className="border-outline-variant/10 border-t py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.key}
              className="flex flex-col items-center text-center"
            >
              <signal.icon
                className="text-primary mb-6 h-12 w-12"
                aria-hidden="true"
              />
              <h4 className="font-headline mb-3 text-xl font-bold">
                {t(`trust.${signal.key}.title`)}
              </h4>
              <p className="text-secondary text-sm">
                {t(`trust.${signal.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
