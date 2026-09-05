import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { numberToVietnameseWords } from "@/shared/lib/utils";
import type { AdminQuote } from "@/types/api";

Font.register({
  family: "NotoSans",
  fonts: [
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Regular.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-400-normal.ttf",
      fontWeight: "normal",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Bold.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-700-normal.ttf",
      fontWeight: "bold",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Italic.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-400-italic.ttf",
      fontStyle: "italic",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-BoldItalic.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-700-italic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// Custom hyphenation: allow wrapping on hyphens, slashes, or excessively long words
// while preserving Vietnamese words, numbers, and currency strings intact.
Font.registerHyphenationCallback((word) => {
  if (word.includes("-") || word.includes("_") || word.includes("/")) {
    const parts = word.split(/([-_/])/);
    const result: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const part = parts[i] ?? "";
      const delim = parts[i + 1] ?? "";
      if (part || delim) {
        result.push(part + delim);
      }
    }
    return result.filter(Boolean);
  }
  if (word.length > 16) {
    const chunks = word.match(/.{1,12}/g);
    if (chunks) return chunks;
  }
  return [word];
});

export interface QuotePdfDocumentProps {
  quote: AdminQuote;
  includeAppendix?: boolean;
}

const NAVY = "#002C6C";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#475569";
const BORDER_COLOR = "#CBD5E1";
const BG_HEADER = "#F1F5F9";
const BG_ZEBRA = "#F8FAFC";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 8.5,
    lineHeight: 1.35,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 28,
    color: TEXT_DARK,
    backgroundColor: "#FFFFFF",
  },
  // Header Corporate Block
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 8,
    marginBottom: 8,
  },
  logoSection: {
    width: "58%",
  },
  companyBrand: {
    fontSize: 12,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  companyName: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: TEXT_DARK,
    marginTop: 2,
    textTransform: "uppercase",
  },
  companyDetails: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 1.3,
  },
  companyHighlight: {
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  documentMetaRight: {
    width: "40%",
    alignItems: "flex-end",
    textAlign: "right",
  },
  documentTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    textAlign: "right",
    marginBottom: 4,
  },
  metaItem: {
    fontSize: 7.8,
    color: TEXT_MUTED,
    marginTop: 1.5,
  },
  metaValue: {
    fontWeight: "bold",
    color: TEXT_DARK,
  },

  // Customer & Delivery Information Block
  customerBox: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 6,
    marginBottom: 8,
    backgroundColor: BG_ZEBRA,
  },
  boxTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 2,
    marginBottom: 4,
  },
  customerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  customerCol: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 2.5,
  },
  customerColFull: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 1,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    width: "32%",
  },
  fieldValue: {
    fontSize: 7.8,
    color: TEXT_DARK,
    width: "68%",
    fontWeight: "bold",
  },

  // Section Heading
  sectionHeading: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 4,
  },

  // Line Items Table
  tableContainer: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BG_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    alignItems: "center",
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    alignItems: "flex-start",
    minHeight: 18,
  },
  tableRowZebra: {
    backgroundColor: BG_ZEBRA,
  },
  thCell: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: NAVY,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
    textTransform: "uppercase",
  },
  tdCell: {
    fontSize: 7.5,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
    overflow: "hidden",
  },
  colStt: { width: "5%", textAlign: "center" },
  colName: { width: "34%" },
  colModel: { width: "17%" },
  colUnit: { width: "7%", textAlign: "center" },
  colQty: { width: "7%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right", borderRightWidth: 0 },

  itemTitle: {
    fontWeight: "bold",
    color: TEXT_DARK,
    fontSize: 7.8,
  },
  itemSubtitle: {
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  discountBadge: {
    fontSize: 6.5,
    color: "#B45309",
    fontStyle: "italic",
    marginTop: 1,
  },

  // Financial Summary Block
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
  },
  summaryLabel: {
    width: "40%",
    fontSize: 7.8,
    textAlign: "right",
    color: TEXT_MUTED,
    paddingRight: 8,
  },
  summaryValue: {
    width: "18%",
    fontSize: 7.8,
    textAlign: "right",
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  grandTotalRow: {
    backgroundColor: BG_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 3.5,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: NAVY,
  },
  grandTotalValue: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: NAVY,
  },
  wordsBox: {
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: BG_ZEBRA,
    marginBottom: 6,
    flexDirection: "row",
  },
  wordsLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  wordsValue: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: NAVY,
    fontWeight: "bold",
    flex: 1,
  },

  // Commercial Terms & Bank Box
  termsAndBankGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  termsCol: {
    width: "58%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 5,
  },
  bankCol: {
    width: "40%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 5,
    backgroundColor: BG_ZEBRA,
  },
  termItem: {
    fontSize: 7.3,
    color: TEXT_DARK,
    marginBottom: 2.5,
    lineHeight: 1.25,
  },
  termBold: {
    fontWeight: "bold",
    color: NAVY,
  },
  bankItem: {
    fontSize: 7.3,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  bankQrRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  bankQrImage: {
    width: 48,
    height: 48,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: BORDER_COLOR,
  },

  // Signatures Section
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
  },
  signBox: {
    width: "31%",
    textAlign: "center",
    alignItems: "center",
  },
  signTitle: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
  },
  signSub: {
    fontSize: 6.8,
    color: TEXT_MUTED,
    fontStyle: "italic",
    marginTop: 1,
  },
  signGap: {
    height: 38,
  },
  signName: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: TEXT_DARK,
  },

  // Page 2: Appendix Table
  appendixTitleBar: {
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 4,
    marginBottom: 8,
  },
  appendixHeading: {
    fontSize: 10,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
  },
  appendixSubtitle: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  specCategoryHeader: {
    backgroundColor: BG_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  specCategoryTitle: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    minHeight: 14,
  },
  specKeyCell: {
    width: "38%",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    fontSize: 7.3,
    color: TEXT_MUTED,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
  },
  specValCell: {
    width: "62%",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    fontSize: 7.3,
    color: TEXT_DARK,
    fontWeight: "bold",
  },

  // Footer & Page Numbering
  pageFooter: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: BORDER_COLOR,
    paddingTop: 3,
  },
  footerText: {
    fontSize: 6.8,
    color: TEXT_MUTED,
  },
});

