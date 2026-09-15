/**
 * Single Source of Truth (SSOT) for Company & Corporate Identity.
 * Used for Excel Export, PDF generation, Email notifications, and Official Documents.
 */
export const companyConfig = {
  // Legal entity info
  legalNameVi: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG",
  legalNameEn: "NHAT NANG TECHNOLOGY EQUIPMENT CO., LTD",
  shortName: "Hyundai Nhật Năng",
  brandName: "Hyundai Power Products",
  taxId: "0316447814",

  // Contact channels
  hotlines: {
    project: {
      raw: "0901497771",
      display: "0901 49 7771",
      formatted: "0901.49.7771",
    },
    technical: {
      raw: "0982890698",
      display: "0982 89 0698",
      formatted: "0982.89.0698",
    },
  },

  // Corporate emails
  emails: {
    sales: "sales@hyundainhatnang.vn",
    project: "duan@hyundainhatnang.com",
    support: "hyundaipowerproducts.vn@gmail.com",
    general: "contact@hyundainhatnang.vn",
  },

  // Operating locations
  addresses: {
    headquarters: {
      vi: "310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. HCM",
      en: "310/61 Chien Luoc Street, Binh Tri Dong A Ward, Binh Tan District, HCMC",
    },
    warehouse: {
      vi: "Tổng kho KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương",
      en: "Song Than 2 Industrial Park Central Warehouse, Di An City, Binh Duong Province",
    },
  },

  // Website & Online portal
  links: {
    website: "https://hyundainhatnang.vn",
  },
} as const;

export type CompanyConfig = typeof companyConfig;
