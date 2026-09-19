import { beforeEach, describe, expect, test } from "bun:test";
import { I18nNotFoundException } from "@/common/exceptions";
import { CompanySettingsService } from "./company-settings.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb } from "../../../test/mocks";
import type { UpdateCompanySettingsDtoType } from "./dto/update-company-settings.dto";

describe("CompanySettingsService", () => {
  let service: CompanySettingsService;
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb.clearAll();
    service = new CompanySettingsService(mockDb as unknown as DrizzleDB);
  });

  describe("getSettings()", () => {
    describe("when database contains company settings record", () => {
      test("should return mapped company settings from database", async () => {
        const mockSettings = {
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
              formatted: "0901.49.7771",
              labelVi: "Dự án & Báo giá B2B",
              labelEn: "B2B Projects & Quotation",
            },
            technical: {
              raw: "0982890698",
              display: "0982 89 0698",
              formatted: "0982.89.0698",
              labelVi: "Hỗ trợ Kỹ thuật 24/7",
              labelEn: "24/7 Technical Support",
            },
          },
          emails: {
            sales: "sales@hyundainhatnang.vn",
            project: "duan@hyundainhatnang.com",
            support: "hyundaipowerproducts.vn@gmail.com",
            general: "contact@hyundainhatnang.vn",
          },
          addresses: {
            headquarters: {
              vi: "310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. Hồ Chí Minh",
              en: "310/61 Chien Luoc Street, Binh Tri Dong A Ward, Binh Tan District, HCMC, Vietnam",
            },
            warehouse: {
              vi: "Tổng kho KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương",
              en: "Song Than 2 Industrial Park Central Warehouse, Di An City, Binh Duong Province",
            },
          },
          workingHours: {
            vi: "Thứ 2 - Thứ 7: 08:00 - 17:30 (Kỹ thuật hỗ trợ 24/7)",
            en: "Mon - Sat: 08:00 - 17:30 (24/7 Technical Support)",
          },
          links: {
            website: "https://hyundainhatnang.vn",
            zalo: "https://zalo.me/0901497771",
            facebook: "https://facebook.com/hyundainhatnang",
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

        mockDb.setSelectResult([mockSettings]);

        const result = await service.getSettings();

        expect(mockDb.select).toHaveBeenCalled();
        expect(result.id).toBe(mockSettings.id);
        expect(result.legalNameVi).toBe(mockSettings.legalNameVi);
        expect(result.bank.accountNo).toBe("113002859999");
      });
    });

    describe("when database is empty", () => {
      test("should throw I18nNotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.getSettings()).rejects.toThrow(I18nNotFoundException);
      });
    });
  });

  describe("updateSettings()", () => {
    describe("when updating existing company settings", () => {
      test("should update database row and return updated settings", async () => {
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
              vi: "Địa chỉ mới, TP. Hồ Chí Minh",
              en: "New Address, HCMC",
            },
            warehouse: {
              vi: "Kho mới, Bình Dương",
              en: "New Warehouse, Binh Duong",
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
            bankName: "Vietcombank",
            branchVi: "Chi nhánh TP.HCM",
            branchEn: "HCMC Branch",
            accountNo: "9999999999",
            accountName: "CÔNG TY NHẬT NĂNG",
            bin: "vietcombank",
            qrTemplate: "compact",
          },
        };

        const existingRecord = { id: "019de1a0-0000-7000-8000-000000000099" };
        const updatedRecord = {
          ...updatePayload,
          id: existingRecord.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockDb.setSelectResultsQueue([[existingRecord], [updatedRecord]]);

        const result = await service.updateSettings(updatePayload);

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.update).toHaveBeenCalled();
        expect(result.bank.bankName).toBe("Vietcombank");
        expect(result.bank.accountNo).toBe("9999999999");
      });
    });

    describe("when company settings do not exist yet (first initialization)", () => {
      test("should insert new company settings record and return result", async () => {
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
            bankName: "Vietcombank",
            branchVi: "Chi nhánh TP.HCM",
            branchEn: "HCMC Branch",
            accountNo: "9999999999",
            accountName: "CÔNG TY NHẬT NĂNG",
            bin: "vietcombank",
            qrTemplate: "compact",
          },
        };

        const createdRecord = {
          ...updatePayload,
          id: "019de1a0-0000-7000-8000-000000000099",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // First select returns empty array (no existing record), then insert returns createdRecord
        mockDb.setSelectResultsQueue([[], [createdRecord]]);

        const result = await service.updateSettings(updatePayload);

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.insert).toHaveBeenCalled();
        expect(result.id).toBe("019de1a0-0000-7000-8000-000000000099");
        expect(result.legalNameVi).toBe(updatePayload.legalNameVi);
      });
    });
  });
});
