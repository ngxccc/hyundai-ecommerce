import { expect, test, describe, vi, beforeEach } from "bun:test";
import {
  mockDb,
  mockFindMany,
  mockUpdate,
  mockReturning,
  mockSelectResolvedValue,
  mockSelect,
} from "../../tests/utils/db-mock";
import { DbUserService } from "./user.service";
import { type TUser } from "../../schemas";
import type { IDatabase } from "../../client";

const userService = new DbUserService(mockDb as unknown as IDatabase);

const mockUser: TUser = {
  id: "user-123",
  name: "Dealer Test",
  email: "test@test.com",
  emailVerified: true,
  image: null,
  role: "DEALER_APPROVER",
  dealerTierId: "tier-1",
  parentId: null,
  phone: "0901234567",
  companyName: "Hyundai Corp",
  taxId: null,
  businessType: "DEALER",
  province: "HCM",
  creditLimit: "0.00",
  currentDebt: "0.00",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("findByPhone() should call db query with phone", async () => {
    const mockRes = { id: "user-123" };
    mockSelectResolvedValue.mockResolvedValueOnce([mockRes]);

    const result = await userService.findByPhone("0901234567");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRes);
  });

  test("findByEmail() should call db query with email", async () => {
    const mockRes = { id: "user-123" };
    mockSelectResolvedValue.mockResolvedValueOnce([mockRes]);

    const result = await userService.findByEmail("test@test.com");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRes);
  });

  test("checkDuplicateUser() should check both", async () => {
    const mockRes = { email: "test@test.com", phone: "0901234567" };
    mockSelectResolvedValue.mockResolvedValueOnce([mockRes]);

    const result = await userService.checkDuplicateUser("test@test.com", "0901234567");

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRes);
  });

  test("update() should update and return user id", async () => {
    mockReturning.mockResolvedValueOnce([{ id: "user-123" }]);

    const result = await userService.update("user-123", {
      role: "DEALER_APPROVER",
      dealerTierId: "tier-1",
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: "user-123" });
  });

  test("list() should return list of users", async () => {
    const mockUsers = [mockUser];
    mockFindMany.mockResolvedValueOnce(mockUsers);

    const result = await userService.list({ role: "DEALER_APPROVER" });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUsers);
  });

  test("getNewUsersCount() should return correct count", async () => {
    mockSelectResolvedValue.mockResolvedValueOnce([{ count: 42 }]);

    const result = await userService.getNewUsersCount(30);

    expect(result).toBe(42);
  });
});
