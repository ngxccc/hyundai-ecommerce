"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import {
  type AddressDTO,
  type UserB2BProfileDTO,
} from "@nhatnang/database/dtos";
import { useCart, useCartStore } from "@/features/cart";
import { Button } from "@nhatnang/ui/components/ui/button";
import { SelectAddressModal } from "./select-address-modal";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { fetchApi } from "@/shared/lib/api-client";
import {
  calculateCheckoutTotals,
  priceFormatter,
} from "@nhatnang/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import type {
  PaymentMethod,
  PaymentTransactionType,
} from "@nhatnang/database/schemas";
import { CheckoutShippingAddress } from "./checkout-shipping-address";
import { CheckoutPaymentOption } from "./checkout-payment-option";
import { CheckoutPaymentMethod } from "./checkout-payment-method";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutSkeleton } from "./checkout-skeleton";

interface CheckoutTemplateProps {
  addresses: AddressDTO[];
  b2bProfile: UserB2BProfileDTO | null;
  vatRate: number;
  depositRate: number;
}

export interface CheckoutFormInput {
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  district: string;
  city: string;
  paymentMethod: PaymentMethod;
  paymentOption: Exclude<PaymentTransactionType, "REMAINDER">;
}

export function CheckoutTemplate({
  addresses,
  b2bProfile,
  vatRate,
  depositRate,
}: CheckoutTemplateProps) {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const te = useTranslations("errors");

  const cartItems = useCart((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const defaultAddress =
    addresses.find((addr) => addr.isDefault) ?? addresses[0];

  const form = useForm<CheckoutFormInput>({
    defaultValues: {
      receiverName: defaultAddress?.receiverName ?? "",
      phoneNumber: defaultAddress?.phoneNumber ?? "",
      streetAddress: defaultAddress?.streetAddress ?? "",
      district: defaultAddress?.district ?? "",
      city: defaultAddress?.city ?? "",
      paymentMethod: "PAYOS",
      paymentOption: "FULL",
    },
  });

  if (cartItems === undefined || cartItems.length === 0) {
    return <CheckoutSkeleton />;
  }
  // Cart calculations
  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const { subtotal, vat, totalAmount, depositAmount } = calculateCheckoutTotals(
    rawSubtotal,
    vatRate,
    depositRate,
  );

  // B2B checks
  const isB2B =
    b2bProfile !== null &&
    (b2bProfile.role === "DEALER_APPROVER" ||
      b2bProfile.role === "DEALER_PURCHASER");
  const creditLimit = b2bProfile
    ? parseFloat(b2bProfile.creditLimit ?? "0")
    : 0;
  const currentDebt = b2bProfile
    ? parseFloat(b2bProfile.currentDebt ?? "0")
    : 0;
  const availableCredit = Math.max(0, creditLimit - currentDebt);

  // Rule: Lock Trade Credit if available credit is insufficient OR if custom simulated lock is present (or outstanding debt > credit limit)
  const isCreditLocked =
    isB2B && (availableCredit < totalAmount || currentDebt > creditLimit);
  const isPurchaser = b2bProfile?.role === "DEALER_PURCHASER";

  const handleSelectAddress = (address: AddressDTO) => {
    form.setValue("receiverName", address.receiverName);
    form.setValue("phoneNumber", address.phoneNumber);
    form.setValue("streetAddress", address.streetAddress);
    form.setValue("district", address.district);
    form.setValue("city", address.city);
    toast.success(t("addressAutoFilled"));
  };

  const onSubmit = async (data: CheckoutFormInput) => {
    if (cartItems.length === 0) {
      toast.error(te("cartEmpty"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await fetchApi<{ checkoutUrl?: string; orderId?: string }>(
        "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shippingAddress: {
              receiverName: data.receiverName,
              phoneNumber: data.phoneNumber,
              streetAddress: data.streetAddress,
              district: data.district,
              city: data.city,
            },
            paymentMethod: data.paymentMethod,
            paymentOption: data.paymentOption,
          }),
        },
      );

      toast.success(t("checkoutSuccess"));
      clearCart();

      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
      } else {
        router.push(`/checkout/success?orderId=${result.orderId}`);
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during checkout.";
      form.setError("root", {
        type: "server",
        message: errorMessage,
      });
      toast.error(te("checkoutFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          {t("cartEmptyTitle")}
        </h2>
        <p className="text-zinc-500">{t("cartEmptyDesc")}</p>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/95 w-full"
        >
          <Link href="/products">{t("shopNow")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-0">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-900">
          {t("title")}
        </h1>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3"
        >
          {/* Mobile Collapsible Header */}
          <div className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <span>
                  {isMobileSummaryOpen
                    ? t("hideOrderSummary")
                    : t("showOrderSummary")}
                </span>
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    isMobileSummaryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <span className="text-base font-bold text-zinc-900">
                {priceFormatter.format(totalAmount)}
              </span>
            </div>

            {/* Collapsible Details */}
            {isMobileSummaryOpen && (
              <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
                {/* Product Items */}
                <div className="max-h-60 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="space-y-0.5">
                        <p className="line-clamp-2 font-semibold text-zinc-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {item.quantity} x{" "}
                          {priceFormatter.format(Number(item.price))}
                        </p>
                      </div>
                      <span className="font-bold text-zinc-900">
                        {priceFormatter.format(
                          Number(item.price) * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-zinc-100" />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm text-zinc-600">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span className="font-semibold text-zinc-900">
                      {priceFormatter.format(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("vat")}</span>
                    <span className="font-semibold text-zinc-900">
                      {priceFormatter.format(vat)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-2 text-base font-bold text-zinc-900">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      {priceFormatter.format(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Details (Left) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping Address */}
            <CheckoutShippingAddress
              addresses={addresses}
              onOpenAddressBook={() => setIsAddressModalOpen(true)}
              isSubmitting={isSubmitting}
            />

            {/* Payment Option Selector (Split payment) */}
            <CheckoutPaymentOption
              isSubmitting={isSubmitting}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
            />

            {/* Payment Method Selector */}
            <CheckoutPaymentMethod
              isB2B={isB2B}
              isCreditLocked={isCreditLocked}
              isPurchaser={isPurchaser}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Order Summary (Right) */}
          <div className="space-y-6">
            <CheckoutOrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              vat={vat}
              totalAmount={totalAmount}
              depositAmount={depositAmount}
              isSubmitting={isSubmitting}
              isPurchaser={isPurchaser}
            />
          </div>
        </form>

        {/* Select Address Modal */}
        <SelectAddressModal
          isOpen={isAddressModalOpen}
          onOpenChange={setIsAddressModalOpen}
          addresses={addresses}
          onSelect={handleSelectAddress}
        />
      </div>
    </FormProvider>
  );
}
