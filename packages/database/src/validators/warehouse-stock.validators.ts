import { z } from "zod";

export type TWarehouseStockValidationMessageKey =
  | "validation.invalidStock"
  | "validation.invalidMinStockWarning";

export type IWarehouseStockTranslator = (
  key: TWarehouseStockValidationMessageKey,
) => string;

export const getUpdateWarehouseStockSchema = (t: IWarehouseStockTranslator) =>
  z.object({
    warehouseId: z.uuid(),
    productId: z.uuid(),
    stock: z
      .number()
      .int()
      .min(0, { message: t("validation.invalidStock") }),
    minStockWarning: z
      .number()
      .int()
      .min(0, { message: t("validation.invalidMinStockWarning") }),
  });

export type TUpdateWarehouseStockInput = z.infer<
  ReturnType<typeof getUpdateWarehouseStockSchema>
>;
