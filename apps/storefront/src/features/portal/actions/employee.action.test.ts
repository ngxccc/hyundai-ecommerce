import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import type { UserProfileDTO } from "@nhatnang/database/schemas";
import { AUTH_ERROR_CODES } from "@nhatnang/shared/constants";
import { authService, userService } from "@nhatnang/database/services";
import { mockAuthGetSession } from "@nhatnang/shared/testing/action-mocks";
import { listEmployeesAction, createEmployeeAction } from "./employee.action";

interface ActionFailure {
  success: false;
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

describe("employeeAction", () => {
  beforeEach(() => {
    mockAuthGetSession.mockReset();
  });

  describe("listEmployeesAction", () => {
    it("returns unauthorized if user is not logged in", async () => {
      const listEmployeesSpy = spyOn(userService, "listEmployees");
      mockAuthGetSession.mockResolvedValue(null);

      const result = await listEmployeesAction();
      expect(result.success).toBe(false);
      expect(result.error).toBe("unauthorized");
      expect(listEmployeesSpy).not.toHaveBeenCalled();
      listEmployeesSpy.mockRestore();
    });

    it("returns unauthorized if user is not DEALER_APPROVER", async () => {
      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_PURCHASER" },
      });

      const result = await listEmployeesAction();
      expect(result.success).toBe(false);
      expect(result.error).toBe("unauthorized");
    });

    it("returns employees list successfully for DEALER_APPROVER", async () => {
      const listEmployeesSpy = spyOn(userService, "listEmployees");
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
      listEmployeesSpy.mockResolvedValue(mockEmployees);

      const result = await listEmployeesAction();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEmployees);
      expect(listEmployeesSpy).toHaveBeenCalledWith("user-1");
      listEmployeesSpy.mockRestore();
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
      expect(result.error).toBe("unauthorized");
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
      expect((result as ActionFailure).code).toBe("VALIDATION_ERROR");
    });

    it("returns VALIDATION_ERROR when email already exists", async () => {
      const checkDuplicateSpy = spyOn(
        userService,
        "checkDuplicateUser",
      ).mockResolvedValue({
        email: "new_emp@test.com",
        phone: null,
      });

      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });

      const result = await createEmployeeAction(validForm);
      expect(result.success).toBe(false);
      expect((result as ActionFailure).code).toBe("VALIDATION_ERROR");
      expect((result as ActionFailure).fieldErrors?.["email"]).toContain(
        AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      );
      checkDuplicateSpy.mockRestore();
    });

    it("creates employee successfully", async () => {
      const checkDuplicateSpy = spyOn(
        userService,
        "checkDuplicateUser",
      ).mockResolvedValue(undefined);
      const createEmployeeSpy = spyOn(
        authService,
        "createEmployee",
      ).mockResolvedValue({ userId: "emp-2" });

      mockAuthGetSession.mockResolvedValue({
        user: { id: "user-1", role: "DEALER_APPROVER" },
      });

      const result = await createEmployeeAction(validForm);
      expect(result.success).toBe(true);
      expect(createEmployeeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Employee",
          email: "new_emp@test.com",
        }),
        "user-1",
      );
      checkDuplicateSpy.mockRestore();
      createEmployeeSpy.mockRestore();
    });
  });
});
