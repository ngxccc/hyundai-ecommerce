import { env } from "@/env";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

export const siteConfig = {
  name: "Hyundai Nhật Năng Admin Portal",
  shortName: "Hyundai Nhật Năng",
  description:
    "Hệ thống quản trị thương mại điện tử và phân phối máy phát điện Hyundai chính hãng.",
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
    github: "https://github.com/ngocdev/hyundai-ecommerce",
  },
} as const;

export type SiteConfig = typeof siteConfig;
