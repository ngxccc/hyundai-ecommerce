import { beforeEach, describe, expect, test, mock } from "bun:test";
import { LeadsController } from "./leads.controller";
import type { LeadsService } from "./leads.service";
import type { LeadResponseDto } from "./dto/lead-response.dto";
import type { CreateLeadDto } from "./dto/create-lead.dto";

describe("LeadsController", () => {
  let controller: LeadsController;

  const mockLeadResponse: LeadResponseDto = {
    id: "lead-1",
    leadCode: "RFQ-20260904-0001",
    fullName: "Nguyễn Văn An",
    phoneNumber: "0912345678",
    email: "an.nguyen@example.com",
    companyName: "Công ty Cơ điện",
    city: "Bình Dương",
    ward: "Phường Dĩ An",
    streetAddress: "KCN Sóng Thần",
    notes: "Cần máy 60kVA",
    status: "NEW",
    assignedSalesId: null,
    lostReason: null,
    createdAt: new Date("2026-09-04T08:00:00.000Z"),
    items: [],
  };

  const mockLeadsService = {
    submitRfq: mock((_dto: CreateLeadDto) => Promise.resolve(mockLeadResponse)),
    findAll: mock(() => Promise.resolve([mockLeadResponse])),
    findById: mock((_id: string) => Promise.resolve(mockLeadResponse)),
    updateStatus: mock((_id: string, _dto: unknown) =>
      Promise.resolve(
        Object.assign({}, mockLeadResponse, {
          status: "CONTACTING" as const,
        }),
      ),
    ),
    assignSales: mock((_id: string, salesId: string) =>
      Promise.resolve(
        Object.assign({}, mockLeadResponse, {
          assignedSalesId: salesId,
          status: "CONTACTING" as const,
        }),
      ),
    ),
    clearAll() {
      this.submitRfq.mockClear();
      this.findAll.mockClear();
      this.findById.mockClear();
      this.updateStatus.mockClear();
      this.assignSales.mockClear();
    },
  };

  beforeEach(() => {
    mockLeadsService.clearAll();
    controller = new LeadsController(
      mockLeadsService as unknown as LeadsService,
    );
  });

  describe("POST /leads", () => {
    describe("when public visitor submits RFQ", () => {
      test("should return apiSuccess wrapped created lead", async () => {
        const dto: CreateLeadDto = {
          fullName: "Nguyễn Văn An",
          phoneNumber: "0912345678",
          city: "Bình Dương",
          ward: "Phường Dĩ An",
          items: [{ productId: "prod-1", quantity: 1 }],
        };

        const result = await controller.submitRfq(dto);

        expect(mockLeadsService.submitRfq).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
          success: true,
          data: mockLeadResponse,
        });
      });
    });
  });

  describe("GET /leads", () => {
    describe("when sales/admin queries all leads", () => {
      test("should return apiSuccess wrapped list of leads", async () => {
        const result = await controller.getAll();

        expect(mockLeadsService.findAll).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          data: [mockLeadResponse],
        });
      });
    });
  });

  describe("GET /leads/:id", () => {
    describe("when sales/admin queries lead by id", () => {
      test("should return apiSuccess wrapped lead details", async () => {
        const result = await controller.getById("lead-1");

        expect(mockLeadsService.findById).toHaveBeenCalledWith("lead-1");
        expect(result).toEqual({
          success: true,
          data: mockLeadResponse,
        });
      });
    });
  });

  describe("PATCH /leads/:id/status", () => {
    describe("when updating lead status", () => {
      test("should return apiSuccess wrapped updated lead", async () => {
        const result = await controller.updateStatus("lead-1", {
          status: "CONTACTING",
        });

        expect(mockLeadsService.updateStatus).toHaveBeenCalledWith("lead-1", {
          status: "CONTACTING",
        });
        expect(result.data.status).toBe("CONTACTING");
      });
    });
  });

  describe("PATCH /leads/:id/assign", () => {
    describe("when admin assigns sales representative", () => {
      test("should return apiSuccess wrapped lead with assigned sales", async () => {
        const result = await controller.assignSales("lead-1", "sales-uuid");

        expect(mockLeadsService.assignSales).toHaveBeenCalledWith(
          "lead-1",
          "sales-uuid",
        );
        expect(result.data.assignedSalesId).toBe("sales-uuid");
      });
    });
  });
});
