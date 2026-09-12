import { z } from "zod";
import { createZodDto } from "@/common/dto";

export const assignSalesSchema = z
  .object({
    salesId: z.uuid(),
  })
  .strict();

export type AssignSalesDtoType = z.infer<typeof assignSalesSchema>;

export class AssignSalesDto extends createZodDto(assignSalesSchema) {
  public static readonly zodSchema = assignSalesSchema;
}
