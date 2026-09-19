import { z } from "zod";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import { zEmail, zSanitizedString } from "@/common/schemas/zod-primitives";

export const hotlineChannelSchema = z.object({
  raw: zSanitizedString({ min: 8, max: 20 }),
  display: zSanitizedString({ min: 8, max: 30 }),
  formatted: zSanitizedString({ max: 30 }).optional(),
  labelVi: zSanitizedString({ max: 100 }).optional(),
  labelEn: zSanitizedString({ max: 100 }).optional(),
});

export const companyHotlinesSchema = z.object({
  project: hotlineChannelSchema,
  technical: hotlineChannelSchema,
  general: hotlineChannelSchema.optional(),
});

export const companyEmailsSchema = z.object({
  sales: zEmail(),
  project: zEmail(),
  support: zEmail(),
  general: zEmail(),
});

export const addressItemSchema = z.object({
  vi: zSanitizedString({ min: 5, max: 255 }),
  en: zSanitizedString({ min: 5, max: 255 }),
});

export const companyAddressesSchema = z.object({
  headquarters: addressItemSchema,
  warehouse: addressItemSchema,
});

export const companyWorkingHoursSchema = z.object({
  vi: zSanitizedString({ min: 5, max: 255 }),
  en: zSanitizedString({ min: 5, max: 255 }),
});

export const companyLinksSchema = z.object({
  website: z.string(i18nZodMsg("validation.isString")).min(1, {
    message: i18nZodMsg("validation.isNotEmpty"),
  }),
  zalo: z.string(i18nZodMsg("validation.isString")).optional(),
  facebook: z.string(i18nZodMsg("validation.isString")).optional(),
});

export const companyBankSchema = z.object({
  bankName: zSanitizedString({ min: 2, max: 100 }),
  branchVi: zSanitizedString({ min: 2, max: 150 }),
  branchEn: zSanitizedString({ min: 2, max: 150 }),
  accountNo: zSanitizedString({ min: 4, max: 50 }),
  accountName: zSanitizedString({ min: 2, max: 150 }),
  bin: zSanitizedString({ min: 2, max: 50 }),
  qrTemplate: zSanitizedString({ min: 2, max: 50 }),
});

export type HotlineChannel = z.infer<typeof hotlineChannelSchema>;
export type CompanyHotlines = z.infer<typeof companyHotlinesSchema>;
export type CompanyEmails = z.infer<typeof companyEmailsSchema>;
export type AddressItem = z.infer<typeof addressItemSchema>;
export type CompanyAddresses = z.infer<typeof companyAddressesSchema>;
export type CompanyWorkingHours = z.infer<typeof companyWorkingHoursSchema>;
export type CompanyLinks = z.infer<typeof companyLinksSchema>;
export type CompanyBank = z.infer<typeof companyBankSchema>;
