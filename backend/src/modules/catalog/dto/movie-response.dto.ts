import { PaginationMetaDto } from "@/common/dto";
export { PaginationMetaDto };
import { ApiProperty } from "@nestjs/swagger";

export class MovieGenreItemDto {
  @ApiProperty({
    description: "UUIDv7 of the genre",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb01",
  })
  id!: string;

  @ApiProperty({
    description: "Localized genre name",
    example: "Action",
  })
  name!: string;
}

export class MovieResponseDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the movie",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
  })
  id!: string;

  @ApiProperty({
    description: "Localized movie title",
    example: "Deadpool & Wolverine",
  })
  title!: string;

  @ApiProperty({
    description: "Localized movie synopsis/description",
    example: "Wolverine joins Deadpool on a multiverse mission.",
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: "Duration in minutes",
    example: 128,
  })
  durationMinutes!: number;

  @ApiProperty({
    description: "Release date in YYYY-MM-DD format",
    example: "2026-07-26",
    nullable: true,
  })
  releaseDate!: string | null;

  @ApiProperty({
    description: "Age rating code",
    example: "R",
    nullable: true,
  })
  rating!: string | null;

  @ApiProperty({
    description: "Poster image URL",
    example: "https://cdn.ticketbooking.com/posters/deadpool.jpg",
    nullable: true,
  })
  posterUrl!: string | null;

  @ApiProperty({
    description: "Trailer video URL",
    example: "https://youtube.com/watch?v=deadpool",
    nullable: true,
  })
  trailerUrl!: string | null;

  @ApiProperty({
    description: "List of associated genres",
    type: [MovieGenreItemDto],
  })
  genres!: MovieGenreItemDto[];
}

export class MovieListResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  data!: MovieResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
