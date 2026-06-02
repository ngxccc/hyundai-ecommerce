export const QUOTE_CONSTANTS = {
  DEFAULT_SHIPPING_ADDRESS: "Chưa cập nhật / To be updated",
  SYSTEM_MESSAGE_APPROVED_PREFIX: "[SYSTEM] Báo giá đã được phê duyệt và chuyển đổi thành Đơn hàng #",
} as const;

export type TQuoteConstant = keyof typeof QUOTE_CONSTANTS;
