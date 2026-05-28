import type { productService } from "@nhatnang/database/services";

export type TProductGridList = NonNullable<
  Awaited<ReturnType<typeof productService.getAll>>["data"]
>;
export type TProductGridItem = TProductGridList[number];
