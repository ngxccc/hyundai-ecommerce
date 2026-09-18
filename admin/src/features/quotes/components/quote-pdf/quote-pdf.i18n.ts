import { companyConfig } from "@/config/company";

export type PdfLocale = "vi" | "en";

export interface QuotePdfDictionary {
  documentTitle: string;
  quoteNumberLabel: string;
  issueDateLabel: string;
  validityLabel: string;
  validityDaysUnit: string;
  validityUntilPrefix: string;
  hotlineLabel: string;
  emailLabel: string;
  taxIdLabel: string;
  websiteLabel: string;
  officePrefix: string;
  companyName: string;
  companyAddress: string;
  bankBranch: string;

  // Customer Card
  customerSectionTitle: string;
  attentionLabel: string;
  phoneLabel: string;
  companyLabel: string;
  individualCustomer: string;
  deliveryAddressLabel: string;
  defaultDeliveryAddress: string;

  // Items Table
  itemsSectionTitle: string;
  colIndex: string;
  colItemName: string;
  colModel: string;
  colUnit: string;
  colQuantity: string;
  colUnitPrice: string;
  colTotalPrice: string;
  discountBadge: (discount: number, original: string) => string;
  subtotalLabel: string;
  vatLabel: (rate: number) => string;
  grandTotalLabel: string;
  amountInWordsLabel: string;

  // Terms & Banking
  termsSectionTitle: string;
  termDeliveryTimeLabel: string;
  termDeliveryTimeDefault: string;
  termDeliveryLocationLabel: string;
  termDeliveryLocationDefault: string;
  termPaymentScheduleLabel: string;
  termPaymentScheduleDefault: string;
  termWarrantyLabel: string;
  termWarrantyDefault: string;
  termTechnicalNotesLabel: string;
  bankBoxTitle: string;
  bankBeneficiaryLabel: string;
  bankAccountNoLabel: string;
  bankNameLabel: string;
  bankMemoLabel: string;
  bankQrCaption: string;

  // Signatures
  signBuyerTitle: string;
  signBuyerSubtitle: string;
  signPreparerTitle: string;
  signPreparerSubtitle: string;
  signPreparerRole: string;
  signSellerTitle: string;
  signSellerRole: string;

  // Technical Appendix - General & Generator
  appendixHeading: string;
  appendixSubtitle: (quoteNo: string) => string;
  specRatedOutput: string;
  specVoltageFreq: string;
  specPhasePowerFactor: string;
  specFuelConsumption: string;
  specFuelTank: string;
  specEngine: string;
  specAlternator: string;
  specNoiseLevel: string;
  specDimensions: string;
  specDryWeight: string;
  specStandardPower: string;
  specStandardChassis: string;
  specStandardFuel: string;

  // Technical Appendix - UPS Specific
  specTopology: string;
  specTopologyDefault: string;
  specInputOutput: string;
  specTransferTime: string;
  specTransferTimeZero: string;
  specBatteryType: string;
  specBatteryDefault: string;

  // Footer
  footerDocument: (quoteNo: string) => string;
  footerAppendix: (quoteNo: string) => string;
  footerPage: (page: number | string, total: number | string) => string;
}

