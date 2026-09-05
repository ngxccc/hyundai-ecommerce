import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
  experimental: {
    createMessagesDeclaration: "./messages/vi.json",
  },
});

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(import.meta.dirname, ".."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.example.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hyundainhatnang.vn" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
    proxyClientMaxBodySize: 20971520,
  },
};

export default withNextIntl(nextConfig);
