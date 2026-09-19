import { z } from "zod";
import { createZodDto } from "@/common/dto";
import { zSanitizedString, zTaxId } from "@/common/schemas/zod-primitives";
import {
  companyAddressesSchema,
  companyBankSchema,
  companyEmailsSchema,
  companyHotlinesSchema,
  companyLinksSchema,
  companyWorkingHoursSchema,
} from "./company-settings-response.dto";

export const updateCompanySettingsSchema = z.object({
  legalNameVi: zSanitizedString({ min: 3, max: 255 }),
  legalNameEn: zSanitizedString({ min: 3, max: 255 }),
  shortName: zSanitizedString({ min: 2, max: 100 }),
  brandName: zSanitizedString({ min: 2, max: 100 }),
  brandTitle: zSanitizedString({ min: 2, max: 150 }),
  brandFullName: zSanitizedString({ min: 2, max: 255 }),
  taxId: zTaxId(),
  hotlines: companyHotlinesSchema,
  emails: companyEmailsSchema,
  addresses: companyAddressesSchema,
  workingHours: companyWorkingHoursSchema,
  links: companyLinksSchema,
  bank: companyBankSchema,
});

export type UpdateCompanySettingsDtoType = z.infer<
  typeof updateCompanySettingsSchema
>;

export class UpdateCompanySettingsDto extends createZodDto(
  updateCompanySettingsSchema,
) {}
