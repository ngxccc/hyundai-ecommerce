import { beforeEach, describe, expect, test, mock } from "bun:test";
import { OrdersController } from "./orders.controller";
import type { OrdersService } from "./orders.service";
import type {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderQueryDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from "./dto";

describe("OrdersController", () => {
  let controller: OrdersController;

  const mockOrder: OrderResponseDto = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    orderNumber: "ORD-20260904-4821",
    userId: null,
    leadId: null,
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@example.com",
    companyName: null,
    status: "PENDING",
    shippingFee: "0.00",
    shippingAddress: "Số 123 Đường Nguyễn Trãi, Quận 5",
    totalAmount: "180000000.00",
    depositAmount: "0.00",
    remainingAmount: "0.00",
    paymentMethod: "PAYOS",
    paymentStatus: "PENDING",
    approvalStatus: "APPROVED",
    approvedBy: null,
    note: "Giao giờ hành chính",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
    items: [],
    user: null,
  };

  const mockOrdersService = {
    createGuestOrder: mock((_dto: CreateGuestOrderDto) =>
      Promise.resolve(mockOrder),
    ),
    createB2bOrder: mock((_dto: CreateB2bOrderDto, _adminId: string) =>
      Promise.resolve(
        Object.assign({}, mockOrder, {
          companyName: "Công ty ABC",
          paymentMethod: "TRADE_CREDIT" as const,
        }),
      ),
    ),
    findAll: mock((_query: OrderQueryDto) =>
      Promise.resolve({
        items: [mockOrder],
        total: 1,
        page: 1,
        limit: 20,
      }),
    ),
    findById: mock((_id: string) => Promise.resolve(mockOrder)),
    updateStatus: mock(
      (
        _id: string,
        _status: string,
        _adminId?: string,
        _note?: string | null,
      ) =>
        Promise.resolve(
          Object.assign({}, mockOrder, { status: "PROCESSING" as const }),
        ),
    ),
    cancelOrder: mock((_id: string, _note?: string | null) =>
      Promise.resolve(
        Object.assign({}, mockOrder, { status: "CANCELLED" as const }),
      ),
    ),
    expirePendingOrders: mock((_windowMinutes?: number) => Promise.resolve(2)),
    clearAll() {
      this.createGuestOrder.mockClear();
      this.createB2bOrder.mockClear();
      this.findAll.mockClear();
      this.findById.mockClear();
      this.updateStatus.mockClear();
      this.cancelOrder.mockClear();
      this.expirePendingOrders.mockClear();
    },
  };

  beforeEach(() => {
    mockOrdersService.clearAll();
    controller = new OrdersController(
      mockOrdersService as unknown as OrdersService,
    );
  });

  describe("POST /orders/checkout", () => {
    describe("when guest customer places retail order", () => {
      test("should return wrapped created order", async () => {
        const dto: CreateGuestOrderDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          shippingAddress: "Số 123 Đường Nguyễn Trãi, Quận 5",
          paymentMethod: "PAYOS",
          items: [{ productId: "prod-1", quantity: 1 }],
        };

        const result = await controller.checkout(dto);

        expect(mockOrdersService.createGuestOrder).toHaveBeenCalledWith(dto);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("018f3a5e-7a2e-7b56-b74c-419b4eb14b9a");
        expect(result.data.status).toBe("PENDING");
      });
    });
  });

  describe("POST /orders/admin", () => {
    describe("when admin creates B2B corporate order", () => {
      test("should return wrapped created B2B order", async () => {
        const dto: CreateB2bOrderDto = {
          customerName: "Công ty ABC",
          customerPhone: "0911223344",
          companyName: "Công ty ABC",
          shippingAddress: "Kho Đà Nẵng",
          paymentMethod: "TRADE_CREDIT",
          shippingFee: 0,
          depositAmount: 0,
          items: [{ productId: "prod-1", quantity: 2 }],
        };

        const result = await controller.createB2bOrder(dto, "admin-1");

        expect(mockOrdersService.createB2bOrder).toHaveBeenCalledWith(
          dto,
          "admin-1",
        );
        expect(result.success).toBe(true);
        expect(result.data.paymentMethod).toBe("TRADE_CREDIT");
      });
    });
  });

  describe("GET /orders", () => {
    describe("when querying orders list", () => {
      test("should return wrapped paginated list", async () => {
        const query: OrderQueryDto = { page: 1, limit: 20 };

        const result = await controller.listOrders(query);

        expect(mockOrdersService.findAll).toHaveBeenCalledWith(query);
        expect(result.success).toBe(true);
        expect(result.data.total).toBe(1);
        expect(result.data.items.length).toBe(1);
      });
    });
  });

  describe("GET /orders/:id", () => {
    describe("when retrieving order details", () => {
      test("should return wrapped order details", async () => {
        const result = await controller.getOrderById(mockOrder.id);

        expect(mockOrdersService.findById).toHaveBeenCalledWith(mockOrder.id);
        expect(result.success).toBe(true);
        expect(result.data.id).toBe(mockOrder.id);
      });
    });
  });

  describe("PATCH /orders/:id/status", () => {
    describe("when updating order status", () => {
      test("should return wrapped updated order", async () => {
        const dto: UpdateOrderStatusDto = {
          status: "PROCESSING",
          note: "Xác nhận đóng gói",
        };

        const result = await controller.updateStatus(
          mockOrder.id,
          dto,
          "admin-1",
        );

        expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
          mockOrder.id,
          "PROCESSING",
          "admin-1",
          "Xác nhận đóng gói",
        );
        expect(result.success).toBe(true);
        expect(result.data.status).toBe("PROCESSING");
      });
    });
  });

  describe("POST /orders/:id/cancel", () => {
    describe("when cancelling an order", () => {
      test("should return wrapped cancelled order", async () => {
        const result = await controller.cancelOrder(mockOrder.id);

        expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(
          mockOrder.id,
        );
        expect(result.success).toBe(true);
        expect(result.data.status).toBe("CANCELLED");
      });
    });
  });

  describe("POST /orders/cron/expire", () => {
    describe("when triggering auto-expiration cron", () => {
      test("should return wrapped expired count", async () => {
        const result = await controller.expireOrders();

        expect(mockOrdersService.expirePendingOrders).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.expiredCount).toBe(2);
      });
    });
  });
});
