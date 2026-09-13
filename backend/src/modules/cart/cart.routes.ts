/**
 * Legacy B2C cart routes, dormant after transition to B2B RFQ model.
 */
export const CART_ROUTES = {
  TAG: "cart (deprecated)",
  ROOT: "cart",
  ITEMS: "items",
  ITEM_BY_ID: "items/:id",
  MERGE: "merge",
} as const;
