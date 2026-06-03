import { expect, test, describe, mock, vi, beforeEach } from "bun:test";
import type { Mock } from "bun:test";
import { selectShippingBidAction, addShippingBidAction } from "./order.actions";
import { orderService } from "@nhatnang/database/services";
import { revalidatePath } from "next/cache";
import type { OrderService } from "@nhatnang/database/services";
import type { TOrder, TShippingBid } from "@nhatnang/database/schemas";

void vi.mock("next/cache", () => ({
  revalidatePath: mock(),
}));

class MockAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

void vi.mock("@/shared/lib/action-auth", () => ({
  requireAuth: mock().mockResolvedValue({}),
  AuthError: MockAuthError,
}));

void vi.mock("@nhatnang/database/services", () => ({
  orderService: {
    updateOrderStatus: mock(),
    selectWinningBid: mock(),
  },
}));

void vi.mock("next-intl/server", () => ({
  getTranslations: mock().mockResolvedValue((key: string) => key),
}));

describe("order.actions", () => {
  let selectWinningBidMock: Mock<OrderService["selectWinningBid"]>;

  beforeEach(() => {
    // using as unknown as Mock due to vi.mock boundary override
    // eslint-disable-next-line @typescript-eslint/unbound-method
    selectWinningBidMock = orderService.selectWinningBid as unknown as Mock<
      OrderService["selectWinningBid"]
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
      if (result.success) {
        expect(result.data.shippingFee).toBe("150000");
        expect(result.data.selectedBid.id).toBe(validBidId);
      }
    });

    test("returns orderNotFound when service returns null", async () => {
      const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
      const validBidId = "123e4567-e89b-12d3-a456-426614174001";

      selectWinningBidMock.mockResolvedValueOnce(
        null as unknown as { updatedOrder: TOrder; selectedBid: TShippingBid },
      );

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
        expect(result.data!.vendorName).toBe("Grab");
      }
    });
  });
});
