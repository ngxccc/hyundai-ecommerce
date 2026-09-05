export const WAREHOUSE_ROUTES = {
  TAG: "warehouses",
  ROOT: "warehouses",
  BY_ID: ":id",
  STOCK: ":id/stock",
  PRODUCT_STOCK: "stock/product/:productId",
} as const;
