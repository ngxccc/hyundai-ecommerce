/**
 * Single Source of Truth (SSOT) for Company & Business Metadata.
 * Used across Admin Dashboard, PDF Quotes, Exports, and Settings.
 */
export const companyConfig = {
  // Legal entity info
  legalNameVi: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
  legalNameEn: "NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD",
  shortName: "Hyundai Nhật Năng",
  brandName: "Hyundai",
  brandTitle: "HYUNDAI POWER PRODUCTS",
  brandFullName: "Hyundai Power Products Vietnam",
  taxId: "0316447814",

  // Direct contact channels
  hotlines: {
    project: {
      raw: "0901497771",
      display: "0901 49 7771",
      labelVi: "Dự án & Báo giá B2B",
      labelEn: "B2B Projects & Quotation",
    },
    technical: {
      raw: "0982890698",
      display: "0982 89 0698",
      labelVi: "Hỗ trợ Kỹ thuật 24/7",
      labelEn: "24/7 Technical Support",
    },
    general: {
      raw: "0901497771",
      display: "0901 49 7771",
    },
  },

  // Official corporate emails
  emails: {
    sales: "sales@hyundainhatnang.vn",
    project: "duan@hyundainhatnang.com",
    support: "hyundaipowerproducts.vn@gmail.com",
    general: "contact@hyundainhatnang.vn",
  },

  // Operating locations
  addresses: {
    headquarters: {
      vi: "310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. Hồ Chí Minh",
      en: "310/61 Chien Luoc Street, Binh Tri Dong A Ward, Binh Tan District, HCMC, Vietnam",
    },
    warehouse: {
      vi: "Tổng kho KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương",
      en: "Song Than 2 Industrial Park Central Warehouse, Di An City, Binh Duong Province",
    },
  },

  // Working schedule
  workingHours: {
    vi: "Thứ 2 - Thứ 7: 08:00 - 17:30 (Kỹ thuật hỗ trợ 24/7)",
    en: "Mon - Sat: 08:00 - 17:30 (24/7 Technical Support)",
  },

  // Web & Social media endpoints
  links: {
    website: "https://hyundainhatnang.vn",
    zalo: "https://zalo.me/0901497771",
    facebook: "https://facebook.com/hyundainhatnang",
  },

  // Official banking details for invoices & quotations
  bank: {
    bankName: "VietinBank",
    branchVi: "Chi nhánh Tây Sài Gòn",
    branchEn: "Tay Sai Gon Branch",
    accountNo: "113002859999",
    accountName: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
    bin: "vietinbank",
    qrTemplate: "qr_only",
  },
} as const;

export type CompanyConfig = typeof companyConfig;
