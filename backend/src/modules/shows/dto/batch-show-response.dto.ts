import { ApiProperty } from "@nestjs/swagger";

export class BatchShowResponseDto {
  @ApiProperty({
    description: "Total number of showtimes successfully created",
    example: 12,
  })
  createdCount!: number;

  @ApiProperty({
    description: "Array of UUIDv7 identifiers for all created showtimes",
    example: [
      "019fa8bc-8f4d-7000-b366-e691f45cfb91",
      "019fa8bc-8f4d-7000-b366-e691f45cfb92",
    ],
    type: [String],
  })
  showIds!: string[];
}
