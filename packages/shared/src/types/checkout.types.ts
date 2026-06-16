export interface CheckoutRequestBody {
  shippingAddress: string;
  paymentMethod: "PAYOS" | "MANUAL_TRANSFER";
  paymentOption: "DEPOSIT" | "FULL";
  shippingFee?: number;
}