const DICTIONARIES: Record<PdfLocale, QuotePdfDictionary> = {
  vi: {
    documentTitle: "BẢNG BÁO GIÁ THIẾT BỊ",
    quoteNumberLabel: "Số báo giá",
    issueDateLabel: "Ngày phát hành",
    validityLabel: "Hiệu lực",
    validityDaysUnit: "ngày",
    validityUntilPrefix: "đến",
    hotlineLabel: "Hotline",
    emailLabel: "Email",
    taxIdLabel: "MST",
    websiteLabel: "Website",
    officePrefix: "VP",
    companyName: companyConfig.legalNameVi,
    companyAddress: companyConfig.addresses.headquarters.vi,
    bankBranch: companyConfig.bank.branchVi,

    customerSectionTitle: "KHÁCH HÀNG",
    attentionLabel: "Người nhận",
    phoneLabel: "Điện thoại",
    companyLabel: "Đơn vị / Công ty",
    individualCustomer: "Khách hàng cá nhân",
    deliveryAddressLabel: "Địa chỉ giao",
    defaultDeliveryAddress: "Tại kho Bên Mua hoặc chân công trình",

    itemsSectionTitle: "I. DANH MỤC THIẾT BỊ & CHI TIẾT BÁO GIÁ",
    colIndex: "#",
    colItemName: "Tên Hàng Hóa",
    colModel: "Mã Hiệu / Model",
    colUnit: "ĐVT",
    colQuantity: "SL",
    colUnitPrice: "Đơn Giá (VNĐ)",
    colTotalPrice: "Thành Tiền (VNĐ)",
    discountBadge: (discount, original) =>
      `Đã trừ CK ${discount}% (Giá gốc: ${original})`,
    subtotalLabel: "Tổng cộng tiền hàng trước thuế:",
    vatLabel: (rate) => `Thuế giá trị gia tăng (VAT ${rate}%):`,
    grandTotalLabel: "TỔNG CỘNG TIỀN THANH TOÁN:",
    amountInWordsLabel: "Bằng chữ:",

    termsSectionTitle: "II. ĐIỀU KHOẢN THƯƠNG MẠI & TÀI KHOẢN THANH TOÁN",
    termDeliveryTimeLabel: "1. Thời gian giao hàng:",
    termDeliveryTimeDefault:
      "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng.",
    termDeliveryLocationLabel: "2. Địa điểm giao nhận:",
    termDeliveryLocationDefault:
      "Giao hàng và hướng dẫn vận hành tại chân công trình Bên Mua.",
    termPaymentScheduleLabel: "3. Phương thức thanh toán:",
    termPaymentScheduleDefault:
      "Tạm ứng 30% khi ký hợp đồng, 70% còn lại trước khi bàn giao.",
    termWarrantyLabel: "4. Chính sách bảo hành:",
    termWarrantyDefault: `Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy theo tiêu chuẩn ${companyConfig.brandName}.`,
    termTechnicalNotesLabel: "5. Ghi chú kỹ thuật:",
    bankBoxTitle: "TÀI KHOẢN THANH TOÁN",
    bankBeneficiaryLabel: "Đơn vị thụ hưởng:",
    bankAccountNoLabel: "Số tài khoản:",
    bankNameLabel: "Ngân hàng:",
    bankMemoLabel: "Cú pháp:",
    bankQrCaption:
      "Quét mã VietQR bằng App Ngân hàng để thanh toán tạm ứng nhanh",

    signBuyerTitle: "ĐẠI DIỆN BÊN MUA",
    signBuyerSubtitle: "(Ký, ghi rõ họ tên và đóng dấu)",
    signPreparerTitle: "NGƯỜI LẬP BÁO GIÁ",
    signPreparerSubtitle: "(Ký và ghi rõ họ tên)",
    signPreparerRole: "Chuyên viên Kinh doanh",
    signSellerTitle: "ĐẠI DIỆN BÊN BÁN",
    signSellerRole: "GIÁM ĐỐC / ĐẠI DIỆN PHÁP LUẬT",

    appendixHeading: "PHỤ LỤC: THÔNG SỐ KỸ THUẬT THIẾT BỊ",
    appendixSubtitle: (quoteNo) =>
      `Kèm theo Báo giá số: ${quoteNo} | Tiêu chuẩn chất lượng chính hãng ${companyConfig.brandName}`,
    specRatedOutput: "Công suất định mức:",
    specVoltageFreq: "Điện áp / Tần số:",
    specPhasePowerFactor: "Số pha / Hệ số:",
    specFuelConsumption: "Nhiên liệu tiêu hao:",
    specFuelTank: "Dung tích bình dầu:",
    specEngine: "Động cơ:",
    specAlternator: "Đầu phát điện:",
    specNoiseLevel: "Độ ồn tiêu chuẩn:",
    specDimensions: "Kích thước (D x R x C):",
    specDryWeight: "Trọng lượng khô:",
    specStandardPower: "Tiêu chuẩn",
    specStandardChassis: "Khung bệ đồng bộ",
    specStandardFuel: "Tiêu chuẩn",

    specTopology: "Công nghệ / Topology:",
    specTopologyDefault: "True Online Double Conversion (DSP Control)",
    specInputOutput: "Điện áp Vào / Ra:",
    specTransferTime: "Thời gian chuyển mạch:",
    specTransferTimeZero: "0 ms (Zero Transfer Time)",
    specBatteryType: "Ắc quy / Lưu điện:",
    specBatteryDefault: "Ắc quy AGM-VRLA chuyên dụng kín khí",

    footerDocument: (quoteNo) =>
      `${companyConfig.brandFullName} - Báo giá #${quoteNo}`,
    footerAppendix: (quoteNo) =>
      `${companyConfig.brandFullName} - Phụ lục Kỹ thuật #${quoteNo}`,
    footerPage: (page, total) => `Trang ${page} / ${total}`,
  },
  en: {
    documentTitle: "EQUIPMENT QUOTATION",
    quoteNumberLabel: "Quotation No.",
    issueDateLabel: "Issue Date",
    validityLabel: "Validity",
    validityDaysUnit: "days",
    validityUntilPrefix: "until",
    hotlineLabel: "Hotline",
    emailLabel: "Email",
    taxIdLabel: "Tax ID",
    websiteLabel: "Website",
    officePrefix: "Office",
    companyName: companyConfig.legalNameEn,
    companyAddress: companyConfig.addresses.headquarters.en,
    bankBranch: companyConfig.bank.branchEn,

    customerSectionTitle: "CUSTOMER",
    attentionLabel: "Attention",
    phoneLabel: "Phone",
    companyLabel: "Company",
    individualCustomer: "Individual Customer",
    deliveryAddressLabel: "Delivery Address",
    defaultDeliveryAddress: "Buyer's jobsite or warehouse",

    itemsSectionTitle: "I. EQUIPMENT SCHEDULE & PRICING DETAILS",
    colIndex: "No.",
    colItemName: "Item Description",
    colModel: "Model Code",
    colUnit: "Unit",
    colQuantity: "Qty",
    colUnitPrice: "Unit Price (VND)",
    colTotalPrice: "Total Amount (VND)",
    discountBadge: (discount, original) =>
      `Incl. ${discount}% discount (Original: ${original})`,
    subtotalLabel: "Subtotal (Excl. VAT):",
    vatLabel: (rate) => `Value Added Tax (VAT ${rate}%):`,
    grandTotalLabel: "GRAND TOTAL AMOUNT:",
    amountInWordsLabel: "In words:",

    termsSectionTitle: "II. COMMERCIAL TERMS & PAYMENT DETAILS",
    termDeliveryTimeLabel: "1. Delivery Schedule:",
    termDeliveryTimeDefault:
      "Within 01 - 03 working days from receipt of advance deposit.",
    termDeliveryLocationLabel: "2. Delivery Location:",
    termDeliveryLocationDefault:
      "Delivered and commissioned at Buyer's designated jobsite.",
    termPaymentScheduleLabel: "3. Payment Terms:",
    termPaymentScheduleDefault:
      "30% advance upon contract signing, 70% prior to official handover.",
    termWarrantyLabel: "4. Warranty Policy:",
    termWarrantyDefault: `12 months or 1,000 running hours official manufacturer warranty under ${companyConfig.brandName} standards.`,
    termTechnicalNotesLabel: "5. Technical Notes:",
    bankBoxTitle: "BANK ACCOUNT DETAILS",
    bankBeneficiaryLabel: "Beneficiary:",
    bankAccountNoLabel: "Account No:",
    bankNameLabel: "Bank:",
    bankMemoLabel: "Reference Memo:",
    bankQrCaption: "Scan VietQR via Mobile Banking for instant deposit payment",

    signBuyerTitle: "BUYER REPRESENTATIVE",
    signBuyerSubtitle: "(Sign, print full name & stamp)",
    signPreparerTitle: "PREPARED BY",
    signPreparerSubtitle: "(Sign & print full name)",
    signPreparerRole: "Sales Specialist",
    signSellerTitle: "SELLER REPRESENTATIVE",
    signSellerRole: "MANAGING DIRECTOR / LEGAL REPRESENTATIVE",

    appendixHeading: "APPENDIX: TECHNICAL SPECIFICATIONS",
    appendixSubtitle: (quoteNo) =>
      `Attached to Quotation No.: ${quoteNo} | Genuine ${companyConfig.brandName} Quality Standards`,
    specRatedOutput: "Rated Output:",
    specVoltageFreq: "Voltage / Frequency:",
    specPhasePowerFactor: "Phase / Power Factor:",
    specFuelConsumption: "Fuel & Consumption:",
    specFuelTank: "Fuel Tank Capacity:",
    specEngine: "Engine:",
    specAlternator: "Alternator:",
    specNoiseLevel: "Noise Level:",
    specDimensions: "Dimensions (L x W x H):",
    specDryWeight: "Dry Weight:",
    specStandardPower: "Standard",
    specStandardChassis: "Integrated skid base",
    specStandardFuel: "Standard",

    specTopology: "Topology / Tech:",
    specTopologyDefault: "True Online Double Conversion (DSP Control)",
    specInputOutput: "Input / Output Voltage:",
    specTransferTime: "Transfer Time:",
    specTransferTimeZero: "0 ms (Zero Transfer Time)",
    specBatteryType: "Battery Type:",
    specBatteryDefault: "Maintenance-Free Sealed AGM-VRLA",

    footerDocument: (quoteNo) =>
      `${companyConfig.brandFullName} - Quotation #${quoteNo}`,
    footerAppendix: (quoteNo) =>
      `${companyConfig.brandFullName} - Technical Appendix #${quoteNo}`,
    footerPage: (page, total) => `Page ${page} of ${total}`,
  },
};

/**
 * Resolves the quotation PDF localization dictionary for the requested locale.
 *
 * @param locale - Supported language code ("vi" | "en")
 * @returns Localized dictionary strings
 */
export function getPdfDictionary(locale?: string | null): QuotePdfDictionary {
  const norm = (locale ?? "vi").toLowerCase();
  if (norm.startsWith("en")) {
    return DICTIONARIES.en;
  }
  return DICTIONARIES.vi;
}
