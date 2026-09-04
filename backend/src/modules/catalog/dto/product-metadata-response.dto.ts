import { ApiProperty } from "@nestjs/swagger";

export class BrandFacetItem {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "Hyundai Power" })
  public name!: string;

  @ApiProperty({ example: 42 })
  public count!: number;
}

export class CategoryFacetItem {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public id!: string;

  @ApiProperty({ example: "Máy phát điện" })
  public nameVi!: string;

  @ApiProperty({ example: "Generators", nullable: true })
  public nameEn!: string | null;

  @ApiProperty({ example: 35 })
  public count!: number;
}

export class RangeFacet {
  @ApiProperty({ example: 10 })
  public min!: number;

  @ApiProperty({ example: 2500 })
  public max!: number;
}

export class ValueCountFacetItem {
  @ApiProperty({ example: "diesel" })
  public value!: string;

  @ApiProperty({ example: 28 })
  public count!: number;
}

export class ProductMetadataResponseDto {
  @ApiProperty({ type: [BrandFacetItem] })
  public brands!: BrandFacetItem[];

  @ApiProperty({ type: [CategoryFacetItem] })
  public categories!: CategoryFacetItem[];

  @ApiProperty({ type: RangeFacet })
  public powerRange!: RangeFacet;

  @ApiProperty({ type: RangeFacet })
  public priceRange!: RangeFacet;

  @ApiProperty({ type: [ValueCountFacetItem] })
  public fuelTypes!: ValueCountFacetItem[];

  @ApiProperty({ type: [ValueCountFacetItem] })
  public phases!: ValueCountFacetItem[];

  @ApiProperty({ type: [ValueCountFacetItem] })
  public canopyTypes!: ValueCountFacetItem[];
}
