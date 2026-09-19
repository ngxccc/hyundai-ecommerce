import { TIME_IN_MS } from "@/constants/time.constant";

/**
 * Formats a Date or date string into Vietnamese standard DD/MM/YYYY format.
 *
 * @param date - Date object, ISO date string, or null/undefined
 * @returns Formatted date string, or "---" if date is empty or invalid
 */
export const formatDateVn = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "---";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "---";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Computes the effective expiration date for a quotation.
 * If an explicit expiration date is provided, returns it.
 * Otherwise calculates the expiration date by adding validity days (default 15) to the creation date.
 *
 * @param createdAt - Issuance timestamp
 * @param expirationDate - Explicit expiration timestamp if recorded
 * @param validityDays - Number of days the quote is valid (defaults to 15)
 * @returns Effective expiration Date object or null if createdAt is invalid
 */
export const resolveExpirationDate = (
  createdAt: Date | string | null | undefined,
  expirationDate: Date | string | null | undefined,
  validityDays = 15,
): Date | string => {
  if (expirationDate) return expirationDate;
  const created = createdAt ? new Date(createdAt) : new Date();
  const validCreated = isNaN(created.getTime()) ? new Date() : created;
  return new Date(validCreated.getTime() + validityDays * TIME_IN_MS.DAY);
};

/**
 * Formats a numeric currency value into Vietnamese Dong currency string with symbol.
 *
 * @param val - Numeric or string value to format
 * @returns Formatted VND currency string (e.g. "100.000.000 ₫")
 */
export const formatCurrencyVnd = (
  val: string | number | null | undefined,
): string => {
  const num = typeof val === "string" ? parseFloat(val) : Number(val ?? 0);
  if (isNaN(num)) return "0 ₫";
  return `${new Intl.NumberFormat("vi-VN").format(num)} ₫`;
};

/**
 * Converts a raw specification value into a trimmed string representation.
 *
 * @param val - Specification value of unknown type
 * @returns Formatted string or null if empty
 */
export const formatSpecString = (val: unknown): string | null => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }
  return null;
};

/**
 * Infers appropriate physical unit based on product title nomenclature.
 *
 * @param name - Product or line item title
 * @returns Standard Vietnamese commercial unit (Bộ, Lít, Mét, Gói, Tủ, Bình)
 */
export const deduceUnit = (name?: string | null, locale = "vi"): string => {
  const isEn = locale.toLowerCase().startsWith("en");
  if (!name) return isEn ? "Set" : "Bộ";
  const lower = name.toLowerCase();
  if (
    lower.includes("nhớt") ||
    lower.includes("dầu") ||
    lower.includes("nước làm mát") ||
    lower.includes("oil") ||
    lower.includes("coolant")
  ) {
    return isEn ? "Liter" : "Lít";
  }
  if (
    lower.includes("dây") ||
    lower.includes("cáp") ||
    lower.includes("cable") ||
    lower.includes("wire")
  ) {
    return isEn ? "Meter" : "Mét";
  }
  if (
    lower.includes("nhân công") ||
    lower.includes("lắp đặt") ||
    lower.includes("vận chuyển") ||
    lower.includes("nghiệm thu") ||
    lower.includes("installation") ||
    lower.includes("labor") ||
    lower.includes("delivery")
  ) {
    return isEn ? "Package" : "Gói";
  }
  if (
    lower.includes("tủ") ||
    lower.includes("ats") ||
    lower.includes("panel")
  ) {
    return isEn ? "Cabinet" : "Tủ";
  }
  if (
    lower.includes("bình") ||
    lower.includes("ắc quy") ||
    lower.includes("ac quy") ||
    lower.includes("battery")
  ) {
    return isEn ? "Unit" : "Bình";
  }
  return isEn ? "Set" : "Bộ";
};

/**
 * Evaluates whether a string matches URL slug formatting rather than an official model code.
 *
 * @param val - Candidate string to check
 * @returns true if candidate matches slug conventions; otherwise false
 */
export const isSlugString = (val: string): boolean => {
  const trimmed = val.trim().toLowerCase();
  return (
    trimmed.startsWith("may-phat-") ||
    trimmed.startsWith("bo-luu-dien-") ||
    trimmed.startsWith("dong-co-") ||
    (trimmed.includes("-") &&
      trimmed.split("-").length > 2 &&
      /^[a-z0-9-]+$/.test(trimmed))
  );
};

/**
 * Resolves commercial equipment model code across available metadata fields.
 *
 * @param itemName - Item title
 * @param itemModel - Predefined model code
 * @param itemSpecs - Technical specification text or JSON blob
 * @returns Clean equipment model code or "---" fallback
 */
export const deduceModel = (
  itemName?: string | null,
  itemModel?: string | null,
  itemSpecs?: string | null,
): string => {
  if (itemModel?.trim() && itemModel.trim() !== "---") {
    const trimmed = itemModel.trim();
    if (!isSlugString(trimmed)) {
      return trimmed;
    }
  }

  if (itemSpecs) {
    try {
      const parsed = JSON.parse(itemSpecs) as Record<string, unknown>;
      if (
        typeof parsed.model === "string" &&
        parsed.model.trim() &&
        parsed.model.trim() !== "---" &&
        !isSlugString(parsed.model.trim())
      ) {
        return parsed.model.trim();
      }
    } catch {
      // Non-JSON plain text specs are handled by itemName regex fallback below
    }
  }

  if (itemName) {
    const match =
      /\b(DHY[-0-9A-Za-z]+|HY[-0-9A-Za-z]+|HPG[-0-9A-Za-z]+)\b/i.exec(itemName);
    if (match) {
      return match[1];
    }
  }

  return "---";
};

/**
 * Generates an official VietQR dynamic transfer QR URL based on company banking configuration.
 *
 * @param quoteNo - Document quote number used as payment reference memo
 * @param amount - Deposit amount in VND
 * @returns Fully qualified VietQR image URL
 */
export const generateVietQrUrl = (
  quoteNo: string,
  amount: number,
  bank: { bin: string; accountNo: string; qrTemplate: string },
): string => {
  const { bin, accountNo, qrTemplate } = bank;
  const roundedAmount = Math.round(amount);
  const memo = encodeURIComponent(quoteNo);
  return `https://img.vietqr.io/image/${bin}-${accountNo}-${qrTemplate}.png?amount=${roundedAmount}&addInfo=${memo}`;
};
