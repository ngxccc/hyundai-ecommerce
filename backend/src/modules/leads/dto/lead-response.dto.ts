import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import { LEAD_STATUSES } from "@/database/schemas";

export const leadItemResponseSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  quantity: z.number(),
  productNameVi: z.string(),
  productNameEn: z.string().nullable(),
  productModel: z.string().nullable(),
  productSku: z.string().nullable(),
});

export const leadResponseSchema = z.object({
  id: z.uuid(),
  leadCode: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string().nullable(),
  companyName: z.string().nullable(),
  city: z.string(),
  ward: z.string(),
  streetAddress: z.string().nullable(),
  notes: z.string().nullable(),
  status: z.enum(LEAD_STATUSES),
  assignedSalesId: z.uuid().nullable(),
  lostReason: z.string().nullable(),
  createdAt: zDate(),
  items: z.array(leadItemResponseSchema).optional(),
});

export type LeadItemResponseDtoType = z.infer<typeof leadItemResponseSchema>;
export type LeadResponseDtoType = z.infer<typeof leadResponseSchema>;

export class LeadItemResponseDto extends createZodDto(leadItemResponseSchema) {}
export class LeadResponseDto extends createZodDto(leadResponseSchema) {}
