import { beforeEach, describe, expect, test, mock } from "bun:test";
import { UsersController } from "./users.controller";
import type { UsersService } from "./users.service";
import type { UserResponseDto } from "./dto/user-response.dto";

describe("UsersController", () => {
  let controller: UsersController;

  const mockUsersService = {
    getProfile: mock((userId: string) =>
      Promise.resolve({
        id: userId,
        email: "user@example.com",
        fullName: "Nguyễn Văn A",
        phoneNumber: "0909123456",
        avatarUrl: null,
        role: "SALES",
        status: "ACTIVE",
        isVerified: true,
        dealerCompany: null,
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

  describe("GET /api/v1/users/me", () => {
    describe("when authenticated user requests own profile", () => {
      test("should return apiSuccess wrapped user profile", async () => {
        const userId = "123e4567-e89b-12d3-a456-426614174000";
        const result = await controller.getMe(userId);

        expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
        expect(result).toEqual({
          success: true,
          data: {
            id: userId,
            email: "user@example.com",
            fullName: "Nguyễn Văn A",
            phoneNumber: "0909123456",
            avatarUrl: null,
            role: "SALES",
            status: "ACTIVE",
            isVerified: true,
            dealerCompany: null,
          },
        });
      });
    });
  });
});
