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
  name: "Hyundai E-commerce",
  shortName: "Hyundai",
  description:
    "Hệ sinh thái thương mại điện tử mua sắm xe Hyundai chính hãng, phụ tùng và dịch vụ bảo dưỡng đắng cấp dành cho NgocDev và cộng đồng đam mê xe.",
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/opengraph-image.jpg`,
  keywords: [
    "Hyundai",
    "E-commerce",
    "Mua xe ô tô",
    "Phụ tùng chính hãng",
    "Dịch vụ bảo dưỡng",
  ],
  links: {
    twitter: "https://twitter.com/hyundaivn",
    github: "https://github.com/ngocdev/hyundai-ecommerce",
  },
  contact: {
    hotline: "1900 xxxx",
    email: "support@hyundai-ecommerce.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
