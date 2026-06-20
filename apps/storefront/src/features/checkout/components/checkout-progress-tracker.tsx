import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface CheckoutProgressTrackerProps {
  isB2B?: boolean | undefined;
}

export function CheckoutProgressTracker({ isB2B = false }: CheckoutProgressTrackerProps) {
  const t = useTranslations("Checkout");

  const steps = isB2B
    ? [
        {
          title: t("step1"),
          description: t("step1Desc"),
          status: "completed",
        },
        {
          title: t("step2"),
          description: t("step2Desc"),
          status: "active",
        },
        {
          title: t("step3"),
          description: t("step3Desc"),
          status: "scheduled",
        },
        {
          title: t("step4"),
          description: t("step4Desc"),
          status: "scheduled",
        },
      ]
    : [
        {
          title: t("step1"),
          description: t("step1Desc"),
          status: "completed",
        },
        {
          title: t("step3"),
          description: t("step3Desc"),
          status: "active",
        },
        {
          title: t("step4"),
          description: t("step4Desc"),
          status: "scheduled",
        },
      ];

  return (
    <div className="space-y-6 rounded-sm border border-zinc-100 bg-zinc-50/50 p-5 md:p-6">
      <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
        {t("deliveryRoadmap")}
      </h3>
      <div className="relative space-y-8 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-zinc-200">
        {steps.map((step, idx) => {
          // eslint-disable-next-line no-useless-assignment
          let icon = null;
          let connectingLine = null;

          // Connecting line style overlay
          if (idx < steps.length - 1) {
            connectingLine = (
              <div
                className={`absolute top-5.5 left-1.75 z-10 h-[calc(100%+24px)] w-0.5 ${
                  step.status === "completed"
                    ? "bg-emerald-500"
                    : step.status === "active"
                      ? "bg-zinc-200"
                      : "bg-zinc-200"
                }`}
              />
            );
          }

          if (step.status === "completed") {
            icon = (
              <CheckCircle2 className="absolute top-0.5 left-0 z-20 h-4 w-4 rounded-full bg-white text-emerald-500" />
            );
          } else if (step.status === "active") {
            icon = (
              <div className="absolute top-0.5 left-0 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
              </div>
            );
          } else {
            icon = (
              <Circle className="absolute top-0.5 left-0 z-20 h-4 w-4 rounded-full bg-white text-zinc-300" />
            );
          }

          return (
            <div key={idx} className="relative pl-6">
              {connectingLine}
              {icon}
              <div className="space-y-1">
                <h4
                  className={`text-sm font-semibold tracking-tight ${
                    step.status === "completed"
                      ? "text-zinc-900"
                      : step.status === "active"
                        ? "text-primary"
                        : "text-zinc-400"
                  }`}
                >
                  {step.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    step.status === "completed" || step.status === "active"
                      ? "text-zinc-500"
                      : "text-zinc-400/80"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