const formatCurrencyVnd = (val: string | number | null | undefined): string => {
  const num = typeof val === "string" ? parseFloat(val) : Number(val ?? 0);
  if (isNaN(num)) return "0 ₫";
  return `${new Intl.NumberFormat("vi-VN").format(num)} ₫`;
};

const formatDateVn = (date: Date | string | null | undefined): string => {
  if (!date) return "---";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "---";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
const formatSpecString = (val: unknown): string | null => {
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }
  return null;
};

const deduceUnit = (name?: string | null): string => {
  if (!name) return "Bộ";
  const lower = name.toLowerCase();
  if (
    lower.includes("nhớt") ||
    lower.includes("dầu") ||
    lower.includes("nước làm mát")
  ) {
    return "Lít";
  }
  if (lower.includes("dây") || lower.includes("cáp")) {
    return "Mét";
  }
  if (
    lower.includes("nhân công") ||
    lower.includes("lắp đặt") ||
    lower.includes("vận chuyển") ||
    lower.includes("nghiệm thu")
  ) {
    return "Gói";
  }
  if (lower.includes("tủ") || lower.includes("ats")) {
    return "Tủ";
  }
  if (
    lower.includes("bình") ||
    lower.includes("ắc quy") ||
    lower.includes("ac quy")
  ) {
    return "Bình";
  }
  return "Bộ";
};

const isSlugString = (val: string): boolean => {
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

const deduceModel = (
  itemName?: string | null,
  itemModel?: string | null,
  itemSpecs?: string | null,
): string => {
  // 1. If itemModel is provided, valid, and not a slug
  if (itemModel?.trim() && itemModel.trim() !== "---") {
    const trimmed = itemModel.trim();
    if (!isSlugString(trimmed)) {
      return trimmed;
    }
  }

  // 2. Check if itemSpecs is a JSON string containing model
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
      // itemSpecs is plain text
    }
  }

  // 3. Extract model code from itemName (e.g. DHY11KSEm, DHY65KSE, HY-30CLE, HY7000LE, HPG1000L)
  if (itemName) {
    const match =
      /\b(DHY[-0-9A-Za-z]+|HY[-0-9A-Za-z]+|HPG[-0-9A-Za-z]+)\b/i.exec(itemName);
    if (match) {
      return match[1];
    }
  }

  return "---";
};

