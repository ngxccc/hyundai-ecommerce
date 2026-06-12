import { siteConfig } from "@/shared/config/site";
import type { MetadataRoute } from "next";
import { categoryService, productService } from "@/shared/services";
import { cacheLife } from "next/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("days");
  const [categories, productSlugs] = await Promise.all([
    categoryService.getCategories(),
    productService.getStaticProductSlugs(),
  ]);
  const lastModified = new Date();

  // Root pages (Home, Products catalog)
  const staticPaths = [
    { vi: "", en: "/en" },
    { vi: "/products", en: "/en/products" },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add static paths
  for (const path of staticPaths) {
    sitemapEntries.push(
      {
        url: `${siteConfig.url}${path.vi}`,
        lastModified,
        changeFrequency: "daily",
        priority: path.vi === "" ? 1.0 : 0.8,
      },
      {
        url: `${siteConfig.url}${path.en}`,
        lastModified,
        changeFrequency: "daily",
        priority: path.vi === "" ? 1.0 : 0.8,
      }
    );
  }

  // Add dynamic category paths
  for (const cat of categories) {
    sitemapEntries.push(
      {
        url: `${siteConfig.url}/products/category/${cat.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${siteConfig.url}/en/products/category/${cat.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      }
    );
  }

  // Add dynamic product paths
  for (const slug of productSlugs) {
    sitemapEntries.push(
      {
        url: `${siteConfig.url}/products/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${siteConfig.url}/en/products/${slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      }
    );
  }

  return sitemapEntries;
}
