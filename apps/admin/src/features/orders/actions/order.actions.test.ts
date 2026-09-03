import { expect, test, describe, beforeEach, spyOn } from "bun:test";
import { mockRevalidatePath } from "@nhatnang/shared/testing/action-mocks";
import type { Order, ShippingBid } from "@nhatnang/database/schemas";
import { orderService, paymentService } from "@nhatnang/database/services";
import type { SelectWinningBidResult } from "@nhatnang/database/services";
import {
  selectShippingBidAction,
  addShippingBidAction,
  approveDealerOrderAction,
  verifyCashPaymentAction,
  approveOrderCancellationAction,
} from "./order.actions";

describe("order.actions", () => {
  beforeEach(() => {
    mockRevalidatePath.mockClear();
  });

  describe("selectShippingBidAction", () => {
    test("returns validation error when input is invalid (not uuid)", async () => {
      const selectSpy = spyOn(orderService, "selectWinningBid");
      const result = await selectShippingBidAction("invalid-id", "invalid-id");

      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBe("validationError");
      expect(selectSpy).not.toHaveBeenCalled();
      selectSpy.mockRestore();
    });

    test("calls orderService.selectWinningBid and returns its result when input is valid", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const validBidId = "123e4567-e89b-12d3-a456-426614174001";

      const mockOrder = {
        id: validOrderId,
        shippingFee: "150000",
      } as unknown as Order;
      const mockBid = {
        id: validBidId,
        quotedPrice: "150000",
      } as unknown as ShippingBid;

      const selectSpy = spyOn(
        orderService,
        "selectWinningBid",
      ).mockResolvedValueOnce({
        updatedOrder: mockOrder,
        selectedBid: mockBid,
      });

      const result = await selectShippingBidAction(validOrderId, validBidId);

      expect(selectSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledWith(validOrderId, validBidId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.shippingFee).toBe("150000");
        expect(result.data.selectedBid.id).toBe(validBidId);
      }
      selectSpy.mockRestore();
    });

    test("returns orderNotFound when service returns null", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const validBidId = "123e4567-e89b-12d3-a456-426614174001";

      const selectSpy = spyOn(
        orderService,
        "selectWinningBid",
      ).mockResolvedValueOnce(undefined as unknown as SelectWinningBidResult);

      const result = await selectShippingBidAction(validOrderId, validBidId);

      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBe("orderNotFound");
      selectSpy.mockRestore();
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
      } as unknown as ShippingBid;

      const createSpy = spyOn(
        orderService,
        "createShippingBid",
      ).mockResolvedValueOnce(mockBid);

      const result = await addShippingBidAction({
        orderId: validOrderId,
        vendorName: "Grab",
        quotedPrice: "150000",
      });

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.id).toBe("123e4567-e89b-12d3-a456-426614174001");
      }
      createSpy.mockRestore();
    });
  });

  describe("approveDealerOrderAction", () => {
    test("calls orderService.approveDealerOrder and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as Order;

      const approveSpy = spyOn(
        orderService,
        "approveDealerOrder",
      ).mockResolvedValueOnce(mockOrder);

      const result = await approveDealerOrderAction(validOrderId);

      expect(approveSpy).toHaveBeenCalledTimes(1);
      expect(approveSpy).toHaveBeenCalledWith(validOrderId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
      approveSpy.mockRestore();
    });
  });

  describe("verifyCashPaymentAction", () => {
    test("calls paymentService.verifyCashPayment and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as Order;

      const verifySpy = spyOn(
        paymentService,
        "verifyCashPayment",
      ).mockResolvedValueOnce(mockOrder);

      const result = await verifyCashPaymentAction(validOrderId);

      expect(verifySpy).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledWith(validOrderId, "admin-1");
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
      verifySpy.mockRestore();
    });
  });

  describe("approveOrderCancellationAction", () => {
    test("calls orderService.approveOrderCancellation and returns success", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const mockOrder = { id: validOrderId } as unknown as Order;

      const cancelSpy = spyOn(
        orderService,
        "approveOrderCancellation",
      ).mockResolvedValueOnce(mockOrder);

      const result = await approveOrderCancellationAction(validOrderId);

      expect(cancelSpy).toHaveBeenCalledTimes(1);
      expect(cancelSpy).toHaveBeenCalledWith(validOrderId);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.id).toBe(validOrderId);
      }
      cancelSpy.mockRestore();
    });
  });
});
