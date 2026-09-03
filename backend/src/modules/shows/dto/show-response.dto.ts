import { ApiProperty } from "@nestjs/swagger";

export class ShowResponseDto {
  @ApiProperty({
    description: "UUIDv7 of the newly created show",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
  })
  id!: string;

  @ApiProperty({
    description: "UUIDv7 of the scheduled movie",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
  })
  movieId!: string;

  @ApiProperty({
    description: "UUIDv7 of the cinema hall",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
  })
  hallId!: string;

  @ApiProperty({
    description: "ISO 8601 start timestamp",
    example: "2026-09-01T10:00:00.000Z",
  })
  startTime!: string;

  @ApiProperty({
    description: "ISO 8601 end timestamp (automatically computed)",
    example: "2026-09-01T12:00:00.000Z",
  })
  endTime!: string;

  @ApiProperty({
    description: "Base ticket price in VND",
    example: 100000,
  })
  basePrice!: number;

  @ApiProperty({
    description: "Total number of physical seats pre-allocated as available",
    example: 100,
  })
  totalSeats!: number;
}
