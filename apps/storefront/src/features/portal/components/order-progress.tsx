import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import type { ComplexOrder } from "@nhatnang/database/services";

interface OrderProgressProps {
  status: ComplexOrder["status"];
}

const STATUS_STEPS = [
  "PENDING",
  "APPROVED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export function OrderProgress({ status }: OrderProgressProps) {
  const t = useTranslations("Orders");

  if (status === "CANCELLED" || status === "REFUNDED") {
    return null;
  }

  const currentStepIndex = (STATUS_STEPS as readonly string[]).indexOf(
    status === "CANCELLATION_REQUESTED" ? "PENDING" : status,
  );
  return (
    <Card className="rounded-xl border border-zinc-200 py-0 shadow-sm">
      <CardContent className="p-6">
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:gap-0">
          {/* Horizontal line connector for desktop */}
          <div className="absolute top-4.25 right-8 left-8 hidden h-0.5 bg-zinc-200 md:block" />
          {/* Active status progress line */}
          <div
            className="absolute top-4.25 left-8 hidden h-0.5 bg-blue-500 transition-all duration-300 md:block"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 90}%`,
            }}
          />

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isActive = idx === currentStepIndex;
            const label = (() => {
              switch (step) {
                case "PENDING":
                  return t("labels.step.PENDING");
                case "APPROVED":
                  return t("labels.step.APPROVED");
                case "PROCESSING":
                  return t("labels.step.PROCESSING");
                case "SHIPPED":
                  return t("labels.step.SHIPPED");
                case "DELIVERED":
                  return t("labels.step.DELIVERED");
                default:
                  return step;
              }
            })();

            return (
              <div
                key={step}
                className="relative z-10 flex flex-row items-center gap-4 md:flex-col md:gap-2 md:text-center"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-zinc-300 bg-white text-zinc-400"
                  } ${isActive ? "ring-4 ring-blue-100" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${isCompleted ? "text-zinc-900" : "text-zinc-400"}`}
                  >
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
