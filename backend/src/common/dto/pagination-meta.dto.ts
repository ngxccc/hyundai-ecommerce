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

  @ApiProperty({
    description: "Indicates if there is a next page available",
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: "Indicates if there is a previous page available",
    example: false,
  })
  hasPrevPage!: boolean;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMetaDto {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
