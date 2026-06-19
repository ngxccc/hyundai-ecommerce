import { type TDebtRepayment } from "../schemas";

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
