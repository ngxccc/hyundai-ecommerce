import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "John Doe" })
  fullName!: string;

  @ApiProperty({ example: "user" })
  role!: string;

  @ApiProperty({
    example: true,
    description:
      "True if user email is verified (status !== 'pending_verification')",
  })
  isVerified!: boolean;

  @ApiProperty({
    example: "active",
    enum: ["active", "inactive", "suspended", "pending_verification"],
  })
  status!: string;
}
