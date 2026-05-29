import { expect, test, describe, vi, beforeEach } from "bun:test";
import { mockDb, mockFindFirst } from "../tests/utils/db-mock";
import { UserService } from "./user.service";
import type { IDatabase } from "../client";

const userService = new UserService(mockDb as unknown as IDatabase);

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("findByPhone() should call db query with phone", async () => {
    const mockUser = { id: "user-123" };
     
    mockFindFirst.mockResolvedValueOnce(mockUser);

    const result = await userService.findByPhone("0901234567");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
     
    expect(result).toEqual(mockUser);
  });

  test("findByEmail() should call db query with email", async () => {
    const mockUser = { id: "user-123" };
     
    mockFindFirst.mockResolvedValueOnce(mockUser);

    const result = await userService.findByEmail("test@test.com");

     
    expect(result).toEqual(mockUser);
  });

  test("checkDuplicateUser() should check both", async () => {
    const mockUser = { email: "test@test.com", phone: "0901234567" };
     
    mockFindFirst.mockResolvedValueOnce(mockUser);

    const result = await userService.checkDuplicateUser("test@test.com", "0901234567");

     
    expect(result).toEqual(mockUser);
  });
});
