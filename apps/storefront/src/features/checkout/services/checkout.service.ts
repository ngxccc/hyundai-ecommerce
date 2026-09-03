/**
 * CheckoutApplicationService — pure orchestration layer.
 * Owns all business steps from validated input to a result.
 * No HTTP primitives; the Route Handler owns only serialization.
 */
import { HTTP_STATUS, FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { calculateCheckoutTotals } from "@nhatnang/shared/lib/utils";
import {
  cartService,
  orderService,
  paymentService,
} from "@nhatnang/database/services";
import { env } from "@/env";
import {
  createPayOSPaymentLink,
  generatePayOSOrderCode,
  PAYOS_SUCCESS_CODE,
  makePayOSDescription,
} from "@nhatnang/shared/lib/payos";
import type { CreateOrderDTO } from "@nhatnang/database/schemas";
import type { CheckoutRequestInput } from "../validators/checkout.validator";

export interface CheckoutSuccess {
  ok: true;
  orderId: string;
  checkoutUrl: string;
}

export interface CheckoutFailure {
  ok: false;
  status: number;
  errorKey: string;
}

export type CheckoutResult = CheckoutSuccess | CheckoutFailure;

function fail(status: number, errorKey: string): CheckoutFailure {
  return { ok: false, status, errorKey };
}

export async function processCheckout(
  userId: string,
  input: CheckoutRequestInput,
): Promise<CheckoutResult> {
  const { shippingAddress, paymentMethod, paymentOption } = input;
  const shippingFee = 0;

  // Step 1 — fetch cart and validate items
  const cart = await cartService.getOrCreateCart(userId);
  const cartItems = await cartService.getCartItems(cart.id);

  if (cartItems.length === 0) {
    return fail(HTTP_STATUS.BAD_REQUEST, "errors.cartEmpty");
  }

  let subtotal = 0;
  for (const item of cartItems) {
    if (!item.product) {
      return fail(HTTP_STATUS.BAD_REQUEST, "errors.invalidProductInCart");
    }
    subtotal += Number(item.product.price) * item.quantity;
  }

  // Step 2 — server-side financial calculations
  const { totalAmount, depositAmount } = calculateCheckoutTotals(
    subtotal,
    FINANCIAL_CONSTANTS.VAT_RATE,
    FINANCIAL_CONSTANTS.DEPOSIT_RATE,
  );
  const paymentAmount =
    paymentOption === "DEPOSIT" ? depositAmount : totalAmount;

  // Step 3 — conditionally create PayOS link BEFORE writing to DB
  let checkoutUrl = "";
  let orderCode = 0;

  if (paymentMethod === "PAYOS") {
    orderCode = generatePayOSOrderCode();
    const isMockPayment =
      env.FORCE_MOCK_PAYMENT === "true" ||
      (env.FORCE_MOCK_PAYMENT !== "false" &&
        process.env.NODE_ENV !== "production");

    if (
      !isMockPayment &&
      env.PAYOS_CLIENT_ID !== "mock_client_id" &&
      env.PAYOS_API_KEY !== "mock_api_key" &&
      !env.PAYOS_CLIENT_ID.startsWith("mock")
    ) {
      try {
        const result = await createPayOSPaymentLink({
          orderCode,
          amount: Math.round(paymentAmount),
          description: makePayOSDescription("full", orderCode),
          cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
          returnUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        });

        if (result?.code !== PAYOS_SUCCESS_CODE) {
          console.error("PayOS API error:", result);
          return fail(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "errors.payosLinkCreationFailed",
          );
        }
      } catch (error) {
        console.error("Failed to connect to PayOS:", error);
        return fail(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "errors.paymentGatewayConnectionFailed",
        );
      }
    }
  }

  // Step 4 — write order + payment records to DB, clear cart
  const orderData: CreateOrderDTO = {
    userId,
    status: "PENDING",
    shippingFee: String(shippingFee),
    shippingAddress,
    totalAmount: String(totalAmount),
    paymentMethod,
    paymentStatus: "UNPAID",
    approvalStatus: "APPROVED",
  };

  const finalItems = cartItems.map((item) => ({
    productId: item.productId,
    productName: item.product!.nameVi,
    productSku: item.product!.slug,
    quantity: item.quantity,
    unitPrice: item.product!.price,
  }));

  let orderId: string;

  if (paymentMethod === "TRADE_CREDIT") {
    try {
      const order = await orderService.checkoutWithTradeCredit(
        userId,
        orderData,
        finalItems,
        cart.id,
      );
      orderId = order.id;
      checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "errors.lockAcquisitionFailed") {
          return fail(HTTP_STATUS.TOO_MANY_REQUESTS, err.message);
        }
        if (
          err.message === "errors.insufficientCreditLimit" ||
          err.message === "errors.cartChanged" ||
          err.message === "errors.forbidden"
        ) {
          return fail(HTTP_STATUS.BAD_REQUEST, err.message);
        }
      }
      throw err;
    }
  } else {
    try {
      const order = await orderService.createOrderWithItems(
        orderData,
        finalItems,
        cart.id,
      );
      orderId = order.id;

      if (paymentMethod === "PAYOS") {
        const isMockPayment =
          env.FORCE_MOCK_PAYMENT === "true" ||
          (env.FORCE_MOCK_PAYMENT !== "false" &&
            process.env.NODE_ENV !== "production");

        await paymentService.createPayment({
          orderId: order.id,
          amount: String(totalAmount),
          method: "PAYOS",
          status: "PENDING",
        });

        const txAmount =
          paymentOption === "DEPOSIT" ? depositAmount : totalAmount;
        const transactionType =
          paymentOption === "DEPOSIT" ? "DEPOSIT" : "FULL";

        await paymentService.createPaymentTransaction({
          orderId: order.id,
          amount: String(txAmount),
          paymentMethod: "PAYOS",
          transactionType,
          status: "PENDING",
          orderCode,
        });

        checkoutUrl = isMockPayment
          ? `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`
          : `${env.NEXT_PUBLIC_APP_URL}/checkout/pay?orderId=${order.id}`;
      } else {
        // CASH: full obligation payment record; deposit link generated later on demand
        await paymentService.createPayment({
          orderId: order.id,
          amount: String(totalAmount),
          method: "CASH",
          status: "PENDING",
        });
        checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`;
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "errors.lockAcquisitionFailed") {
          return fail(HTTP_STATUS.TOO_MANY_REQUESTS, err.message);
        }
        if (err.message === "errors.cartChanged") {
          return fail(HTTP_STATUS.BAD_REQUEST, err.message);
        }
      }
      throw err;
    }
  }

  return { ok: true, orderId, checkoutUrl };
}
