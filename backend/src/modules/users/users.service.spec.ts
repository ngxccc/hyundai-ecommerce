import { beforeEach, describe, expect, test } from "bun:test";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
import { UsersService } from "./users.service";
import type { DrizzleDB } from "@/database/database.module";
import { createMockDb, createMockI18nService } from "../../../test/mocks";

describe("UsersService", () => {
  let service: UsersService;
  const mockDb = createMockDb();
  const mockI18nService = createMockI18nService();

  beforeEach(() => {
    mockDb.clearAll();
    mockI18nService.clearAll();
    service = new UsersService(
      mockDb as unknown as DrizzleDB,
      mockI18nService as unknown as I18nService,
    );
  });

  describe("getProfile()", () => {
    describe("when user is an active retail customer", () => {
      test("should return customer profile without dealer company context", async () => {
        const mockUser = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
          email: "customer@example.com",
          fullName: "Lê Minh Tâm",
          phoneNumber: "0909123456",
          avatarUrl: null,
          role: "SALES" as const,
          status: "ACTIVE" as const,
          emailVerified: true,
          companyName: null,
          taxId: null,
          businessType: null,
          province: "Đà Nẵng",
          creditLimit: "0.00",
          currentDebt: "0.00",
          parentId: null,
          dealerTierId: null,
        };

        mockDb.setSelectResult([mockUser]);

        const result = await service.getProfile(mockUser.id);

        expect(result).toEqual({
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phoneNumber: mockUser.phoneNumber,
          avatarUrl: null,
          role: "SALES",
          status: "ACTIVE",
          isVerified: true,
          dealerCompany: null,
        });
      });
    });

    describe("when user is a B2B dealer approver with tier and credit limit", () => {
      test("should return comprehensive dealer company context and available credit calculation", async () => {
        const mockDealer = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
          email: "dealer@nhatnangpartner.vn",
          fullName: "Nguyễn Văn Hùng",
          phoneNumber: "0912345678",
          avatarUrl: "https://cloudinary.com/avatar.jpg",
          role: "SALES" as const,
          status: "ACTIVE" as const,
          emailVerified: true,
          companyName: "Công ty Cổ phần Cơ điện Miền Nam",
          taxId: "0314567890",
          businessType: "DEALER" as const,
          province: "Thành phố Hồ Chí Minh",
          creditLimit: "500000000.00",
          currentDebt: "50000000.00",
          parentId: null,
          dealerTierId: "019fa8bc-8f4d-7000-b366-e691f45cfb99",
        };

        const mockTier = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb99",
          nameVi: "Đại lý Vàng",
          nameEn: "Gold Dealer",
          discountPercentage: "15.00",
        };

        // First select is users, second select is dealerTiers
        mockDb.setSelectResultsQueue([[mockDealer], [mockTier]]);

        const result = await service.getProfile(mockDealer.id);

        expect(result.role).toBe("SALES");
        expect(result.status).toBe("ACTIVE");
        expect(result.dealerCompany).toBeDefined();
        expect(result.dealerCompany?.companyName).toBe(
          "Công ty Cổ phần Cơ điện Miền Nam",
        );
        expect(result.dealerCompany?.creditLimit).toBe("500000000.00");
        expect(result.dealerCompany?.currentDebt).toBe("50000000.00");
        expect(result.dealerCompany?.availableCredit).toBe("450000000.00");
        expect(result.dealerCompany?.tier).toEqual({
          id: mockTier.id,
          nameVi: "Đại lý Vàng",
          nameEn: "Gold Dealer",
          discountPercentage: "15.00",
        });
      });
    });

    describe("when user is pending email verification", () => {
      test("should return isVerified = false when status is PENDING_VERIFICATION and emailVerified is false", async () => {
        const mockUser = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
          email: "unverified@example.com",
          fullName: "New User",
          phoneNumber: "0900000000",
          avatarUrl: null,
          role: "SALES" as const,
          status: "PENDING_VERIFICATION" as const,
          emailVerified: false,
          companyName: null,
          taxId: null,
          businessType: null,
          province: null,
          creditLimit: "0.00",
          currentDebt: "0.00",
          parentId: null,
          dealerTierId: null,
        };

        mockDb.setSelectResult([mockUser]);

        const result = await service.getProfile(mockUser.id);

        expect(result.isVerified).toBe(false);
        expect(result.status).toBe("PENDING_VERIFICATION");
      });
    });

    describe("when user account is suspended or inactive", () => {
      test("should throw ForbiddenException when status is SUSPENDED", () => {
        const mockUser = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb92",
          email: "suspended@example.com",
          fullName: "Suspended User",
          phoneNumber: "0900000002",
          avatarUrl: null,
          role: "SALES" as const,
          status: "SUSPENDED" as const,
          emailVerified: true,
          companyName: null,
          taxId: null,
          businessType: null,
          province: null,
          creditLimit: "0.00",
          currentDebt: "0.00",
          parentId: null,
          dealerTierId: null,
        };

        mockDb.setSelectResult([mockUser]);

        expect(service.getProfile(mockUser.id)).rejects.toThrow(
          ForbiddenException,
        );
      });

      test("should throw ForbiddenException when status is INACTIVE", () => {
        const mockUser = {
          id: "019fa8bc-8f4d-7000-b366-e691f45cfb93",
          email: "inactive@example.com",
          fullName: "Inactive User",
          phoneNumber: "0900000003",
          avatarUrl: null,
          role: "SALES" as const,
          status: "INACTIVE" as const,
          emailVerified: true,
          companyName: null,
          taxId: null,
          businessType: null,
          province: null,
          creditLimit: "0.00",
          currentDebt: "0.00",
          parentId: null,
          dealerTierId: null,
        };

        mockDb.setSelectResult([mockUser]);

        expect(service.getProfile(mockUser.id)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });

    describe("when user does not exist in database", () => {
      test("should throw NotFoundException", () => {
        mockDb.setSelectResult([]);

        expect(service.getProfile("non-existent-id")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
