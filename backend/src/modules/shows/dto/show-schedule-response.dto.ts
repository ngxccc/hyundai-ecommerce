import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object for embedded movie metadata in showtime schedules.
 */
export class ShowMovieMetadataDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the movie",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
  })
  public id!: string;

  @ApiProperty({
    description:
      "Localized title of the movie (resolved via Accept-Language or lang parameter)",
    example: "Deadpool & Wolverine",
  })
  public title!: string;

  @ApiProperty({
    description:
      "Public poster image URL of the movie (or null if unconfigured)",
    example: "https://cdn.ticketbooking.com/posters/deadpool.jpg",
    nullable: true,
  })
  public posterUrl!: string | null;

  @ApiProperty({
    description:
      "Movie running duration in minutes (used for calculating schedule endTime)",
    example: 120,
  })
  public durationMinutes!: number;

  @ApiProperty({
    description:
      "Age advisory rating code (e.g. P - General, K - Under 13 with guardian, T13, T16, T18, C - Prohibited)",
    example: "T18",
    nullable: true,
  })
  public rating!: string | null;
}

/**
 * Data Transfer Object for embedded cinema metadata in showtime schedules.
 */
export class ShowCinemaMetadataDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the cinema complex",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb70",
  })
  public id!: string;

  @ApiProperty({
    description: "Commercial display name of the cinema complex",
    example: "CGV Landmark 81",
  })
  public name!: string;

  @ApiProperty({
    description: "City or province where the cinema complex is located",
    example: "Ho Chi Minh City",
  })
  public city!: string;

  @ApiProperty({
    description: "Detailed street address location of the cinema complex",
    example: "720A Dien Bien Phu, Ward 22, Binh Thanh",
  })
  public streetAddress!: string;
}

/**
 * Data Transfer Object for embedded cinema hall metadata in showtime schedules.
 */
export class ShowHallMetadataDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the cinema hall",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb80",
  })
  public id!: string;

  @ApiProperty({
    description: "Display name and format of the cinema hall",
    example: "Hall 01 (IMAX Laser)",
  })
  public name!: string;
}

/**
 * Data Transfer Object for a single showtime schedule entry with embedded relations.
 */
export class ShowScheduleItemDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the scheduled showtime slot",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb91",
  })
  public id!: string;

  @ApiProperty({
    description: "ISO 8601 start timestamp in UTC",
    example: "2026-09-02T03:00:00.000Z",
  })
  public startTime!: string;

  @ApiProperty({
    description:
      "ISO 8601 end timestamp in UTC (computed automatically via startTime + movie.durationMinutes)",
    example: "2026-09-02T05:00:00.000Z",
  })
  public endTime!: string;

  @ApiProperty({
    description: "Base ticket price for standard seats in VND",
    example: 100000,
  })
  public basePrice!: number;

  @ApiProperty({
    description:
      "Real-time non-locking count of available physical seats for purchase (accounting for active and expired locks)",
    example: 95,
  })
  public availableSeats!: number;

  @ApiProperty({
    description:
      "Total physical seats pre-allocated for this cinema hall and showtime",
    example: 100,
  })
  public totalSeats!: number;

  @ApiProperty({
    type: () => ShowMovieMetadataDto,
    description: "Embedded movie metadata with localized title and duration",
  })
  public movie!: ShowMovieMetadataDto;

  @ApiProperty({
    type: () => ShowCinemaMetadataDto,
    description: "Embedded cinema location metadata (city, street address)",
  })
  public cinema!: ShowCinemaMetadataDto;

  @ApiProperty({
    type: () => ShowHallMetadataDto,
    description: "Embedded cinema hall metadata (name, format)",
  })
  public hall!: ShowHallMetadataDto;
}
