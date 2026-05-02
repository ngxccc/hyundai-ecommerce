import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // transpilePackages: ["database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hyundainhatnang.vn" },
      new URL("https://img.plantuml.biz/**"),
    ],
  },
};

export default withMDX(nextConfig);
