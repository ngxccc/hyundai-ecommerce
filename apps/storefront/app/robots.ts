import { siteConfig } from "@/shared/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // disallow: "/private/", // Nếu muốn chặn thư mục nào đó
    },
    sitemap: [
      `${siteConfig.url}/sitemap.xml`, // Sitemap chính do Next.js tự tạo từ file sitemap.ts
    ],
  };
}
