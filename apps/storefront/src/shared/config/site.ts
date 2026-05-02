export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const siteConfig = {
  name: "Hyundai Nhật Năng | Máy Phát Điện Chính Hãng",
  shortName: "Hyundai Nhật Năng",
  description:
    "Đại lý phân phối độc quyền máy phát điện Hyundai chính hãng, bộ lưu điện UPS và giải pháp nguồn điện công nghiệp/dân dụng hàng đầu tại Việt Nam.",
  url: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
  ogImage: `${process.env["NEXT_PUBLIC_APP_URL"]}/opengraph-image.jpg`,
  keywords: [
    "Máy phát điện Hyundai",
    "Máy phát điện công nghiệp",
    "Máy phát điện 3 pha",
    "Máy phát điện gia đình",
    "Giải pháp nguồn điện",
    "Bảo trì máy phát điện",
  ],
  links: {
    twitter: "https://twitter.com/hyundainhatnang",
    github: "https://github.com/ngocdev/hyundai-ecommerce",
  },
  contact: {
    hotline: "091 234 5678",
    email: "nhatnang@hyundai.vn",
  },
} as const;

export type SiteConfig = typeof siteConfig;
