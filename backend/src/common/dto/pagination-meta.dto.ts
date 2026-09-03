import { ApiProperty } from "@nestjs/swagger";

/**
 * Standard pagination metadata DTO at the root envelope level.
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: "Current page index (1-based)",
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: "Number of records per page",
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: "Total number of matching records",
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: "Total number of calculated pages",
    example: 5,
  })
  totalPages!: number;
}
