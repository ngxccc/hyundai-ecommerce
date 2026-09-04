import { ApiProperty } from "@nestjs/swagger";
import { CartItemResponseDto } from "./cart-item-response.dto";

export class CartSummaryDto {
  @ApiProperty({ example: 3, description: "Total quantity of items in cart" })
  public totalItems!: number;

  @ApiProperty({
    example: "735000000.00",
    description: "Total monetary amount of cart items",
  })
  public totalAmount!: string;
}

export class CartResponseDto {
  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb8f" })
  public id!: string;

  @ApiProperty({ example: "019fa8bc-8f4d-7000-b366-e691f45cfb90" })
  public userId!: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  public items!: CartItemResponseDto[];

  @ApiProperty({ type: () => CartSummaryDto })
  public summary!: CartSummaryDto;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public createdAt!: Date;

  @ApiProperty({ example: "2026-09-04T08:00:00.000Z" })
  public updatedAt!: Date;
}
