import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zDate } from "@/common/schemas/zod-primitives";
import {
  companyAddressesSchema,
  companyBankSchema,
  companyEmailsSchema,
  companyHotlinesSchema,
  companyLinksSchema,
  companyWorkingHoursSchema,
} from "@/types/company-settings.type";

export {
  addressItemSchema,
  companyAddressesSchema,
  companyBankSchema,
  companyEmailsSchema,
  companyHotlinesSchema,
  companyLinksSchema,
  companyWorkingHoursSchema,
  hotlineChannelSchema,
} from "@/types/company-settings.type";

export const companySettingsResponseSchema = z.object({
  id: z.uuid(),
  legalNameVi: z.string(),
  legalNameEn: z.string(),
  shortName: z.string(),
  brandName: z.string(),
  brandTitle: z.string(),
  brandFullName: z.string(),
  taxId: z.string(),
  hotlines: companyHotlinesSchema,
  emails: companyEmailsSchema,
  addresses: companyAddressesSchema,
  workingHours: companyWorkingHoursSchema,
  links: companyLinksSchema,
  bank: companyBankSchema,
  updatedAt: zDate(),
});

export type CompanySettingsResponseDtoType = z.infer<
  typeof companySettingsResponseSchema
>;

export class CompanySettingsResponseDto extends createZodDto(
  companySettingsResponseSchema,
) {}
