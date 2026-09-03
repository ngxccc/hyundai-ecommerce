import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaDto } from "./movie-response.dto";

export class CinemaResponseDto {
  @ApiProperty({
    description: "UUIDv7 identifier of the cinema venue",
    example: "019fa8bc-8f4d-7000-b366-e691f45cfc01",
  })
  id!: string;

  @ApiProperty({
    description: "Name of the cinema venue",
    example: "CGV Vincom Đồng Khởi",
  })
  name!: string;

  @ApiProperty({
    description: "City or province name",
    example: "Thành phố Hồ Chí Minh",
  })
  city!: string;

  @ApiProperty({
    description: "Ward or commune name",
    example: "Phường Bến Nghé",
  })
  ward!: string;

  @ApiProperty({
    description: "Detailed street and building address",
    example: "Tầng 5, TTTM Vincom Center, 72 Lê Thánh Tôn",
  })
  streetAddress!: string;

  @ApiProperty({
    description: "5-digit postal code",
    example: "70000",
    nullable: true,
  })
  postalCode!: string | null;

  @ApiProperty({
    description: "GPS Latitude",
    example: "10.77810000",
    nullable: true,
  })
  latitude!: string | null;

  @ApiProperty({
    description: "GPS Longitude",
    example: "106.70250000",
    nullable: true,
  })
  longitude!: string | null;

  @ApiProperty({
    description: "Total number of active screening halls",
    example: 7,
  })
  totalHalls!: number;
}

export class CinemaListResponseDto {
  @ApiProperty({ type: [CinemaResponseDto] })
  data!: CinemaResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
