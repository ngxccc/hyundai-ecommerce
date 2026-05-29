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
      { protocol: "https", hostname: "hyundainhatnang.vn" },
      { protocol: "https", hostname: "hyundainhatnang.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  transpilePackages: ["@nhatnang/database", "@nhatnang/shared", "@nhatnang/ui"],
};

export default withNextIntl(nextConfig);
