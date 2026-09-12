import { createZodDto } from "@/common/dto";
import { z } from "zod";
import {
  zNumericString,
  zSanitizedString,
} from "@/common/schemas/zod-primitives";
import { i18nZodMsg } from "@/common/utils/i18n-message.util";
import {
  CANOPY_TYPES,
  FUEL_TYPES,
  POWER_PHASES,
} from "@/types/product-spec.type";

export const PRODUCT_SORT_OPTIONS = [
  "newest",
  "priceAsc",
  "priceDesc",
] as const;
export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number];

export const productQuerySchema = z.object({
  page: zNumericString({ min: 1 }).default(1),
  limit: zNumericString({ min: 1, max: 100 }).default(20),
  locale: z.string().min(2).max(8).optional(),
  search: zSanitizedString({ max: 255 }).nullish(),
  brandId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
  categoryId: z.uuid({ message: i18nZodMsg("validation.isUuid") }).nullish(),
  priceMin: zNumericString({ min: 0 }).nullish(),
  priceMax: zNumericString({ min: 0 }).nullish(),
  powerKvaMin: zNumericString({ min: 0 }).nullish(),
  powerKvaMax: zNumericString({ min: 0 }).nullish(),
  minPower: zNumericString({ min: 0 }).nullish(),
  maxPower: zNumericString({ min: 0 }).nullish(),
  voltage: zSanitizedString({ max: 50 }).nullish(),
  phase: z.enum(POWER_PHASES).nullish(),
  fuelType: z.enum(FUEL_TYPES).nullish(),
  canopyType: z.enum(CANOPY_TYPES).nullish(),
  engineBrand: zSanitizedString({ max: 100 }).nullish(),
  alternatorBrand: zSanitizedString({ max: 100 }).nullish(),
  status: z
    .enum(["active", "outOfStock", "all", "ACTIVE", "INACTIVE"])
    .nullish(),
  isQuoteOnly: z
    .preprocess(
      (v) =>
        v === "true" || v === true
          ? true
          : v === "false" || v === false
            ? false
            : undefined,
      z.boolean(),
    )
    .nullish(),
  sort: z.enum(PRODUCT_SORT_OPTIONS).default("newest"),
});

export type ProductQueryDtoType = z.infer<typeof productQuerySchema>;

export class ProductQueryDto extends createZodDto(productQuerySchema) {
  public static readonly zodSchema = productQuerySchema;
}
