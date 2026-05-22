import { BadgeCheck, Handshake, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const SIGNALS = [
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

export function TrustSignalsSection() {
  const t = useTranslations("HomePage.trust");

  return (
    <section className="bg-muted/30 mt-12 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {SIGNALS.map((signal) => (
            <Card
              key={signal.key}
              className="group gap-2 border-none bg-transparent p-0 shadow-none transition-all duration-300"
            >
              <CardHeader className="flex flex-col items-center text-center">
                <div className="bg-primary/10 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <signal.icon
                    className="text-primary h-10 w-10"
                    aria-hidden="true"
                  />
                </div>

                <CardTitle className="font-display text-xl font-bold">
                  {t(`${signal.key}.title`)}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`${signal.key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
