import { beforeEach, describe, expect, it, type Mock } from "bun:test";
import type { UserProfileDTO } from "@nhatnang/database/dtos";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import type { getTranslations } from "next-intl/server";

// Register mocks first
import "@nhatnang/shared/testing/action-mocks";
import {
  mockAuthCreateEmployee,
  mockUserListEmployees,
  mockAuthGetSession,
  mockUserCheckDuplicateUser,
} from "@nhatnang/shared/testing/action-mocks";

// Bun module mocks require dynamic imports to resolve correctly at load time
const { listEmployeesAction, createEmployeeAction } = await import("./employee.action");

describe("employeeAction", () => {
  let mockGetTranslations: Mock<typeof getTranslations>;

  beforeEach(async () => {
    const { getTranslations: nextGetTranslations } = await import("next-intl/server");
    mockGetTranslations = nextGetTranslations as Mock<typeof nextGetTranslations>;

    mockAuthGetSession.mockReset();
    mockAuthCreateEmployee.mockReset();
    mockUserListEmployees.mockReset();
    mockUserCheckDuplicateUser.mockReset();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      ((key: string) => `translated.${key}`) as any
    );
  });

  describe("listEmployeesAction", () => {
    it("returns unauthorized if user is not logged in", async () => {
      mockAuthGetSession.mockResolvedValue(null);

      const result = await listEmployeesAction();
      expect(result.success).toBe(false);
      expect(result.error).toBe("translated.unauthorized");
      expect(mockUserListEmployees).not.toHaveBeenCalled();
    });

    it("returns unauthorized if user is not DEALER_APPROVER", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_PURCHASER" },
      });

      const result = await listEmployeesAction();
      expect(result.success).toBe(false);
      expect(result.error).toBe("translated.unauthorized");
    });

    it("returns employees list successfully for DEALER_APPROVER", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });
      const mockEmployees: UserProfileDTO[] = [
        {
          id: "emp-1",
          name: "Employee 1",
          email: "emp1@test.com",
          phone: "0987654321",
          role: "DEALER_PURCHASER",
          companyName: "Company A",
          taxId: "12345678",
          businessType: "DEALER",
          province: "Hanoi",
          parentId: "user-1",
        },
      ];
      mockUserListEmployees.mockResolvedValue(mockEmployees);

      const result = await listEmployeesAction();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEmployees);
      expect(mockUserListEmployees).toHaveBeenCalledWith("user-1");
    });
  });

  describe("createEmployeeAction", () => {
    const validForm = {
      name: "New Employee",
      email: "new_emp@test.com",
      phone: "0912345678",
      password: "password123",
      confirmPassword: "password123",
    };

    it("returns unauthorized if user is not logged in", async () => {
      mockAuthGetSession.mockResolvedValue(null);

      const result = await createEmployeeAction(validForm);
      expect(result.success).toBe(false);
      expect(result.error).toBe("translated.unauthorized");
    });

    it("returns validation error when form is invalid", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });

      const result = await createEmployeeAction({
        ...validForm,
        name: "", // Invalid
      });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe("VALIDATION_ERROR");
    });

    it("returns VALIDATION_ERROR when email already exists", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });
      mockUserCheckDuplicateUser.mockResolvedValue({
        email: "new_emp@test.com",
        phone: null,
      });

      const result = await createEmployeeAction(validForm);
      expect(result.success).toBe(false);
      expect((result as any).code).toBe("VALIDATION_ERROR");
      expect((result as any).fieldErrors?.email).toContain(AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS);
    });

    it("creates employee successfully", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });
      mockUserCheckDuplicateUser.mockResolvedValue(undefined);
      mockAuthCreateEmployee.mockResolvedValue({ userId: "emp-2" });

      const result = await createEmployeeAction(validForm);
      expect(result.success).toBe(true);
      expect(mockAuthCreateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Employee",
          email: "new_emp@test.com",
        }),
        "user-1"
      );
    });
  });
});
