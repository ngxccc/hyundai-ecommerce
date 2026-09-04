import { beforeEach, describe, expect, test } from "bun:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { OrdersService } from "./orders.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb, createMockI18nService } from "../../../test/mocks";
import type {
  CreateB2bOrderDto,
  CreateGuestOrderDto,
  OrderQueryDto,
} from "./dto";

describe("OrdersService", () => {
  let service: OrdersService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  const mockProduct = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9c",
    nameVi: "Máy phát điện Hyundai 50kVA",
    nameEn: "Hyundai 50kVA Generator",
    slug: "may-phat-dien-hyundai-50kva",
    price: "180000000.00",
    totalStockCache: 10,
    images: [],
  };

  const mockOrderRecord = {
    id: "018f3a5e-7a2e-7b56-b74c-419b4eb14b9a",
    orderNumber: "ORD-20260904-4821",
    userId: null,
    leadId: null,
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@example.com",
    companyName: null,
    status: "PENDING" as const,
    shippingFee: "0.00",
    shippingAddress: "Số 123 Đường Nguyễn Trãi, Quận 5",
    totalAmount: "180000000.00",
    depositAmount: "0.00",
    remainingAmount: "0.00",
    paymentMethod: "PAYOS" as const,
    paymentStatus: "PENDING" as const,
    approvalStatus: "APPROVED" as const,
    approvedBy: null,
    note: "Giao giờ hành chính",
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    updatedAt: new Date("2026-09-04T08:00:00.000Z"),
  };

  const mockOrderItemRecord = {
    item: {
      id: "item-1",
      orderId: mockOrderRecord.id,
      productId: mockProduct.id,
      productName: mockProduct.nameVi,
      productSku: mockProduct.slug,
      quantity: 1,
      unitPrice: mockProduct.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    product: mockProduct,
  };

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new OrdersService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("createGuestOrder()", () => {
    describe("when guest customer places valid retail order", () => {
      test("should deduct stock atomically and return created order", async () => {
        const dto: CreateGuestOrderDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          customerEmail: "nguyenvana@example.com",
          shippingAddress: "Số 123 Đường Nguyễn Trãi, Quận 5",
          paymentMethod: "PAYOS",
          items: [{ productId: mockProduct.id, quantity: 1 }],
        };

        mockDb.setSelectResultsQueue([
          [mockProduct], // select product
          [{ warehouseId: "wh-1", stock: 5 }], // select warehouse stock
          [mockOrderRecord], // insert order returning
          [mockOrderRecord], // findById order
          [mockOrderItemRecord], // findById items
        ]);

        const result = await service.createGuestOrder(dto);

        expect(result.id).toBe(mockOrderRecord.id);
        expect(result.status).toBe("PENDING");
        expect(result.totalAmount).toBe("180000000.00");
      });
    });

    describe("when requested product is not found", () => {
      test("should throw NotFoundException", () => {
        const dto: CreateGuestOrderDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          shippingAddress: "Địa chỉ",
          paymentMethod: "PAYOS",
          items: [{ productId: "non-existent-prod", quantity: 1 }],
        };

        mockDb.setSelectResult([]);

        expect(service.createGuestOrder(dto)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("when requested quantity exceeds available stock", () => {
      test("should throw BadRequestException", () => {
        const dto: CreateGuestOrderDto = {
          customerName: "Nguyễn Văn A",
          customerPhone: "0901234567",
          shippingAddress: "Địa chỉ",
          paymentMethod: "PAYOS",
          items: [{ productId: mockProduct.id, quantity: 15 }], // only 10 in stock
        };

        mockDb.setSelectResult([mockProduct]);

        expect(service.createGuestOrder(dto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe("createB2bOrder()", () => {
    describe("when admin creates B2B corporate order", () => {
      test("should create order with custom pricing and deposit", async () => {
        const dto: CreateB2bOrderDto = {
          customerName: "Công ty Năng Lượng",
          customerPhone: "0911223344",
          companyName: "Công ty CP ABC",
          shippingAddress: "Kho Đà Nẵng",
          paymentMethod: "TRADE_CREDIT",
          shippingFee: 500000,
          depositAmount: 50000000,
          items: [
            {
              productId: mockProduct.id,
              quantity: 2,
              unitPrice: 175000000, // custom price
            },
          ],
        };

        const b2bOrderRecord = {
          ...mockOrderRecord,
          companyName: "Công ty CP ABC",
          totalAmount: "350500000.00",
          shippingFee: "500000.00",
          depositAmount: "50000000.00",
          remainingAmount: "300500000.00",
          paymentMethod: "TRADE_CREDIT" as const,
        };

        mockDb.setSelectResultsQueue([
          [mockProduct], // select product
          [{ warehouseId: "wh-1", stock: 10 }], // select warehouse stock
          [b2bOrderRecord], // insert order returning
          [b2bOrderRecord], // findById order
          [mockOrderItemRecord], // findById items
        ]);

        const result = await service.createB2bOrder(dto, "admin-1");

        expect(result.id).toBe(b2bOrderRecord.id);
        expect(result.paymentMethod).toBe("TRADE_CREDIT");
        expect(result.totalAmount).toBe("350500000.00");
      });
    });
  });

  describe("findById()", () => {
    describe("when order exists", () => {
      test("should return order with items and product details", async () => {
        mockDb.setSelectResultsQueue([
          [mockOrderRecord],
          [mockOrderItemRecord],
        ]);

        const result = await service.findById(mockOrderRecord.id);

        expect(result.id).toBe(mockOrderRecord.id);
        expect(result.items.length).toBe(1);
        expect(result.items[0]?.productName).toBe(mockProduct.nameVi);
      });
    });

    describe("when order does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent-order")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("findAll()", () => {
    describe("when querying order list", () => {
      test("should return paginated orders with total count", async () => {
        const query: OrderQueryDto = { page: 1, limit: 20 };

        mockDb.setSelectResultsQueue([
          [{ count: 1 }],
          [mockOrderRecord],
          [mockOrderRecord], // findById
          [mockOrderItemRecord], // findById
        ]);

        const result = await service.findAll(query);

        expect(result.total).toBe(1);
        expect(result.items.length).toBe(1);
        expect(result.page).toBe(1);
      });
    });
  });

  describe("updateStatus()", () => {
    describe("when valid transition from PENDING to PROCESSING is requested", () => {
      test("should update status and record event", async () => {
        const updatedRecord = {
          ...mockOrderRecord,
          status: "PROCESSING" as const,
        };

        mockDb.setSelectResultsQueue([
          [mockOrderRecord], // findById current
          [mockOrderItemRecord], // findById current items
          [updatedRecord], // findById updated
          [mockOrderItemRecord], // findById updated items
        ]);

        const result = await service.updateStatus(
          mockOrderRecord.id,
          "PROCESSING",
          "admin-1",
        );

        expect(result.status).toBe("PROCESSING");
      });
    });

    describe("when invalid transition from PENDING to DELIVERED is requested", () => {
      test("should throw BadRequestException", () => {
        mockDb.setSelectResultsQueue([
          [mockOrderRecord], // findById
          [mockOrderItemRecord], // items
        ]);

        expect(
          service.updateStatus(mockOrderRecord.id, "DELIVERED"),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe("when transition to CANCELLED is requested", () => {
      test("should restock inventory and set status to CANCELLED", async () => {
        const cancelledRecord = {
          ...mockOrderRecord,
          status: "CANCELLED" as const,
        };

        mockDb.setSelectResultsQueue([
          [mockOrderRecord], // findById current
          [mockOrderItemRecord], // findById current items
          [{ warehouseId: "wh-1", stock: 4 }], // select warehouseStock to restock
          [cancelledRecord], // findById after update
          [mockOrderItemRecord], // items
        ]);

        const result = await service.updateStatus(
          mockOrderRecord.id,
          "CANCELLED",
        );

        expect(result.status).toBe("CANCELLED");
      });
    });
  });

  describe("cancelOrder()", () => {
    describe("when attempting to cancel an order already in SHIPPED status", () => {
      test("should throw BadRequestException", () => {
        const shippedOrder = {
          ...mockOrderRecord,
          status: "SHIPPED" as const,
        };

        mockDb.setSelectResultsQueue([
          [shippedOrder], // findById
          [mockOrderItemRecord], // items
        ]);

        expect(service.cancelOrder(shippedOrder.id)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe("expirePendingOrders()", () => {
    describe("when unpaid orders exceed 15-minute expiration threshold", () => {
      test("should cancel expired orders and restock inventory", async () => {
        mockDb.setSelectResultsQueue([
          [{ id: mockOrderRecord.id }], // select expired orders list
          [mockOrderRecord], // 1. cancelOrder -> findById
          [mockOrderItemRecord],
          [mockOrderRecord], // 2. cancelOrder -> updateStatus -> findById
          [mockOrderItemRecord],
          [{ warehouseId: "wh-1", stock: 4 }], // restock
          [{ ...mockOrderRecord, status: "CANCELLED" as const }], // findById updated
          [mockOrderItemRecord],
        ]);

        const count = await service.expirePendingOrders(15);

        expect(count).toBe(1);
      });
    });
  });
});
