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
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hyundainhatnang.vn" },
      { protocol: "https", hostname: "img.vietqr.io" },
      { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
  cacheComponents: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
      "@radix-ui/react-select",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "react-hook-form",
    ],
  },

  logging: {
    browserToTerminal: false,
  },
};

export default withNextIntl(nextConfig);
