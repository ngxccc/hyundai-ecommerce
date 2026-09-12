import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zEmail } from "@/common/schemas/zod-primitives";
import { USER_ROLES, USER_STATUSES, BUSINESS_TYPES } from "@/database/schemas";

export const dealerTierInfoSchema = z.object({
  id: z.uuid(),
  nameVi: z.string(),
  nameEn: z.string().nullable(),
  discountPercentage: z.string(),
});

export const dealerCompanySchema = z.object({
  companyName: z.string().nullable(),
  taxId: z.string().nullable(),
  businessType: z.enum(BUSINESS_TYPES).nullable(),
  province: z.string().nullable(),
  creditLimit: z.string(),
  currentDebt: z.string(),
  availableCredit: z.string(),
  parentId: z.uuid().nullable(),
  tier: dealerTierInfoSchema.nullable(),
});

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: zEmail(),
  fullName: z.string(),
  phoneNumber: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
  isVerified: z.boolean(),
  dealerCompany: dealerCompanySchema.nullable(),
});

export type DealerTierInfoDtoType = z.infer<typeof dealerTierInfoSchema>;
export type DealerCompanyDtoType = z.infer<typeof dealerCompanySchema>;
export type UserResponseDtoType = z.infer<typeof userResponseSchema>;

export class DealerTierInfoDto extends createZodDto(dealerTierInfoSchema) {}
export class DealerCompanyDto extends createZodDto(dealerCompanySchema) {}
export class UserResponseDto extends createZodDto(userResponseSchema) {}
