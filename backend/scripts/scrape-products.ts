import { parseArgs } from "node:util";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

interface ScrapedProduct {
  name: string;
  slug: string;
  url: string;
  price: string;
  priceRaw: number;
  category: string;
  productType: "generator" | "ups";
  brand: string;
  powerKva: string;
  powerKw: string;
  phase: "1phase" | "3phase";
  voltage: string;
  frequency: number;
  fuelType?: "diesel" | "gasoline";
  canopyType?: "silent" | "open_frame";
  startMethod?: "electric" | "recoil";
  pdfCatalogUrl: string | null;
  images: string[];
  specs: Record<string, string>;
  translations: [
    {
      locale: "vi";
      name: string;
      shortDescription: string | null;
      description: Record<string, unknown>;
    },
    {
      locale: "en";
      name: string;
      shortDescription: string | null;
      description: Record<string, unknown>;
    },
  ];
}

const SITEMAP_URL = "https://hyundainhatnang.com/product-sitemap.xml";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * Fetches and parses all product URLs from the WordPress product sitemap.
 */
async function fetchProductUrls(): Promise<string[]> {
  console.log(
    `\x1b[36m[SITEMAP]\x1b[0m Fetching sitemap from ${SITEMAP_URL}...`,
  );
  const response = await fetch(SITEMAP_URL, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${String(response.status)}`);
  }

  const xml = await response.text();
  const matches = [
    ...xml.matchAll(
      /<loc>(https:\/\/hyundainhatnang\.com\/product\/[^<]+)<\/loc>/g,
    ),
  ];
  const urls = matches
    .map((m) => m[1])
    .filter((url): url is string => Boolean(url));

  console.log(
    `\x1b[32m[FOUND]\x1b[0m Discovered ${String(urls.length)} product URLs in sitemap.`,
  );
  return urls;
}

/**
 * Parses technical specifications, images, and catalog PDFs from a single product page.
 */
async function scrapeProductPage(url: string): Promise<ScrapedProduct | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      console.warn(
        `\x1b[33m[SKIP]\x1b[0m ${url} (HTTP ${String(response.status)})`,
      );
      return null;
    }

    const html = await response.text();

    // 1. Basic Metadata
    const ogTitle = /<meta property="og:title" content="([^"]+)"/.exec(
      html,
    )?.[1];
    const headerTitle =
      /<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i
        .exec(html)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .trim();
    const rawTitle = ogTitle ?? headerTitle ?? "";

    const cleanTitle = rawTitle.replace(/\s+/g, " ").trim();
    if (!cleanTitle) return null;

    const slug = url.replace(/.*\/product\//, "").replace(/\/$/, "");

    // 2. Price
    const priceAmount =
      /<meta property="product:price:amount" content="([^"]+)"/.exec(html)?.[1];
    const rawPrice = priceAmount ? Number.parseFloat(priceAmount) : 0;
    const priceString = rawPrice > 0 ? `${String(rawPrice)}.00` : "0.00";

    // 3. Category
    const categoryMatch = /rel="tag">([^<]+)<\/a>/i.exec(html);
    const category = categoryMatch?.[1]
      ? categoryMatch[1].trim()
      : "Máy phát điện";

    // 4. PDF Catalog Link
    const pdfUrl =
      /href="([^"]+\.pdf)"/i.exec(html)?.[1] ??
      /<a[^>]*href="([^"]+)"[^>]*Catalogue/i.exec(html)?.[1] ??
      null;

    // 5. Images
    const mainOgImage = /<meta property="og:image" content="([^"]+)"/.exec(
      html,
    )?.[1];
    const galleryMatches = [
      ...html.matchAll(
        /https:\/\/hyundainhatnang\.com\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi,
      ),
    ].map((m) => m[0]);

    const filteredImages = [...new Set([mainOgImage, ...galleryMatches])]
      .filter((img): img is string => Boolean(img))
      .filter(
        (img) =>
          !img.includes("LOGO") &&
          !img.includes("icon-") &&
          !img.includes("300X77") &&
          !img.includes("100x100") &&
          !img.includes("Khuyen-mai") &&
          !img.includes("Tu-van"),
      )
      .slice(0, 5);

    // 6. Specification Table
    const specs: Record<string, string> = {};
    const tableRows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

    for (const row of tableRows) {
      const rowContent = row[1] ?? "";
      const cells = [
        ...rowContent.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi),
      ].map((c) =>
        (c[1] ?? "")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim(),
      );

      const key = cells[0];
      const val = cells[1];
      if (key && val && key.length < 100) {
        specs[key] = val;
      }
    }

    // 7. Power & Attributes Inference
    const lowerTitle = cleanTitle.toLowerCase();
    const isUps =
      lowerTitle.includes("ups") ||
      lowerTitle.includes("lưu điện") ||
      category.toLowerCase().includes("ups");
    const productType: "generator" | "ups" = isUps ? "ups" : "generator";

    // Power inference (kVA / kW)
    let powerKva = "5.00";
    let powerKw = "5.00";

    const titleKvaMatch = /(\d+(?:\.\d+)?)\s*kva/i.exec(cleanTitle);
    const specKvaMatch =
      specs["Công suất liên tục (KVA)"]?.match(/(\d+(?:\.\d+)?)/);
    const kvaMatch = titleKvaMatch ?? specKvaMatch;

    const titleKwMatch = /(\d+(?:\.\d+)?)\s*kw/i.exec(cleanTitle);
    const specKwMatch =
      specs["Công suất liên tục (KW)"]?.match(/(\d+(?:\.\d+)?)/);
    const kwMatch = titleKwMatch ?? specKwMatch;

    const kvaStr = kvaMatch?.[1];
    const kwStr = kwMatch?.[1];

    if (kvaStr) {
      powerKva = Number.parseFloat(kvaStr).toFixed(2);
      powerKw = kwStr
        ? Number.parseFloat(kwStr).toFixed(2)
        : (Number.parseFloat(kvaStr) * 0.8).toFixed(2);
    } else if (kwStr) {
      powerKw = Number.parseFloat(kwStr).toFixed(2);
      powerKva = (Number.parseFloat(kwStr) / 0.8).toFixed(2);
    }

    // Phase inference
    const is3Phase =
      lowerTitle.includes("3 pha") ||
      lowerTitle.includes("3pha") ||
      Boolean(specs["Số pha"]?.includes("3"));
    const phase: "1phase" | "3phase" = is3Phase ? "3phase" : "1phase";

    // Fuel inference
    const isDiesel =
      lowerTitle.includes("dầu") ||
      lowerTitle.includes("diesel") ||
      lowerTitle.includes("dhy");
    const fuelType: "diesel" | "gasoline" = isDiesel ? "diesel" : "gasoline";

    const isSilent =
      lowerTitle.includes("chống ồn") ||
      lowerTitle.includes("công nghiệp") ||
      lowerTitle.includes("se");
    const canopyType: "silent" | "open_frame" = isSilent
      ? "silent"
      : "open_frame";

    return {
      name: cleanTitle,
      slug,
      url,
      price: priceString,
      priceRaw: rawPrice,
      category,
      productType,
      brand: "Hyundai",
      powerKva,
      powerKw,
      phase,
      voltage: is3Phase ? "380V" : "220V",
      frequency: 50,
      fuelType: productType === "generator" ? fuelType : undefined,
      canopyType: productType === "generator" ? canopyType : undefined,
      startMethod: "electric",
      pdfCatalogUrl: pdfUrl,
      images: filteredImages,
      specs,
      translations: [
        {
          locale: "vi",
          name: cleanTitle,
          shortDescription: specs["Model"]
            ? `Model chính hãng ${specs["Model"]} phân phối bởi Hyundai Nhật Năng`
            : null,
          description: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `Sản phẩm ${cleanTitle} nhập khẩu chính hãng bảo hành từ 1 đến 3 năm.`,
                  },
                ],
              },
            ],
          },
        },
        {
          locale: "en",
          name: cleanTitle,
          shortDescription: null,
          description: { type: "doc", content: [] },
        },
      ],
    };
  } catch (error) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Failed to parse ${url}:`, error);
    return null;
  }
}

/**
 * Downloads PDF files if requested.
 */
async function downloadPdf(
  pdfUrl: string,
  destFolder: string,
  filename: string,
): Promise<string | null> {
  try {
    const response = await fetch(pdfUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const destPath = join(destFolder, filename);
    await Bun.write(destPath, buffer);
    return destPath;
  } catch {
    return null;
  }
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      limit: {
        type: "string",
        short: "l",
        default: "15",
      },
      output: {
        type: "string",
        short: "o",
        default: "./data/scraped-hyundai-products.json",
      },
      "download-pdfs": {
        type: "boolean",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
    },
    allowPositionals: false,
    strict: false,
  });

  if (values.help) {
    console.log(`
\x1b[1mHyundai Nhật Năng Web Scraper & Catalog Extractor\x1b[0m

Options:
  -l, --limit <number|all>    Number of products to scrape (default: 15, pass 'all' for entire site)
  -o, --output <path>         Output JSON file path (default: ./data/scraped-hyundai-products.json)
      --download-pdfs         Download PDF catalogues to ./data/catalogues/
  -h, --help                  Show this help menu

Examples:
  # Quick test: Scrape 5 products
  bun scripts/scrape-products.ts -l 5

  # Scrape all products with PDF downloads:
  bun scripts/scrape-products.ts -l all --download-pdfs
`);
    process.exit(0);
  }

  const limitParam = (values.limit as string | undefined) ?? "15";
  const outputPath =
    (values.output as string | undefined) ??
    "./data/scraped-hyundai-products.json";
  const shouldDownloadPdfs = Boolean(values["download-pdfs"]);

  const allUrls = await fetchProductUrls();
  const targetUrls =
    limitParam === "all"
      ? allUrls
      : allUrls.slice(0, Number.parseInt(limitParam, 10) || 15);

  console.log(
    `\n\x1b[36m[START]\x1b[0m Scraping ${String(targetUrls.length)} products with concurrency...\n`,
  );

  const pdfDir = "./data/catalogues";
  if (shouldDownloadPdfs) {
    await mkdir(pdfDir, { recursive: true });
  }

  const results: ScrapedProduct[] = [];
  const CONCURRENCY = 4;

  for (let i = 0; i < targetUrls.length; i += CONCURRENCY) {
    const chunk = targetUrls.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map((url) => scrapeProductPage(url)),
    );

    for (const item of chunkResults) {
      if (item) {
        results.push(item);
        console.log(
          `\x1b[32m✔\x1b[0m [${String(results.length)}/${String(targetUrls.length)}] ${item.name.slice(0, 50)}... (${item.priceRaw ? `${item.priceRaw.toLocaleString("vi-VN")} đ` : "Liên hệ"})`,
        );

        if (shouldDownloadPdfs && item.pdfCatalogUrl) {
          const pdfFileName = `${item.slug}.pdf`;
          const downloaded = await downloadPdf(
            item.pdfCatalogUrl,
            pdfDir,
            pdfFileName,
          );
          if (downloaded) {
            console.log(`   \x1b[35m📥 PDF:\x1b[0m ${pdfFileName}`);
          }
        }
      }
    }
  }

  // Ensure output directory exists and write JSON
  const outputDir = join(outputPath, "..");
  await mkdir(outputDir, { recursive: true });
  await Bun.write(outputPath, JSON.stringify(results, null, 2));

  console.log(
    `\n\x1b[32m[COMPLETED]\x1b[0m Scraped ${String(results.length)} products successfully!`,
  );
  console.log(`📁 Saved to: \x1b[1m${outputPath}\x1b[0m\n`);
}

await main();
