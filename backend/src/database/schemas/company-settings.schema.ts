import type {
  CompanyAddresses,
  CompanyBank,
  CompanyEmails,
  CompanyHotlines,
  CompanyLinks,
  CompanyWorkingHours,
} from "@/types/company-settings.type";
import { jsonb, snakeCase, varchar } from "drizzle-orm/pg-core";
import { baseEntity } from "./helpers.schema";

/**
 * Company settings singleton table storing legal identity, contact channels,
 * banking details, and office locations for dynamic system-wide configuration.
 */
export const companySettings = snakeCase.table("company_setting", {
  ...baseEntity,
  legalNameVi: varchar({ length: 255 }).notNull(),
  legalNameEn: varchar({ length: 255 }).notNull(),
  shortName: varchar({ length: 100 }).notNull(),
  brandName: varchar({ length: 100 }).notNull(),
  brandTitle: varchar({ length: 150 }).notNull(),
  brandFullName: varchar({ length: 255 }).notNull(),
  taxId: varchar({ length: 50 }).notNull(),

  hotlines: jsonb().$type<CompanyHotlines>().notNull(),
  emails: jsonb().$type<CompanyEmails>().notNull(),
  addresses: jsonb().$type<CompanyAddresses>().notNull(),
  workingHours: jsonb().$type<CompanyWorkingHours>().notNull(),
  links: jsonb().$type<CompanyLinks>().notNull(),
  bank: jsonb().$type<CompanyBank>().notNull(),
});

export type CompanySetting = typeof companySettings.$inferSelect;
export type NewCompanySetting = typeof companySettings.$inferInsert;
