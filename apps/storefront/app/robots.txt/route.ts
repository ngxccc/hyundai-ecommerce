import { siteConfig } from "@/shared/config/site";
import { NextResponse } from "next/server";

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Content-Signal: ai-train=no, search=yes, ai-input=yes

Sitemap: ${siteConfig.url}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
