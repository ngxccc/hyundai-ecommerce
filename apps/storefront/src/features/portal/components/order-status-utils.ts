import type { ComplexOrder } from "@nhatnang/database/services";

export const ORDER_STATUS_MAP = {
  PENDING: {
    key: "status.PENDING",
    color: "bg-amber-100 text-amber-800",
  },
  PROCESSING: {
    key: "status.PROCESSING",
    color: "bg-blue-100 text-blue-800",
  },
  SHIPPED: {
    key: "status.SHIPPED",
    color: "bg-indigo-100 text-indigo-800",
  },
  DELIVERED: {
    key: "status.DELIVERED",
    color: "bg-emerald-100 text-emerald-800",
  },
  CANCELLED: {
    key: "status.CANCELLED",
    color: "bg-rose-100 text-rose-800",
  },
  REFUNDED: {
    key: "status.REFUNDED",
    color: "bg-zinc-100 text-zinc-800",
  },
  REFUND_PENDING: {
    key: "status.REFUND_PENDING",
    color: "bg-orange-100 text-orange-800",
  },
  SUSPICIOUS_PAYMENT_HOLD: {
    key: "status.SUSPICIOUS_PAYMENT_HOLD",
    color: "bg-red-100 text-red-800",
  },
  CANCELLATION_REQUESTED: {
    key: "status.CANCELLATION_REQUESTED",
    color: "bg-orange-100 text-orange-800",
  },
} as const;

export const PAYMENT_STATUS_MAP = {
  UNPAID: {
    key: "paymentStatus.UNPAID",
    color: "border-rose-200 text-rose-700 bg-rose-50/50",
  },
  DEPOSIT_PAID: {
    key: "paymentStatus.DEPOSIT_PAID",
    color: "border-blue-200 text-blue-700 bg-blue-50/50",
  },
  FULLY_PAID: {
    key: "paymentStatus.FULLY_PAID",
    color: "border-emerald-200 text-emerald-700 bg-emerald-50/50",
  },
  PENDING_VERIFICATION: {
    key: "paymentStatus.PENDING_VERIFICATION",
    color: "border-amber-200 text-amber-700 bg-amber-50/50",
  },
} as const;

// We use `any` for the translation key because next-intl's translator type is strictly
// narrowed to the keys of the local namespace where useTranslations is called.
// This prevents compiler errors at call sites due to type mismatch with generic string keys.
export function getStatusDetails(
  status: ComplexOrder["status"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string,
) {
  const detail = ORDER_STATUS_MAP[status];
  return {
    label: detail ? t(detail.key) : status,
    color: detail?.color ?? "bg-zinc-100 text-zinc-800",
  };
}

// We use `any` for the translation key because next-intl's translator type is strictly
// narrowed to the keys of the local namespace where useTranslations is called.
// This prevents compiler errors at call sites due to type mismatch with generic string keys.
export function getPaymentStatusDetails(
  status: ComplexOrder["paymentStatus"],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string,
) {
  const detail = PAYMENT_STATUS_MAP[status];
  return {
    label: detail ? t(detail.key) : status,
    color: detail?.color ?? "border-zinc-200 text-zinc-700",
  };
}
