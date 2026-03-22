export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL}`;
  }

  // Fallback về system environment của Vercel (khi tạo preview URL)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
};

export const siteConfig = {
  name: "Hyundai Nhật Năng | Máy Phát Điện Chính Hãng",
  shortName: "Hyundai Nhật Năng",
  description:
    "Đại lý phân phối độc quyền máy phát điện Hyundai chính hãng, bộ lưu điện UPS và giải pháp nguồn điện công nghiệp/dân dụng hàng đầu tại Việt Nam.",
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/opengraph-image.jpg`,
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
