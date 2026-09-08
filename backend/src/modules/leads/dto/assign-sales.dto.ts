import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const assignSalesSchema = z
  .object({
    salesId: z.uuid(),
  })
  .strict();

export type AssignSalesDtoType = z.infer<typeof assignSalesSchema>;

export class AssignSalesDto implements AssignSalesDtoType {
  public static readonly zodSchema = assignSalesSchema;

  @ApiProperty({
    example: "019fa8bc-8f4d-7000-b366-e691f45cfb90",
    description: "UUID of the sales representative to assign",
  })
  public salesId!: string;
}
