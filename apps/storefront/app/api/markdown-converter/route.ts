import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import TurndownService from "turndown";

interface CacheEntry {
  markdown: string;
  timestamp: number;
}

// In-memory cache for markdown conversion results
const markdownCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Finds the balanced closing </div> tag for a starting <div> tag at startPos.
 * Avoids copying strings to keep performance at O(N) complexity.
 */
export function getBalancedDiv(html: string, startPos: number): string {
  if (!html.substring(startPos).toLowerCase().startsWith("<div")) {
    return "";
  }

  let pos = startPos;
  let depth = 0;
  const n = html.length;
  const lowerHtml = html.toLowerCase();

  while (pos < n) {
    if (lowerHtml.startsWith("<div", pos)) {
      depth++;
      pos += 4;
    } else if (lowerHtml.startsWith("</div>", pos)) {
      depth--;
      pos += 6;
      if (depth === 0) {
        return html.substring(startPos, pos);
      }
    } else {
      pos++;
    }
  }
  return html.substring(startPos);
}

/**
 * Next.js streams Suspense boundaries by sending fallback templates (B:X)
 * and appending resolved content (S:X) at the end of the HTML document.
 * This helper resolves and merges them to reconstruct the fully rendered HTML.
 */
export function resolveSuspenseStreaming(html: string): string {
  let resolvedHtml = html;

  // Extract all unique S:X IDs
  const sIdMatches = Array.from(html.matchAll(/id="S:(\d+)"/g));
  const sIds = Array.from(
    new Set(sIdMatches.map((m) => parseInt(m[1] ?? "0", 10))),
  ).sort((a, b) => b - a); // Sort descending to resolve from leaf to root

  for (const sId of sIds) {
    const sPattern = new RegExp(`<div[^>]*hidden[^>]*id="S:${sId}"[^>]*>`, "i");
    const sMatch = resolvedHtml.match(sPattern);
    if (sMatch?.index === undefined) continue;

    const startPos = sMatch.index;
    const fullDiv = getBalancedDiv(resolvedHtml, startPos);
    if (!fullDiv) continue;

    const firstGt = fullDiv.indexOf(">");
    // Extract inner content inside the <div hidden id="S:X">...</div>
    const innerContent = fullDiv.substring(firstGt + 1, fullDiv.length - 6);

    // Replace the template placeholder <template id="B:X">
    const templatePattern = new RegExp(
      `<template[^>]*id="B:${sId}"[^>]*>([\\s\\S]*?)</template>`,
      "i",
    );
    const templateMatch = resolvedHtml.match(templatePattern);
    if (templateMatch?.index !== undefined) {
      resolvedHtml =
        resolvedHtml.substring(0, templateMatch.index) +
        innerContent +
        resolvedHtml.substring(templateMatch.index + templateMatch[0].length);
    } else {
      // Fallback: replace div placeholder <div id="B:X">
      const divPattern = new RegExp(
        `<div[^>]*id="B:${sId}"[^>]*>([\\s\\S]*?)</div>`,
        "i",
      );
      const divMatch = resolvedHtml.match(divPattern);
      if (divMatch?.index !== undefined) {
        resolvedHtml =
          resolvedHtml.substring(0, divMatch.index) +
          innerContent +
          resolvedHtml.substring(divMatch.index + divMatch[0].length);
      }
    }
  }

  return resolvedHtml;
}

/**
 * Extracts the main content of the HTML page and removes noisy tags
 * like script, style, and comments.
 */
function cleanAndExtractHTML(html: string): string {
  // 1. Remove scripts and styles first
  const cleaned = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // 2. Extract content of <main> or <article> if available
  const mainMatch = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(cleaned);
  if (mainMatch?.[1]) {
    return mainMatch[1];
  }

  const articleMatch = /<article[^>]*>([\s\S]*?)<\/article>/i.exec(cleaned);
  if (articleMatch?.[1]) {
    return articleMatch[1];
  }

  // Fallback to body content
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(cleaned);
  if (bodyMatch?.[1]) {
    return bodyMatch[1];
  }

  return cleaned;
}

export async function GET(request: NextRequest) {
  const targetPath =
    request.headers.get("x-markdown-path") ??
    request.nextUrl.searchParams.get("path");

  if (!targetPath) {
    return new NextResponse("Missing path parameter", { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const cacheKey = `${origin}:${targetPath}`;
  const now = Date.now();

  // Check in-memory cache first
  const cached = markdownCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return new NextResponse(cached.markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": Math.round(cached.markdown.length / 4).toString(),
        "Cache-Control":
          "public, max-age=60, s-maxage=3600, stale-while-revalidate=600",
        "x-cache": "HIT",
      },
    });
  }

  try {
    // 1. Construct the internal URL to fetch the original HTML page
    const targetUrl = new URL(targetPath, origin);

    // Request text/html and force fresh fetch of the underlying page
    const response = await fetch(targetUrl.toString(), {
      headers: {
        Accept: "text/html",
        "x-internal-fetch": "true",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(
        `Failed to fetch target page: ${response.statusText}`,
        {
          status: response.status,
        },
      );
    }

    const htmlContent = await response.text();

    // 2. Resolve Next.js Suspense streaming templates before extraction
    const fullyRenderedHtml = resolveSuspenseStreaming(htmlContent);

    // 3. Extract and clean the HTML content to avoid headers/footers/scripts noise
    const cleanedHtml = cleanAndExtractHTML(fullyRenderedHtml);

    // 4. Convert HTML to Markdown using Turndown
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    let markdown = turndownService.turndown(cleanedHtml);

    // Resolve relative links and images to absolute URLs
    markdown = markdown.replace(/\]\(\/(?!\/)/g, `](${origin}/`);

    // 5. Cache the result
    markdownCache.set(cacheKey, {
      markdown,
      timestamp: now,
    });

    // 6. Return the markdown response
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": Math.round(markdown.length / 4).toString(),
        "Cache-Control":
          "public, max-age=60, s-maxage=3600, stale-while-revalidate=600",
        "x-cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error converting HTML to Markdown:", error);
    return new NextResponse("Internal Server Error during conversion", {
      status: 500,
    });
  }
}
