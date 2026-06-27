/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe, mock, beforeEach } from "bun:test";
import type { Mock } from "bun:test";
import "@nhatnang/shared/testing/action-mocks";
import type { TOrder, TShippingBid } from "@nhatnang/database/schemas";

describe("order.actions", () => {
  let selectWinningBidMock: Mock<(...args: any[]) => any>;
  let selectShippingBidAction: any;
  let addShippingBidAction: any;
  let approveDealerOrderAction: any;
  let verifyCashPaymentAction: any;
  let approveOrderCancellationAction: any;
  let orderService: any;
  let paymentService: any;
  let revalidatePath: any;

  beforeEach(async () => {
    const databaseServices = await import("@nhatnang/database/services");
    const orderActions = await import("./order.actions");
    const nextCache = await import("next/cache");
    revalidatePath = nextCache.revalidatePath;

    orderService = databaseServices.orderService;
    paymentService = databaseServices.paymentService;

    selectShippingBidAction = orderActions.selectShippingBidAction;
    addShippingBidAction = orderActions.addShippingBidAction;
    approveDealerOrderAction = orderActions.approveDealerOrderAction;
    verifyCashPaymentAction = orderActions.verifyCashPaymentAction;
    approveOrderCancellationAction = orderActions.approveOrderCancellationAction;

    // using as unknown as Mock due to vi.mock boundary override
    // eslint-disable-next-line @typescript-eslint/unbound-method
    selectWinningBidMock = orderService.selectWinningBid as unknown as Mock<
      (...args: any[]) => any
    >;
    selectWinningBidMock.mockClear();
    (revalidatePath as Mock<(...args: unknown[]) => void>).mockClear();
  });

  describe("selectShippingBidAction", () => {
    test("returns validation error when input is invalid (not uuid)", async () => {
      const result = await selectShippingBidAction("invalid-id", "invalid-id");

      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBe("validationError");
      expect(selectWinningBidMock).not.toHaveBeenCalled();
    });

    test("calls orderService.selectWinningBid and returns its result when input is valid", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const validBidId = "123e4567-e89b-12d3-a456-426614174001";

      // partial mock objects using as unknown as T for test boundary
      const mockOrder = {
        id: validOrderId,
        shippingFee: "150000",
      } as unknown as TOrder;
      const mockBid = {
        id: validBidId,
        quotedPrice: "150000",
      } as unknown as TShippingBid;

      selectWinningBidMock.mockResolvedValueOnce({
        updatedOrder: mockOrder,
        selectedBid: mockBid,
      });

      const result = await selectShippingBidAction(validOrderId, validBidId);

      expect(selectWinningBidMock).toHaveBeenCalledTimes(1);
      expect(selectWinningBidMock).toHaveBeenCalledWith(
        validOrderId,
        validBidId,
      );
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.shippingFee).toBe("150000");
        expect(result.data.selectedBid.id).toBe(validBidId);
      }
    });

    test("returns orderNotFound when service returns null", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const validBidId = "123e4567-e89b-12d3-a456-426614174001";

      selectWinningBidMock.mockResolvedValueOnce(null);

      const result = await selectShippingBidAction(validOrderId, validBidId);

      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBe("orderNotFound");
    });
  });

  describe("addShippingBidAction", () => {
    test("returns validation error when input is invalid (not uuid)", async () => {
      const result = await addShippingBidAction({
        orderId: "123e4567-e89b-12d3-a456-426614174000",
        vendorName: "",
        quotedPrice: "-100",
      });

      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBe(
        "shippingBidsVendorNameRequired",
      );
    });

    test("calls orderService.createShippingBid and returns its result when input is valid", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";

      const mockBid = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        quotedPrice: "150000",
        vendorName: "Grab",
      } as unknown as TShippingBid;

      const createShippingBidMock = mock().mockResolvedValueOnce(mockBid);
      (
        orderService as unknown as {
          createShippingBid: typeof createShippingBidMock;
        }
      ).createShippingBid = createShippingBidMock;

      const result = await addShippingBidAction({
        orderId: validOrderId,
        vendorName: "Grab",
        quotedPrice: "150000",
      });

      expect(createShippingBidMock).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.id).toBe("123e4567-e89b-12d3-a456-426614174001");
      }
    });
  });

  describe("approveDealerOrderAction", () => {
    test("calls orderService.approveDealerOrder and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as TOrder;

      const approveDealerOrderMock = mock().mockResolvedValueOnce(mockOrder);
      (
        orderService as unknown as {
          approveDealerOrder: typeof approveDealerOrderMock;
        }
      ).approveDealerOrder = approveDealerOrderMock;

      const result = await approveDealerOrderAction(validOrderId);

      expect(approveDealerOrderMock).toHaveBeenCalledTimes(1);
      expect(approveDealerOrderMock).toHaveBeenCalledWith(validOrderId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
    });
  });

  describe("verifyCashPaymentAction", () => {
    test("calls paymentService.verifyCashPayment and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as TOrder;

      const verifyCashPaymentMock = mock().mockResolvedValueOnce(mockOrder);
      (
        paymentService as unknown as {
          verifyCashPayment: typeof verifyCashPaymentMock;
        }
      ).verifyCashPayment = verifyCashPaymentMock;

      const result = await verifyCashPaymentAction(validOrderId);

      expect(verifyCashPaymentMock).toHaveBeenCalledTimes(1);
      expect(verifyCashPaymentMock).toHaveBeenCalledWith(
        validOrderId,
        "admin-1",
      );
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
    });
  });

  describe("approveOrderCancellationAction", () => {
    test("calls orderService.approveOrderCancellation and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as TOrder;

      const approveOrderCancellationMock =
        mock().mockResolvedValueOnce(mockOrder);
      (
        orderService as unknown as {
          approveOrderCancellation: typeof approveOrderCancellationMock;
        }
      ).approveOrderCancellation = approveOrderCancellationMock;

      const result = await approveOrderCancellationAction(validOrderId);

      expect(approveOrderCancellationMock).toHaveBeenCalledTimes(1);
      expect(approveOrderCancellationMock).toHaveBeenCalledWith(validOrderId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
    });
  });
});
