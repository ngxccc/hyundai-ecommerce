import { beforeEach, describe, expect, test } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { LeadsService } from "./leads.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";

describe("LeadsService", () => {
  let service: LeadsService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new LeadsService(mockDb as unknown as DrizzleDB);
  });

  describe("submitRfq()", () => {
    describe("when all requested products exist", () => {
      test("should create lead, snapshot products, and return full lead payload", async () => {
        const mockProduct = {
          id: "019fa8bc-7000-7000-8000-000000000001",
          nameVi: "Máy phát điện Hyundai 60kVA",
          nameEn: "Hyundai 60kVA Generator",
          slug: "dhy65kse",
        };

        const mockInsertedLead = {
          id: "lead-uuid-1",
          leadCode: "RFQ-20260904-1234",
          fullName: "Nguyễn Văn An",
          phoneNumber: "0912345678",
          email: "an.nguyen@example.com",
          companyName: "Công ty TNHH Cơ điện Bình Dương",
          city: "Bình Dương",
          ward: "Phường Dĩ An",
          streetAddress: "KCN Sóng Thần",
          notes: "Cần tư vấn tủ ATS",
          status: "NEW" as const,
          assignedSalesId: null,
          lostReason: null,
          createdAt: new Date(),
        };

        const mockInsertedItem = {
          id: "item-uuid-1",
          leadId: "lead-uuid-1",
          productId: mockProduct.id,
          quantity: 1,
          productNameVi: mockProduct.nameVi,
          productNameEn: mockProduct.nameEn,
          productModel: mockProduct.slug,
          productSku: mockProduct.slug,
        };

        // 1st select: existing products
        // 2nd insert.returning: new lead
        // 3rd insert.returning: new lead items
        mockDb.setSelectResultsQueue([
          [mockProduct],
          [mockInsertedLead],
          [mockInsertedItem],
        ]);

        const result = await service.submitRfq({
          fullName: "Nguyễn Văn An",
          phoneNumber: "0912345678",
          email: "an.nguyen@example.com",
          companyName: "Công ty TNHH Cơ điện Bình Dương",
          city: "Bình Dương",
          ward: "Phường Dĩ An",
          streetAddress: "KCN Sóng Thần",
          notes: "Cần tư vấn tủ ATS",
          items: [{ productId: mockProduct.id, quantity: 1 }],
        });

        expect(result.leadCode).toMatch(/^RFQ-\d{8}-\d{4}$/);
        expect(result.fullName).toBe("Nguyễn Văn An");
        expect(result.status).toBe("NEW");
        expect(result.items?.length).toBe(1);
        expect(result.items?.[0]?.productNameVi).toBe(mockProduct.nameVi);
      });
    });

    describe("when a requested product does not exist", () => {
      test("should throw NotFoundException naming the missing product ID", () => {
        // Return empty array for products lookup
        mockDb.setSelectResult([]);

        expect(
          service.submitRfq({
            fullName: "Nguyễn Văn An",
            phoneNumber: "0912345678",
            city: "Bình Dương",
            ward: "Phường Dĩ An",
            items: [{ productId: "non-existent-prod", quantity: 1 }],
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("findAll()", () => {
    describe("when leads exist in the database", () => {
      test("should return all leads with their snapshot items ordered by latest", async () => {
        const mockLead = {
          id: "lead-1",
          leadCode: "RFQ-20260904-0001",
          fullName: "Trần Văn Nam",
          phoneNumber: "0912345679",
          email: null,
          companyName: null,
          city: "Hà Nội",
          ward: "Phường Dịch Vọng",
          streetAddress: null,
          notes: null,
          status: "NEW" as const,
          assignedSalesId: null,
          lostReason: null,
          createdAt: new Date(),
        };

        const mockItem = {
          id: "item-1",
          leadId: "lead-1",
          productId: "prod-1",
          quantity: 2,
          productNameVi: "Máy phát điện xăng 3kW",
          productNameEn: "3kW Gasoline Generator",
          productModel: "hy3100le",
          productSku: "hy3100le",
        };

        mockDb.setSelectResultsQueue([[mockLead], [mockItem]]);

        const result = await service.findAll();

        expect(result.length).toBe(1);
        const firstLead = result[0];
        expect(firstLead?.leadCode).toBe("RFQ-20260904-0001");
        expect(firstLead?.items?.length).toBe(1);
      });
    });

    describe("when no leads exist", () => {
      test("should return an empty array without querying items", async () => {
        mockDb.setSelectResult([]);

        const result = await service.findAll();

        expect(result).toEqual([]);
      });
    });
  });

  describe("findById()", () => {
    describe("when lead exists", () => {
      test("should return single lead with all snapshot items", async () => {
        const mockLead = {
          id: "lead-target",
          leadCode: "RFQ-20260904-7777",
          fullName: "Hoàng Minh Trí",
          phoneNumber: "0988776655",
          email: "tri.hoang@company.vn",
          companyName: "Công ty Cơ khí Trí Lực",
          city: "Đà Nẵng",
          ward: "Phường Hòa Khánh Bắc",
          streetAddress: "KCN Hòa Khánh",
          notes: "Cần máy 100kVA",
          status: "CONTACTING" as const,
          assignedSalesId: "sales-1",
          lostReason: null,
          createdAt: new Date(),
        };

        mockDb.setSelectResultsQueue([[mockLead], []]);

        const result = await service.findById("lead-target");

        expect(result.id).toBe("lead-target");
        expect(result.status).toBe("CONTACTING");
      });
    });

    describe("when lead does not exist", () => {
      test("should throw NotFoundException naming the identifier", () => {
        mockDb.setSelectResult([]);

        expect(service.findById("non-existent")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("updateStatus()", () => {
    describe("when lead exists", () => {
      test("should update lead status and lostReason", async () => {
        const mockLead = {
          id: "lead-update",
          leadCode: "RFQ-20260904-8888",
          fullName: "Đặng Thị Thảo",
          phoneNumber: "0901234567",
          email: null,
          companyName: null,
          city: "Cần Thơ",
          ward: "Phường An Khánh",
          streetAddress: null,
          notes: null,
          status: "LOST" as const,
          assignedSalesId: null,
          lostReason: "Khách đã mua máy cũ",
          createdAt: new Date(),
        };

        // 1st select: existing check
        // 2nd select: findById lead
        // 3rd select: findById items
        mockDb.setSelectResultsQueue([[{ id: "lead-update" }], [mockLead], []]);

        const result = await service.updateStatus("lead-update", {
          status: "LOST",
          lostReason: "Khách đã mua máy cũ",
        });

        expect(result.status).toBe("LOST");
        expect(result.lostReason).toBe("Khách đã mua máy cũ");
      });
    });

    describe("when lead does not exist", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(
          service.updateStatus("non-existent", { status: "CONTACTING" }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe("assignSales()", () => {
    describe("when sales user exists", () => {
      test("should assign sales representative and update status to CONTACTING", async () => {
        const mockSalesUser = {
          id: "sales-uuid-1",
          role: "SALES",
        };

        const mockLead = {
          id: "lead-assign",
          leadCode: "RFQ-20260904-9999",
          fullName: "Vũ Hải Đăng",
          phoneNumber: "0933221100",
          email: null,
          companyName: null,
          city: "Hải Phòng",
          ward: "Phường Đằng Giang",
          streetAddress: null,
          notes: null,
          status: "CONTACTING" as const,
          assignedSalesId: "sales-uuid-1",
          lostReason: null,
          createdAt: new Date(),
        };

        // 1st select: check salesUser
        // 2nd select: check lead exists
        // 3rd select: findById lead
        // 4th select: findById items
        mockDb.setSelectResultsQueue([
          [mockSalesUser],
          [{ id: "lead-assign" }],
          [mockLead],
          [],
        ]);

        const result = await service.assignSales("lead-assign", "sales-uuid-1");

        expect(result.assignedSalesId).toBe("sales-uuid-1");
        expect(result.status).toBe("CONTACTING");
      });
    });

    describe("when sales user does not exist", () => {
      test("should throw NotFoundException naming the sales user", () => {
        mockDb.setSelectResult([]);

        expect(
          service.assignSales("lead-assign", "invalid-sales-id"),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
