import {
  type PaymentTransactionStatus,
  type PaymentTransactionType,
  type TDebtRepayment,
} from "../schemas";

export interface PaymentTransactionDetailsDTO {
  id: string;
  orderCode: number | null;
  amount: string;
  status: PaymentTransactionStatus;
  transactionType: PaymentTransactionType;
  createdAt: Date;
}

export type DebtRepaymentDTO = Omit<
  TDebtRepayment,
  "createdAt" | "updatedAt" | "deletedAt"
>;

export type CreateDebtRepaymentDTO = Omit<
  DebtRepaymentDTO,
  "id" | "referenceCode" | "verifiedBy"
>;

export type UpdateDebtRepaymentDTO = Partial<
  Omit<DebtRepaymentDTO, "id" | "userId">
>;
