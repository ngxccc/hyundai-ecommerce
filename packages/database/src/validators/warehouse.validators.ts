import { z } from "zod";

export type TWarehouseValidationMessageKey =
  | "validation.nameRequired"
  | "validation.streetAddressRequired"
  | "validation.districtRequired"
  | "validation.cityRequired";

export type IWarehouseTranslator = (
  key: TWarehouseValidationMessageKey,
) => string;

export const getCreateWarehouseSchema = (t: IWarehouseTranslator) =>
  z.object({
    name: z.string().min(1, { message: t("validation.nameRequired") }),
    streetAddress: z
      .string()
      .min(1, { message: t("validation.streetAddressRequired") }),
    district: z.string().min(1, { message: t("validation.districtRequired") }),
    city: z.string().min(1, { message: t("validation.cityRequired") }),
    isActive: z.boolean().default(true),
  });

export const getUpdateWarehouseSchema = (t: IWarehouseTranslator) =>
  getCreateWarehouseSchema(t).partial().extend({
    id: z.uuid(),
  });

export type TCreateWarehouseInput = z.infer<
  ReturnType<typeof getCreateWarehouseSchema>
>;
export type TUpdateWarehouseInput = z.infer<
  ReturnType<typeof getUpdateWarehouseSchema>
>;
