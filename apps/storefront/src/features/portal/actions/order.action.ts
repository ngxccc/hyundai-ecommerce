"use server";

import { getCachedSession } from "@/shared/lib/session";
import { orderService, userService } from "@nhatnang/database/services";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export async function cancelOrderAction(orderId: string) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  try {
    const isCustomer = session.user.role === "CUSTOMER" || session.user.role === "DEALER_APPROVER" || session.user.role === "DEALER_PURCHASER";
    const order = await orderService.getComplexOrder(
      orderId,
      isCustomer ? session.user.id : undefined,
    );
    if (!order) {
      return { success: false as const, error: t("orderNotFound") };
    }

    // Ownership check: Customer owns the order, OR Sales Rep, OR Super Admin
    const isOwner = order.userId === session.user.id;
    const isSalesRep = session.user.role === "SALES_REPRESENTATIVE";
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isSalesRep && !isSuperAdmin) {
      return { success: false as const, error: t("forbidden") };
    }

    const wasPending = order.status === "PENDING";

    const updated = await orderService.requestOrderCancellation(orderId);
    if (!updated) {
      return { success: false as const, error: t("orderNotFound") };
    }

    revalidatePath("/[locale]/portal/orders/[id]", "page");
    revalidatePath("/[locale]/portal/orders", "page");

    return {
      success: true as const,
      message: wasPending ? t("orderCancelled") : t("cancellationRequested"),
    };
  } catch (error) {
    console.error("[cancelOrderAction error]", error);
    const errorMessage = error instanceof Error ? error.message : "unknown";
    if (errorMessage.includes("cannotCancelInCurrentStatus")) {
      return { success: false as const, error: t("invalidStatusTransition") };
    }
    return { success: false as const, error: t("internalServerError") };
  }
}

export async function approveB2BOrderAction(orderId: string) {
  const [session, t] = await Promise.all([
    getCachedSession(),
    getTranslations("errors"),
  ]);

  if (!session?.user) {
    return { success: false as const, error: t("unauthorized") };
  }

  if (session.user.role !== "DEALER_APPROVER") {
    return { success: false as const, error: t("forbidden") };
  }

  try {
    const order = await orderService.getComplexOrder(orderId);
    if (!order) {
      return { success: false as const, error: t("orderNotFound") };
    }

    // Verify company association: Approver and Purchaser must belong to the same company
    const approver = await userService.getB2BProfile(session.user.id);
    if (!approver?.companyName) {
      return { success: false as const, error: t("forbidden") };
    }

    const purchaser = order.user;
    if (purchaser?.companyName !== approver.companyName) {
      return { success: false as const, error: t("forbidden") };
    }

    const updated = await orderService.approveDealerOrder(orderId);
    if (!updated) {
      return { success: false as const, error: t("orderNotFound") };
    }

    revalidatePath("/[locale]/portal/orders/[id]", "page");
    revalidatePath("/[locale]/portal/orders", "page");

    return { success: true as const };
  } catch (error) {
    console.error("[approveB2BOrderAction error]", error);
    const errorMessage = error instanceof Error ? error.message : "unknown";
    if (errorMessage.includes("lockAcquisitionFailed")) {
      return {
        success: false as const,
        error: t("lockAcquisitionFailed"),
      };
    }
    if (errorMessage.includes("insufficientCreditLimit")) {
      return {
        success: false as const,
        error: t("insufficientCreditLimit"),
      };
    }
    return { success: false as const, error: t("internalServerError") };
  }
}
