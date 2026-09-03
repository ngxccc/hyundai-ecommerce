import { UsersController } from "./users.controller";
import type { UsersService } from "./users.service";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { UserResponseDto } from "./dto/user-response.dto";

describe("UsersController", () => {
  let controller: UsersController;

  const mockUsersService = {
    getProfile: mock(() =>
      Promise.resolve({
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "user@example.com",
        fullName: "Nguyen Van A",
        role: "user",
        isVerified: true,
        status: "active",
      } as UserResponseDto),
    ),
    clearAll() {
      this.getProfile.mockClear();
    },
  };

  beforeEach(() => {
    mockUsersService.clearAll();
    controller = new UsersController(
      mockUsersService as unknown as UsersService,
    );
  });

  describe("when initializing users controller", () => {
    it("should instantiate UsersController correctly", () => {
      expect(controller).toBeDefined();
    });
  });

  describe("when retrieving current user profile with getMe", () => {
    it("should return apiSuccess wrapped user profile", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const result = await controller.getMe(userId);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: {
          id: userId,
          email: "user@example.com",
          fullName: "Nguyen Van A",
          role: "user",
          isVerified: true,
          status: "active",
        },
      });
    });
  });
});
