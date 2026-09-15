import { env } from "@/env";
import { companyConfig } from "./company";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const siteConfig = {
  name: `${companyConfig.shortName} | Máy Phát Điện Chính Hãng`,
  shortName: companyConfig.shortName,
  description:
    "Đại lý phân phối độc quyền máy phát điện Hyundai chính hãng, bộ lưu điện UPS và giải pháp nguồn điện công nghiệp/dân dụng hàng đầu tại Việt Nam.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/opengraph-image.jpg`,
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
    hotline: companyConfig.hotlines.project.display,
    email: companyConfig.emails.sales,
  },
} as const;

export type SiteConfig = typeof siteConfig;
