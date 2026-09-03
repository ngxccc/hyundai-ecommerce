export abstract class DomainError extends Error {
  public abstract readonly code: string;
  public abstract readonly translationKey: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  public readonly code = "NOT_FOUND";

  constructor(
    public readonly entity: string,
    public readonly id?: string,
    message?: string,
  ) {
    super(message ?? `${entity} not found`);
    this.name = "NotFoundError";
  }

  get translationKey(): string {
    const lower = this.entity.charAt(0).toLowerCase() + this.entity.slice(1);
    return `${lower}NotFound`;
  }
}

export class ConflictError extends DomainError {
  public readonly code = "CONFLICT";

  constructor(
    public readonly field: string,
    public readonly reason: string = "already exists",
    message?: string,
  ) {
    super(message ?? `${field} ${reason}`);
    this.name = "ConflictError";
  }

  get translationKey(): string {
    if (this.field === "slug") return "validation.slugExists";
    return `${this.field}Exists`;
  }
}

export type BusinessRuleCode =
  | "INSUFFICIENT_CREDIT_LIMIT"
  | "INVALID_STATUS_TRANSITION"
  | "CART_EMPTY"
  | "CART_CHANGED"
  | "LOCK_ACQUISITION_FAILED"
  | "INVALID_AMOUNT"
  | "INVALID_PAYMENT_METHOD"
  | "INVALID_PAYMENT_STATUS"
  | "QUOTE_ALREADY_APPROVED"
  | "QUOTE_NOT_EDITABLE"
  | "PRODUCT_QUOTE_ONLY"
  | "INSUFFICIENT_STOCK"
  | "PARENT_NOT_FOUND"
  | "OPERATION_FAILED";

export class BusinessRuleError extends DomainError {
  constructor(
    public readonly code: BusinessRuleCode,
    message?: string,
    private readonly customTranslationKey?: string,
  ) {
    super(message ?? code);
    this.name = "BusinessRuleError";
  }

  get translationKey(): string {
    if (this.customTranslationKey) return this.customTranslationKey;
    const keyMap: Record<BusinessRuleCode, string> = {
      INSUFFICIENT_CREDIT_LIMIT: "insufficientCreditLimit",
      INVALID_STATUS_TRANSITION: "invalidStatusTransition",
      CART_EMPTY: "cartEmpty",
      CART_CHANGED: "cartChanged",
      LOCK_ACQUISITION_FAILED: "lockAcquisitionFailed",
      INVALID_AMOUNT: "invalidAmount",
      INVALID_PAYMENT_METHOD: "invalidPaymentMethod",
      INVALID_PAYMENT_STATUS: "invalidPaymentStatus",
      QUOTE_ALREADY_APPROVED: "quoteAlreadyApproved",
      QUOTE_NOT_EDITABLE: "quoteNotEditableOrConvertible",
      PRODUCT_QUOTE_ONLY: "productIsQuoteOnly",
      INSUFFICIENT_STOCK: "insufficientStock",
      PARENT_NOT_FOUND: "parentNotFound",
      OPERATION_FAILED: "default",
    };
    return keyMap[this.code] ?? "default";
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
