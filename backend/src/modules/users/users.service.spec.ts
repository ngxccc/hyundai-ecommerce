import { UsersService } from "./users.service";
import type { DrizzleDB } from "@/database/database.module";
import { beforeEach, describe, expect, it } from "bun:test";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { I18nService } from "nestjs-i18n";
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

  describe("when retrieving user profile", () => {
    it("should return user profile with isVerified = true when user is active", async () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        fullName: "Nguyen Van A",
        role: "user",
        status: "active",
      };

      mockDb.setSelectResult([mockUser]);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
        isVerified: true,
        status: "active",
      });
    });

    it("should return isVerified = false when user is pending_verification", async () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        fullName: "Nguyen Van B",
        role: "user",
        status: "pending_verification",
      };

      mockDb.setSelectResult([mockUser]);

      const result = await service.getProfile(mockUser.id);

      expect(result.isVerified).toBe(false);
      expect(result.status).toBe("pending_verification");
    });

    it("should throw ForbiddenException when user status is suspended", () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        fullName: "Nguyen Van C",
        role: "user",
        status: "suspended",
      };

      mockDb.setSelectResult([mockUser]);

      expect(service.getProfile(mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ForbiddenException when user status is inactive", () => {
      const mockUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        fullName: "Nguyen Van D",
        role: "user",
        status: "inactive",
      };

      mockDb.setSelectResult([mockUser]);

      expect(service.getProfile(mockUser.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw NotFoundException when user does not exist", () => {
      mockDb.setSelectResult([]);

      expect(service.getProfile("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
