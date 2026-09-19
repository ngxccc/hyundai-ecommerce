import { beforeEach, describe, expect, test, mock } from "bun:test";
import { CompanySettingsController } from "./company-settings.controller";
import type { CompanySettingsService } from "./company-settings.service";
import type { CompanySettingsResponseDtoType } from "./dto/company-settings-response.dto";
import type { UpdateCompanySettingsDtoType } from "./dto/update-company-settings.dto";

describe("CompanySettingsController", () => {
  let controller: CompanySettingsController;

  const mockSettings: CompanySettingsResponseDtoType = {
    id: "019de1a0-0000-7000-8000-000000000099",
    legalNameVi: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
    legalNameEn: "NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD",
    shortName: "Hyundai Nhật Năng",
    brandName: "Hyundai",
    brandTitle: "HYUNDAI POWER PRODUCTS",
    brandFullName: "Hyundai Power Products Vietnam",
    taxId: "0316447814",
    hotlines: {
      project: {
        raw: "0901497771",
        display: "0901 49 7771",
      },
      technical: {
        raw: "0982890698",
        display: "0982 89 0698",
      },
    },
    emails: {
      sales: "sales@hyundainhatnang.vn",
      project: "duan@hyundainhatnang.com",
      support: "support@hyundainhatnang.vn",
      general: "contact@hyundainhatnang.vn",
    },
    addresses: {
      headquarters: {
        vi: "310/61 Chiến Lược, Bình Tân, TP.HCM",
        en: "310/61 Chien Luoc, Binh Tan, HCMC",
      },
      warehouse: {
        vi: "Kho Sóng Thần, Dĩ An, Bình Dương",
        en: "Song Than Warehouse, Di An, Binh Duong",
      },
    },
    workingHours: {
      vi: "08:00 - 17:30",
      en: "08:00 - 17:30",
    },
    links: {
      website: "https://hyundainhatnang.vn",
    },
    bank: {
      bankName: "VietinBank",
      branchVi: "Chi nhánh Tây Sài Gòn",
      branchEn: "Tay Sai Gon Branch",
      accountNo: "113002859999",
      accountName: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
      bin: "vietinbank",
      qrTemplate: "qr_only",
    },
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
  };

  const mockCompanySettingsService = {
    getSettings: mock(() => Promise.resolve(mockSettings)),
    updateSettings: mock((dto: UpdateCompanySettingsDtoType) =>
      Promise.resolve({
        ...mockSettings,
        ...dto,
        updatedAt: new Date("2026-03-02T00:00:00.000Z"),
      }),
    ),
    clearAll() {
      this.getSettings.mockClear();
      this.updateSettings.mockClear();
    },
  };

  beforeEach(() => {
    mockCompanySettingsService.clearAll();
    controller = new CompanySettingsController(
      mockCompanySettingsService as unknown as CompanySettingsService,
    );
  });

  describe("GET /api/v1/settings/company", () => {
    describe("when client requests company settings", () => {
      test("should return apiSuccess envelope with company settings", async () => {
        const result = await controller.getSettings();

        expect(mockCompanySettingsService.getSettings).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.data.id).toBe("019de1a0-0000-7000-8000-000000000099");
        expect(result.data.legalNameVi).toBe(
          "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
        );
        expect(result.data.bank.accountNo).toBe("113002859999");
      });
    });
  });

  describe("PUT /api/v1/settings/company", () => {
    describe("when admin submits updated company settings", () => {
      test("should invoke service updateSettings and return updated result", async () => {
        const updatePayload: UpdateCompanySettingsDtoType = {
          legalNameVi: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
          legalNameEn: "NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD",
          shortName: "Hyundai Nhật Năng",
          brandName: "Hyundai",
          brandTitle: "HYUNDAI POWER PRODUCTS",
          brandFullName: "Hyundai Power Products Vietnam",
          taxId: "0316447814",
          hotlines: {
            project: {
              raw: "0901497771",
              display: "0901 49 7771",
            },
            technical: {
              raw: "0982890698",
              display: "0982 89 0698",
            },
          },
          emails: {
            sales: "sales@hyundainhatnang.vn",
            project: "duan@hyundainhatnang.com",
            support: "support@hyundainhatnang.vn",
            general: "contact@hyundainhatnang.vn",
          },
          addresses: {
            headquarters: {
              vi: "310/61 Chiến Lược, Bình Tân, TP.HCM",
              en: "310/61 Chien Luoc, Binh Tan, HCMC",
            },
            warehouse: {
              vi: "Kho Sóng Thần, Dĩ An, Bình Dương",
              en: "Song Than Warehouse, Di An, Binh Duong",
            },
          },
          workingHours: {
            vi: "08:00 - 17:30",
            en: "08:00 - 17:30",
          },
          links: {
            website: "https://hyundainhatnang.vn",
          },
          bank: {
            bankName: "VietinBank",
            branchVi: "Chi nhánh Tây Sài Gòn",
            branchEn: "Tay Sai Gon Branch",
            accountNo: "113002859999",
            accountName: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
            bin: "vietinbank",
            qrTemplate: "qr_only",
          },
        };

        const result = await controller.updateSettings(updatePayload);

        expect(mockCompanySettingsService.updateSettings).toHaveBeenCalledWith(
          updatePayload,
        );
        expect(result.success).toBe(true);
        expect(result.data.legalNameVi).toBe(updatePayload.legalNameVi);
      });
    });
  });
});
