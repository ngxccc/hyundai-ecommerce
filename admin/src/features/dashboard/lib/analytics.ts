import type { AdminOrder, MonthlyRevenue } from "@/types/api";

/**
 * Extracts unique years from historical orders in descending order.
 * Ensures the active calendar year and previous year are present as baseline options.
 *
 * @param orders - Array of administrative orders with creation dates
 * @returns Sorted array of unique years in descending order
 */
export const getAvailableYears = (orders: AdminOrder[]): number[] => {
  const currentYear = new Date().getFullYear();
  const yearSet = new Set<number>();

  for (const order of orders) {
    if (order.createdAt) {
      const date = new Date(order.createdAt);
      if (!isNaN(date.getTime())) {
        yearSet.add(date.getFullYear());
      }
    }
  }

  if (yearSet.size === 0) {
    yearSet.add(currentYear);
  }

  return Array.from(yearSet).sort((a, b) => b - a);
};

/**
 * Formats a numeric or string month value into a localized label.
 *
 * @param month - Numeric month index (1-12) or pre-formatted month string
 * @param locale - Active language locale ("vi" | "en")
 * @returns Localized month label string (e.g. "T1" or "Jan")
 */
export const formatMonthLabel = (
  month: number | string,
  locale = "vi",
): string => {
  const num =
    typeof month === "number" ? month : parseInt(month.replace(/\D/g, ""), 10);
  if (isNaN(num) || num < 1 || num > 12) {
    return String(month);
  }
  if (locale === "vi") {
    return `T${String(num)}`;
  }
  const SHORT_MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return SHORT_MONTHS[num - 1] ?? `M${String(num)}`;
};

/**
 * Aggregates order totals into a 12-month time series for the specified year.
 * Returns honest zero metrics when no order data exists for a given month.
 *
 * @param orders - Array of administrative orders to aggregate
 * @param targetYear - Target calendar year (defaults to current year)
 * @returns Complete 12-month array of monthly revenue and order counts
 */
export const aggregateRevenueByMonth = (
  orders: AdminOrder[],
  targetYear: number = new Date().getFullYear(),
): MonthlyRevenue[] => {
  const months: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => ({
    year: targetYear,
    month: i + 1,
    revenue: 0,
    orders: 0,
  }));

  for (const order of orders) {
    if (!order.createdAt) continue;
    const date = new Date(order.createdAt);
    if (isNaN(date.getTime())) continue;

    if (date.getFullYear() === targetYear) {
      const monthIdx = date.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        const total =
          typeof order.totalAmount === "number"
            ? order.totalAmount
            : parseFloat(String(order.totalAmount)) || 0;

        months[monthIdx].revenue += total;
        months[monthIdx].orders += 1;
      }
    }
  }

  return months;
};

/**
 * Aggregates recent orders by day for 7d or 30d time ranges.
 * Returns an array of day data points with honest zero values for days with no activity.
 *
 * @param orders - Array of administrative orders to aggregate
 * @param daysCount - Time horizon in days (7 or 30)
 * @returns Array of daily revenue and order counts
 */
export const aggregateRevenueByDays = (
  orders: AdminOrder[],
  daysCount: 7 | 30 = 7,
): { label: string; revenue: number; orders: number }[] => {
  const today = new Date();
  const dayMap = new Map<string, { revenue: number; orders: number }>();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (key) {
      dayMap.set(key, { revenue: 0, orders: 0 });
    }
  }

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysCount);
  startDate.setHours(0, 0, 0, 0);

  for (const order of orders) {
    if (!order.createdAt) continue;
    const orderDate = new Date(order.createdAt);
    if (isNaN(orderDate.getTime())) continue;

    if (orderDate >= startDate && orderDate <= today) {
      const key = orderDate.toISOString().split("T")[0];
      if (key && dayMap.has(key)) {
        const current = dayMap.get(key)!;
        const total =
          typeof order.totalAmount === "number"
            ? order.totalAmount
            : parseFloat(String(order.totalAmount)) || 0;
        current.revenue += total;
        current.orders += 1;
      }
    }
  }

  const result: { label: string; revenue: number; orders: number }[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const displayLabel = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const stats = (key ? dayMap.get(key) : undefined) ?? {
      revenue: 0,
      orders: 0,
    };
    result.push({
      label: displayLabel,
      revenue: stats.revenue,
      orders: stats.orders,
    });
  }

  return result;
};
