import type {
  TPayment,
  TNewPaymentTransaction,
  PaymentTransactionStatus,
} from "../../schemas";
import type {
  CreatePaymentDTO,
  DebtRepaymentDTO,
  CreateDebtRepaymentDTO,
  UpdateDebtRepaymentDTO,
  PaymentTransactionDetailsDTO,
} from "../../dtos";

export interface PaymentTransactionSummary {
  id: string;
  amount: string;
  orderId: string;
  orderCode: number | null;
  status: PaymentTransactionStatus;
}

export interface PaymentService {
  verifyCashPayment(
    orderId: string,
    verifiedById: string,
  ): Promise<{ id: string } | undefined>;
  createPayment(data: CreatePaymentDTO): Promise<{ id: string }>;
  createPaymentTransaction(
    data: TNewPaymentTransaction,
  ): Promise<{ id: string }>;
  getPaymentTransactionByReferenceCode(
    referenceCode: string,
  ): Promise<{ id: string }>;
  getPaymentTransactionByOrderCode(
    orderCode: number,
  ): Promise<PaymentTransactionSummary | undefined>;
  confirmDebtRepayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean>;
  updatePayment(
    id: string,
    data: Partial<TPayment>,
  ): Promise<{ id: string } | undefined>;
  getPendingPayOSTransactionByOrderId(
    orderId: string,
  ): Promise<PaymentTransactionDetailsDTO | undefined>;
  getLastPayOSTransactionByOrderId(
    orderId: string,
  ): Promise<PaymentTransactionDetailsDTO | undefined>;
  updatePaymentTransactionStatus(
    id: string,
    status: PaymentTransactionStatus,
  ): Promise<void>;
  confirmPayOSPayment(
    orderCode: string,
    amount: number,
    referenceCode: string,
  ): Promise<boolean>;
  createDebtRepayment(data: CreateDebtRepaymentDTO): Promise<{ id: string }>;
  getDebtRepaymentByReferenceCode(
    referenceCode: string,
  ): Promise<DebtRepaymentDTO | undefined>;
  getDebtRepaymentByOrderCode(
    orderCode: number,
  ): Promise<DebtRepaymentDTO | undefined>;
  updateDebtRepayment(
    id: string,
    data: UpdateDebtRepaymentDTO,
  ): Promise<DebtRepaymentDTO>;
  getDebtRepaymentsByUserId(userId: string): Promise<DebtRepaymentDTO[]>;
}
