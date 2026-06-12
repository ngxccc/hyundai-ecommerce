// Throws fatal error if environment is invalid, halting the build immediately
import "@nhatnang/database/env";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
  experimental: {
    createMessagesDeclaration: "./messages/vi.json",
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hyundainhatnang.vn" },
    ],
  },

  transpilePackages: ["@nhatnang/database", "@nhatnang/shared", "@nhatnang/ui"],

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
    browserToTerminal: true,
  },
};

export default withNextIntl(nextConfig);