export const QuotePdfDocument = ({
  quote,
  includeAppendix = true,
}: QuotePdfDocumentProps) => {
  const terms = quote.commercialTerms;
  const subtotal = parseFloat(quote.subtotalPrice ?? "0");
  const vatRate = quote.vatRate ?? 10;
  const vatAmount = parseFloat(quote.vatAmount ?? "0");
  const grandTotal = parseFloat(quote.totalQuotedPrice ?? "0");
  const amountInWords = numberToVietnameseWords(grandTotal);

  const quoteNo = quote.quoteNumber ?? quote.id.slice(0, 8);

  // Filter generator items for Appendix
  const generatorItems = quote.items.filter((item) => {
    const hasItemSpecs = Boolean(item.itemSpecs);
    return hasItemSpecs || !item.isCustomItem;
  });

  const shouldRenderAppendix = includeAppendix && generatorItems.length > 0;

  // VietQR URL for bank transfer deposit
  const vietQrUrl = `https://img.vietqr.io/image/vietinbank-113002859999-compact2.png?amount=${Math.round(grandTotal * 0.3)}&addInfo=${encodeURIComponent(quoteNo)}`;

  return (
    <Document
      title={`Báo giá ${quoteNo} - CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG`}
      author="Hyundai Power Products Vietnam"
      subject={`Báo giá thiết bị máy phát điện số ${quoteNo}`}
    >
      {/* =================================================================== */}
      {/* PAGE 1: COMMERCIAL QUOTATION                                       */}
      {/* =================================================================== */}
      <Page size="A4" style={styles.page}>
        {/* Header Corporate Identity */}
        <View style={styles.headerRow}>
          <View style={styles.logoSection}>
            <Text style={styles.companyBrand}>HYUNDAI POWER PRODUCTS</Text>
            <Text style={styles.companyName}>
              CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
            </Text>
            <Text style={styles.companyDetails}>
              VP: 310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP.
              HCM
            </Text>
            <Text style={styles.companyDetails}>
              Hotline: <Text style={styles.companyHighlight}>0901.49.7771</Text>{" "}
              | Email: hyundaipowerproducts.vn@gmail.com
            </Text>
            <Text style={styles.companyDetails}>
              MST: <Text style={styles.companyHighlight}>0316447814</Text> |
              Website: https://hyundaipowerproducts.vn
            </Text>
          </View>

          <View style={styles.documentMetaRight}>
            <Text style={styles.documentTitle}>BẢNG BÁO GIÁ THIẾT BỊ</Text>
            <Text style={styles.metaItem}>
              Số báo giá: <Text style={styles.metaValue}>{quoteNo}</Text>
            </Text>
            <Text style={styles.metaItem}>
              Ngày phát hành:{" "}
              <Text style={styles.metaValue}>
                {formatDateVn(quote.createdAt)}
              </Text>
            </Text>
            <Text style={styles.metaItem}>
              Hiệu lực:{" "}
              <Text style={styles.metaValue}>
                {terms?.validityDays ?? 15} ngày
              </Text>{" "}
              (đến {formatDateVn(quote.expirationDate)})
            </Text>
          </View>
        </View>

        {/* Customer Information Block */}
        <View style={styles.customerBox}>
          <Text style={styles.boxTitle}>
            ĐƠN VỊ TIẾP NHẬN BÁO GIÁ / KHÁCH HÀNG
          </Text>
          <View style={styles.customerGrid}>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Người nhận:</Text>
              <Text style={styles.fieldValue}>{quote.customerName}</Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Điện thoại:</Text>
              <Text style={styles.fieldValue}>{quote.customerPhone}</Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Đơn vị / Công ty:</Text>
              <Text style={styles.fieldValue}>
                {quote.companyName ?? "Khách hàng cá nhân"}
              </Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Email:</Text>
              <Text style={styles.fieldValue}>
                {quote.customerEmail ?? "---"}
              </Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Mã số thuế:</Text>
              <Text style={styles.fieldValue}>{quote.taxId ?? "---"}</Text>
            </View>
            <View style={styles.customerCol}>
              <Text style={styles.fieldLabel}>Địa chỉ giao:</Text>
              <Text style={styles.fieldValue}>
                {quote.shippingAddress ??
                  "Tại kho Bên Mua hoặc chân công trình"}
              </Text>
            </View>
          </View>
        </View>

        {/* Section I: Equipment & Pricing Table */}
        <Text style={styles.sectionHeading}>
          I. DANH MỤC THIẾT BỊ & CHI TIẾT BÁO GIÁ
        </Text>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, styles.colStt]}>#</Text>
            <Text style={[styles.thCell, styles.colName]}>
              Tên Hàng Hóa & Quy Cách
            </Text>
            <Text style={[styles.thCell, styles.colModel]}>
              Mã Hiệu / Model
            </Text>
            <Text style={[styles.thCell, styles.colUnit]}>ĐVT</Text>
            <Text style={[styles.thCell, styles.colQty]}>SL</Text>
            <Text style={[styles.thCell, styles.colPrice]}>Đơn Giá (VNĐ)</Text>
            <Text style={[styles.thCell, styles.colTotal]}>
              Thành Tiền (VNĐ)
            </Text>
          </View>

          {/* Table Rows */}
          {quote.items.map((item, idx) => {
            const unitPrice = parseFloat(item.unitPrice ?? "0");
            const discountPercent = parseFloat(item.discountPercent ?? "0");
            const finalUnitPrice =
              discountPercent > 0
                ? unitPrice * (1 - discountPercent / 100)
                : unitPrice;
            const totalPrice = finalUnitPrice * item.quantity;
            const model = deduceModel(
              item.itemName,
              item.itemModel,
              item.itemSpecs,
            );
            const unit = deduceUnit(item.itemName);
            const isZebra = idx % 2 === 1;

            return (
              <View
                key={item.id}
                style={[styles.tableRow, isZebra ? styles.tableRowZebra : {}]}
              >
                <Text style={[styles.tdCell, styles.colStt]}>{idx + 1}</Text>
                <View style={[styles.tdCell, styles.colName]}>
                  <Text style={styles.itemTitle}>{item.itemName}</Text>
                  {item.itemSpecs ? (
                    <Text style={styles.itemSubtitle}>{item.itemSpecs}</Text>
                  ) : null}
                  {discountPercent > 0 ? (
                    <Text style={styles.discountBadge}>
                      Đã trừ CK {discountPercent}% (Giá gốc:{" "}
                      {formatCurrencyVnd(unitPrice)})
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.tdCell, styles.colModel]}>{model}</Text>
                <Text style={[styles.tdCell, styles.colUnit]}>{unit}</Text>
                <Text style={[styles.tdCell, styles.colQty]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tdCell, styles.colPrice]}>
                  {formatCurrencyVnd(finalUnitPrice)}
                </Text>
                <Text style={[styles.tdCell, styles.colTotal]}>
                  {formatCurrencyVnd(totalPrice)}
                </Text>
              </View>
            );
          })}

          {/* Table Summary Rows */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Tổng cộng tiền hàng trước thuế:
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyVnd(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Thuế giá trị gia tăng (VAT {vatRate}%):
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyVnd(vatAmount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={[styles.summaryLabel, styles.grandTotalLabel]}>
              TỔNG CỘNG TIỀN THANH TOÁN:
            </Text>
            <Text style={[styles.summaryValue, styles.grandTotalValue]}>
              {formatCurrencyVnd(grandTotal)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        <View style={styles.wordsBox}>
          <Text style={styles.wordsLabel}>Bằng chữ: </Text>
          <Text style={styles.wordsValue}>{amountInWords}</Text>
        </View>

        {/* Section II: Terms & Bank Information */}
        <Text style={styles.sectionHeading}>
          II. ĐIỀU KHOẢN THƯƠNG MẠI & TÀI KHOẢN THANH TOÁN
        </Text>
        <View style={styles.termsAndBankGrid}>
          {/* Terms Column */}
          <View style={styles.termsCol}>
            <Text style={styles.termItem}>
              <Text style={styles.termBold}>1. Thời gian giao hàng: </Text>
              {terms?.deliveryTime ??
                "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng."}
            </Text>
            <Text style={styles.termItem}>
              <Text style={styles.termBold}>2. Địa điểm giao nhận: </Text>
              {terms?.deliveryLocation ??
                quote.shippingAddress ??
                "Giao hàng và hướng dẫn vận hành tại chân công trình Bên Mua."}
            </Text>
            <Text style={styles.termItem}>
              <Text style={styles.termBold}>3. Phương thức thanh toán: </Text>
              {terms?.paymentSchedule ??
                "Tạm ứng 30% khi ký hợp đồng, 70% còn lại trước khi bàn giao."}
            </Text>
            <Text style={styles.termItem}>
              <Text style={styles.termBold}>4. Chính sách bảo hành: </Text>
              {terms?.warrantyTerms ??
                "Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy theo tiêu chuẩn Hyundai."}
            </Text>
            {quote.note ? (
              <Text style={styles.termItem}>
                <Text style={styles.termBold}>5. Ghi chú kỹ thuật: </Text>
                {quote.note}
              </Text>
            ) : null}
          </View>

          {/* Bank Column with VietQR */}
          <View style={styles.bankCol}>
            <Text style={styles.boxTitle}>TÀI KHOẢN THANH TOÁN</Text>
            <Text style={styles.bankItem}>
              <Text style={styles.companyHighlight}>Đơn vị thụ hưởng:</Text>
              {"\n"}CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
            </Text>
            <Text style={styles.bankItem}>
              <Text style={styles.companyHighlight}>Số tài khoản: </Text>
              113002859999
            </Text>
            <Text style={styles.bankItem}>
              <Text style={styles.companyHighlight}>Ngân hàng: </Text>
              VietinBank (Chi nhánh Tây Sài Gòn)
            </Text>
            <Text style={styles.bankItem}>
              <Text style={styles.companyHighlight}>Cú pháp: </Text>
              {quoteNo} {quote.customerPhone ?? ""}
            </Text>
            <View style={styles.bankQrRow}>
              <Image src={vietQrUrl} style={styles.bankQrImage} />
              <Text style={{ fontSize: 6.8, color: TEXT_MUTED, flex: 1 }}>
                Quét mã VietQR bằng App Ngân hàng để thanh toán tạm ứng nhanh
              </Text>
            </View>
          </View>
        </View>

        {/* Signatures Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>ĐẠI DIỆN BÊN MUA</Text>
            <Text style={styles.signSub}>(Ký, ghi rõ họ tên và đóng dấu)</Text>
            <View style={styles.signGap} />
            <Text style={styles.signName}>{quote.customerName ?? "---"}</Text>
          </View>

          <View style={styles.signBox}>
            <Text style={styles.signTitle}>NGƯỜI LẬP BÁO GIÁ</Text>
            <Text style={styles.signSub}>(Ký và ghi rõ họ tên)</Text>
            <View style={styles.signGap} />
            <Text style={styles.signName}>Chuyên viên Kinh doanh</Text>
          </View>

          <View style={styles.signBox}>
            <Text style={styles.signTitle}>ĐẠI DIỆN BÊN BÁN</Text>
            <Text style={styles.signSub}>
              CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
            </Text>
            <View style={styles.signGap} />
            <Text style={styles.signName}>GIÁM ĐỐC / ĐẠI DIỆN PHÁP LUẬT</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            Hyundai Power Products Vietnam - Báo giá #{quoteNo}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Trang ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* =================================================================== */}
      {/* PAGE 2: TECHNICAL SPECIFICATIONS DATASHEET (PHỤ LỤC KỸ THUẬT)       */}
      {/* =================================================================== */}
      {shouldRenderAppendix &&
        generatorItems.map((item, idx) => {
          let parsedSpecs: Record<string, unknown> = {};
          if (item.itemSpecs) {
            try {
              parsedSpecs = JSON.parse(item.itemSpecs) as Record<
                string,
                unknown
              >;
            } catch {
              // itemSpecs is plain text
            }
          }
          const model = deduceModel(
            item.itemName,
            item.itemModel,
            item.itemSpecs,
          );

          const rawPower = formatSpecString(
            parsedSpecs.power ??
              parsedSpecs.standbyPowerKva ??
              parsedSpecs.primePowerKva,
          );
          const power = rawPower ?? "Tiêu chuẩn";

          const voltageStr = formatSpecString(parsedSpecs.voltage);
          const voltage = voltageStr ? `${voltageStr}V` : "220V / 380V";
          const frequencyStr = formatSpecString(parsedSpecs.frequency);
          const frequency = frequencyStr ? `${frequencyStr}Hz` : "50Hz";
          const phase =
            parsedSpecs.phase === "3phase"
              ? "3 Pha 4 Dây, 230/400V"
              : "1 Pha 2 Dây, 220/230V";
          const powerFactorStr = formatSpecString(parsedSpecs.powerFactor);
          const powerFactor = powerFactorStr
            ? `cosφ = ${powerFactorStr}`
            : "cosφ = 0.8";

          const engineBrand =
            typeof parsedSpecs.engineBrand === "string"
              ? parsedSpecs.engineBrand
              : "Hyundai Engine";
          const engineModel =
            typeof parsedSpecs.engine === "string"
              ? parsedSpecs.engine
              : (item.itemSpecs ?? "Động cơ Diesel chính hãng");
          const fuelType =
            parsedSpecs.fuelType === "gasoline" ? "Xăng" : "Dầu Diesel";
          const fuelConsumptionStr = formatSpecString(
            parsedSpecs.fuelConsumption,
          );
          const fuelConsumption = fuelConsumptionStr
            ? `${fuelConsumptionStr} L/h (ở 100% tải)`
            : "Tiêu hao tối ưu";
          const fuelTankStr = formatSpecString(parsedSpecs.fuelTankCapacity);
          const fuelTank = fuelTankStr
            ? `${fuelTankStr} Lít`
            : "Dung tích tiêu chuẩn";

          const alternatorBrand =
            typeof parsedSpecs.alternatorBrand === "string"
              ? parsedSpecs.alternatorBrand
              : "Hyundai / Stamford";
          const alternatorType =
            typeof parsedSpecs.alternator === "string"
              ? parsedSpecs.alternator
              : "Không chổi than, kích từ tự động AVR";
          const noiseLevelStr = formatSpecString(parsedSpecs.noiseLevel);
          const noiseLevel = noiseLevelStr
            ? `${noiseLevelStr} dB(A) @ 7m`
            : "<= 70 dB(A) @ 7m";

          const lenStr = formatSpecString(parsedSpecs.length);
          const widStr = formatSpecString(parsedSpecs.width);
          const heiStr = formatSpecString(parsedSpecs.height);
          const dimensions =
            lenStr && widStr && heiStr
              ? `${lenStr} x ${widStr} x ${heiStr} mm`
              : "Đồng bộ theo khung bệ";
          const weightStr = formatSpecString(parsedSpecs.weight);
          const weight = weightStr ? `${weightStr} kg` : "---";
          return (
            <Page key={item.id || idx} size="A4" style={styles.page}>
              {/* Header */}
              <View style={styles.appendixTitleBar}>
                <Text style={styles.appendixHeading}>
                  PHỤ LỤC KỸ THUẬT: ĐẶC TÍNH & THÔNG SỐ CHI TIẾT MÁY PHÁT ĐIỆN
                </Text>
                <Text style={styles.appendixSubtitle}>
                  Kèm theo Báo giá số: {quoteNo} | Mục #{idx + 1}:{" "}
                  {item.itemName} (Model: {model})
                </Text>
              </View>

              {/* Section 1: Operation & Power */}
              <View style={styles.tableContainer}>
                <View style={styles.specCategoryHeader}>
                  <Text style={styles.specCategoryTitle}>
                    1. THÔNG SỐ HOẠT ĐỘNG & ĐIỆN NĂNG
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Công suất liên tục (Prime):
                  </Text>
                  <Text style={styles.specValCell}>{power} kVA</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Điện áp định mức / Tần số:
                  </Text>
                  <Text style={styles.specValCell}>
                    {voltage} / {frequency}
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Số pha / Hệ số công suất:
                  </Text>
                  <Text style={styles.specValCell}>
                    {phase} ({powerFactor})
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Hệ thống khởi động:</Text>
                  <Text style={styles.specValCell}>
                    Đề điện 12V/24V DC hoặc Tự động kết nối ATS
                  </Text>
                </View>
              </View>

              {/* Section 2: Diesel Engine */}
              <View style={styles.tableContainer}>
                <View style={styles.specCategoryHeader}>
                  <Text style={styles.specCategoryTitle}>
                    2. ĐỘNG CƠ DIESEL & HỆ THỐNG NHIÊN LIỆU
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Hãng sản xuất động cơ:</Text>
                  <Text style={styles.specValCell}>{engineBrand}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Model động cơ:</Text>
                  <Text style={styles.specValCell}>{engineModel}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Loại nhiên liệu & Tiêu hao:
                  </Text>
                  <Text style={styles.specValCell}>
                    {fuelType} ({fuelConsumption})
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Dung tích thùng chứa nhiên liệu:
                  </Text>
                  <Text style={styles.specValCell}>{fuelTank}</Text>
                </View>
              </View>

              {/* Section 3: Alternator & Controller */}
              <View style={styles.tableContainer}>
                <View style={styles.specCategoryHeader}>
                  <Text style={styles.specCategoryTitle}>
                    3. ĐẦU PHÁT ĐIỆN & HỆ THỐNG ĐIỀU KHIỂN
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Hãng sản xuất đầu phát:
                  </Text>
                  <Text style={styles.specValCell}>{alternatorBrand}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Kiểu đầu phát:</Text>
                  <Text style={styles.specValCell}>{alternatorType}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Màn hình điều khiển:</Text>
                  <Text style={styles.specValCell}>
                    Màn hình LCD thông minh hiển thị đầy đủ thông số V, A, Hz,
                    kW
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Tính năng an toàn bảo vệ:
                  </Text>
                  <Text style={styles.specValCell}>
                    Tự động cảnh báo & dừng máy khi áp suất nhớt thấp, quá
                    nhiệt, quá tải
                  </Text>
                </View>
              </View>

              {/* Section 4: Canopy & Dimensions */}
              <View style={styles.tableContainer}>
                <View style={styles.specCategoryHeader}>
                  <Text style={styles.specCategoryTitle}>
                    4. VỎ CÁCH ÂM & QUY CÁCH KÍCH THƯỚC
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Độ ồn tiêu chuẩn:</Text>
                  <Text style={styles.specValCell}>{noiseLevel}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>
                    Kích thước (Dài x Rộng x Cao):
                  </Text>
                  <Text style={styles.specValCell}>{dimensions}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Trọng lượng khô:</Text>
                  <Text style={styles.specValCell}>{weight}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKeyCell}>Quy cách vỏ máy:</Text>
                  <Text style={styles.specValCell}>
                    Vỏ siêu chống ồn sơn tĩnh điện ngoài trời, mút tiêu âm chống
                    cháy
                  </Text>
                </View>
              </View>

              {/* Page 2 Footer */}
              <View style={styles.pageFooter} fixed>
                <Text style={styles.footerText}>
                  Hyundai Power Products Vietnam - Phụ lục Kỹ thuật #{quoteNo}
                </Text>
                <Text
                  style={styles.footerText}
                  render={({ pageNumber, totalPages }) =>
                    `Trang ${pageNumber} / ${totalPages}`
                  }
                />
              </View>
            </Page>
          );
        })}
    </Document>
  );
};
