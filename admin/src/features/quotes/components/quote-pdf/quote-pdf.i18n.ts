import type { AdminCompanySettings } from "@/types/api";

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
  companyBrandTitle: string;
  companyAddress: string;
  companyHotline: string;
  companyEmail: string;
  companyTaxId: string;
  companyWebsite: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankAccountName: string;
  bankBin: string;
  bankQrTemplate: string;

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

/**
 * Resolves the quotation PDF localization dictionary for the requested locale and company configuration.
 *
 * @param locale - Supported language code ("vi" | "en")
 * @param company - Dynamic company configuration from database
 * @returns Localized dictionary strings
 */
export function getPdfDictionary(
  locale: string | null | undefined,
  company: AdminCompanySettings,
): QuotePdfDictionary {
  const comp = company;
  const norm = (locale ?? "vi").toLowerCase();
  const isEn = norm.startsWith("en");

  if (isEn) {
    return {
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
      companyName: comp.legalNameEn,
      companyBrandTitle: comp.brandTitle,
      companyAddress: comp.addresses.headquarters.en,
      companyHotline: comp.hotlines.project.display,
      companyEmail: comp.emails.support,
      companyTaxId: comp.taxId,
      companyWebsite: comp.links.website,
      bankName: comp.bank.bankName,
      bankBranch: comp.bank.branchEn ?? "",
      bankAccountNo: comp.bank.accountNo,
      bankAccountName: comp.bank.accountName,
      bankBin: comp.bank.bin,
      bankQrTemplate: comp.bank.qrTemplate,

      customerSectionTitle: "CUSTOMER",
      attentionLabel: "Attention",
      phoneLabel: "Phone",
      companyLabel: "Company",
      individualCustomer: "Retail Customer",
      deliveryAddressLabel: "Delivery Location",
      defaultDeliveryAddress: "Buyer's designated warehouse or project site",

      itemsSectionTitle: "I. EQUIPMENT LIST & PRICING DETAILS",
      colIndex: "#",
      colItemName: "Item Description",
      colModel: "Model",
      colUnit: "Unit",
      colQuantity: "Qty",
      colUnitPrice: "Unit Price (VND)",
      colTotalPrice: "Total Price (VND)",
      discountBadge: (discount, original) =>
        `Incl. ${discount}% Disc. (List: ${original})`,
      subtotalLabel: "Subtotal before VAT:",
      vatLabel: (rate) => `Value Added Tax (VAT ${rate}%):`,
      grandTotalLabel: "GRAND TOTAL AMOUNT:",
      amountInWordsLabel: "Amount in words:",

      termsSectionTitle: "II. COMMERCIAL TERMS & PAYMENT DETAILS",
      termDeliveryTimeLabel: "1. Delivery Lead Time:",
      termDeliveryTimeDefault:
        "Within 01 - 03 business days upon initial deposit receipt.",
      termDeliveryLocationLabel: "2. Delivery & Commissioning:",
      termDeliveryLocationDefault:
        "Delivered and commissioned on-site at Buyer's location.",
      termPaymentScheduleLabel: "3. Payment Milestones:",
      termPaymentScheduleDefault:
        "30% initial contract deposit, 70% remaining balance prior to handover.",
      termWarrantyLabel: "4. Warranty Policy:",
      termWarrantyDefault: `12 months or 1,000 running hours official manufacturer warranty under ${comp.brandName} standards.`,
      termTechnicalNotesLabel: "5. Technical Notes:",
      bankBoxTitle: "BANK ACCOUNT DETAILS",
      bankBeneficiaryLabel: "Beneficiary:",
      bankAccountNoLabel: "Account No.:",
      bankNameLabel: "Bank:",
      bankMemoLabel: "Memo:",
      bankQrCaption:
        "Scan VietQR with any mobile banking app for instant deposit transfer",

      signBuyerTitle: "BUYER REPRESENTATIVE",
      signBuyerSubtitle: "(Signature, Full Name & Company Stamp)",
      signPreparerTitle: "QUOTATION PREPARER",
      signPreparerSubtitle: "(Signature & Full Name)",
      signPreparerRole: "Commercial Executive",
      signSellerTitle: "SELLER REPRESENTATIVE",
      signSellerRole: "MANAGING DIRECTOR / LEGAL REPRESENTATIVE",

      appendixHeading: "APPENDIX: TECHNICAL SPECIFICATIONS",
      appendixSubtitle: (quoteNo) =>
        `Attached to Quotation No.: ${quoteNo} | Genuine ${comp.brandName} Quality Standards`,
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
        `${comp.brandFullName} - Quotation #${quoteNo}`,
      footerAppendix: (quoteNo) =>
        `${comp.brandFullName} - Technical Appendix #${quoteNo}`,
      footerPage: (page, total) => `Page ${page} of ${total}`,
    };
  }

  return {
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
    companyName: comp.legalNameVi,
    companyBrandTitle: comp.brandTitle,
    companyAddress: comp.addresses.headquarters.vi,
    companyHotline: comp.hotlines.project.display,
    companyEmail: comp.emails.support,
    companyTaxId: comp.taxId,
    companyWebsite: comp.links.website,
    bankName: comp.bank.bankName,
    bankBranch: comp.bank.branchVi ?? "",
    bankAccountNo: comp.bank.accountNo,
    bankAccountName: comp.bank.accountName,
    bankBin: comp.bank.bin,
    bankQrTemplate: comp.bank.qrTemplate,

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
    colModel: "Model",
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
    termWarrantyDefault: `Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy theo tiêu chuẩn ${comp.brandName}.`,
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
      `Kèm theo Báo giá số: ${quoteNo} | Tiêu chuẩn chất lượng chính hãng ${comp.brandName}`,
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

    footerDocument: (quoteNo) => `${comp.brandFullName} - Báo giá #${quoteNo}`,
    footerAppendix: (quoteNo) =>
      `${comp.brandFullName} - Phụ lục Kỹ thuật #${quoteNo}`,
    footerPage: (page, total) => `Trang ${page} / ${total}`,
  };
}
