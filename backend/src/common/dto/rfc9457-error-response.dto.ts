import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InvalidParamDto {
  @ApiProperty({
    description: "Invalid field name",
    example: "email",
  })
  name!: string;

  @ApiProperty({
    description: "Detailed reason for the validation error",
    example: "Invalid email address format",
  })
  reason!: string;
}

export class Rfc9457ErrorResponseDto {
  @ApiProperty({
    description: "Standard HTTP error type URI",
    example: "http://localhost:3000/errors/bad-request",
  })
  type!: string;

  @ApiProperty({
    description: "Standard HTTP error title",
    example: "Bad Request",
  })
  title!: string;

  @ApiProperty({
    description: "HTTP status code",
    example: 400,
  })
  status!: number;

  @ApiProperty({
    description: "Detailed error message",
    example: "Submitted data format is invalid",
  })
  detail!: string;

  @ApiProperty({
    description: "API request path that triggered the error",
    example: "/auth/register",
  })
  instance!: string;

  @ApiPropertyOptional({
    description: "List of invalid parameters that failed validation",
    type: [InvalidParamDto],
  })
  invalidParams?: InvalidParamDto[];

  @ApiProperty({
    description: "Timestamp when error occurred in ISO 8601 format",
    example: "2026-07-25T02:45:00.000Z",
  })
  timestamp!: string;
}
