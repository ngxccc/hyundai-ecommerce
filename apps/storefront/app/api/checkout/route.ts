import { HTTP_STATUS, FINANCIAL_CONSTANTS } from "@nhatnang/shared/constants";
import { checkRateLimitWithQueue } from "@nhatnang/shared";
import { calculateCheckoutTotals } from "@nhatnang/shared/lib/utils";
import { auth } from "@nhatnang/database/auth";
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
} from "@nhatnang/shared/lib/payos";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type {
  CreateOrderDTO,
  CheckoutRequestBody,
} from "@nhatnang/database/dtos";

export async function POST(request: Request) {
  try {
    // 0. Rate limiting check (e.g. max 5 checkout requests per 60 seconds per IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rateLimitResult = await checkRateLimitWithQueue(
      `ratelimit:checkout:${ip}`,
      5,
      "60 s",
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "errors.rateLimitExceeded" },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS },
      );
    }
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "errors.unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const {
      shippingAddress,
      paymentMethod,
      paymentOption,
      shippingFee = 0,
    } = body;

    if (!shippingAddress || !paymentMethod || !paymentOption) {
      return NextResponse.json(
        { success: false, error: "errors.missingRequiredFields" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    if (
      paymentMethod !== "PAYOS" &&
      paymentMethod !== "CASH" &&
      paymentMethod !== "TRADE_CREDIT"
    ) {
      return NextResponse.json(
        { success: false, error: "errors.invalidPaymentMethod" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    if (paymentOption !== "DEPOSIT" && paymentOption !== "FULL") {
      return NextResponse.json(
        { success: false, error: "errors.invalidPaymentOption" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // 1. Fetch user cart and calculate server-side subtotal
    const cart = await cartService.getOrCreateCart(session.user.id);
    const cartItems = await cartService.getCartItems(cart.id);

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "errors.cartEmpty" },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.product) {
        return NextResponse.json(
          { success: false, error: "errors.invalidProductInCart" },
          { status: HTTP_STATUS.BAD_REQUEST },
        );
      }
      subtotal += Number(item.product.price) * item.quantity;
    }

    const { totalAmount, depositAmount } = calculateCheckoutTotals(
      subtotal,
      FINANCIAL_CONSTANTS.VAT_RATE,
      FINANCIAL_CONSTANTS.DEPOSIT_RATE,
    );
    const paymentAmount =
      paymentOption === "DEPOSIT" ? depositAmount : totalAmount;

    // 3. Handle PayOS payment link creation BEFORE saving order to DB
    let checkoutUrl = "";
    let orderCode = 0;

    if (paymentMethod === "PAYOS") {
      orderCode = generatePayOSOrderCode();
      checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/mock-payment?orderCode=${orderCode}`;

      if (
        env.PAYOS_CLIENT_ID !== "mock_client_id" &&
        env.PAYOS_API_KEY !== "mock_api_key" &&
        !env.PAYOS_CLIENT_ID.startsWith("mock")
      ) {
        try {
          const result = await createPayOSPaymentLink({
            orderCode,
            amount: Math.round(paymentAmount),
            description: `Thanh toan GD ${orderCode}`.slice(0, 25),
            cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            returnUrl: `${env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          });

          if (result?.code === PAYOS_SUCCESS_CODE && result.data?.checkoutUrl) {
            checkoutUrl = result.data.checkoutUrl;
          } else {
            console.error("PayOS API error:", result);
            return NextResponse.json(
              { success: false, error: "errors.payosLinkCreationFailed" },
              { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
            );
          }
        } catch (error) {
          console.error("Failed to connect to PayOS:", error);
          return NextResponse.json(
            { success: false, error: "errors.paymentGatewayConnectionFailed" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
          );
        }
      }
    }

    // 4. Create order in DB and clear cart (atomic transaction)
    const orderData: CreateOrderDTO = {
      userId: session.user.id,
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

    let order;
    if (paymentMethod === "TRADE_CREDIT") {
      try {
        order = await orderService.checkoutWithTradeCredit(
          session.user.id,
          orderData,
          finalItems,
          cart.id,
        );
        checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`;
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "errors.lockAcquisitionFailed") {
            return NextResponse.json(
              { success: false, error: "errors.lockAcquisitionFailed" },
              { status: HTTP_STATUS.TOO_MANY_REQUESTS },
            );
          }
          if (err.message === "errors.insufficientCreditLimit") {
            return NextResponse.json(
              { success: false, error: "errors.insufficientCreditLimit" },
              { status: HTTP_STATUS.BAD_REQUEST },
            );
          }
        }
        throw err;
      }
    } else {
      order = await orderService.createOrderWithItems(
        orderData,
        finalItems,
        cart.id,
      );

      if (paymentMethod === "PAYOS") {
        await paymentService.createPayment({
          orderId: order.id,
          amount: String(totalAmount),
          method: "PAYOS",
          status: "PENDING",
        });

        // Per spec Case 1/2: create pending tx anchor for webhook (orderCode)
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
      } else {
        // CASH: payment record represents the full obligation (100% of totalAmount).
        // transactionId is left null here — it will be populated later by
        // /api/payments/generate-deposit-link when the user opts to pay the
        // 20% deposit online via PayOS instead of at the office.
        await paymentService.createPayment({
          orderId: order.id,
          amount: String(totalAmount),
          method: "CASH",
          status: "PENDING",
        });
        checkoutUrl = `${env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          checkoutUrl,
        },
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "errors.internalServerError" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
