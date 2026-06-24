import { describe, expect, it, mock } from "bun:test";
import { NextRequest } from "next/server";
import { GET, getBalancedDiv, resolveSuspenseStreaming } from "./route";

// Mock the global fetch function
const originalFetch = global.fetch;

describe("Markdown Converter Helpers", () => {
  describe("getBalancedDiv", () => {
    it("should correctly find balanced div content", () => {
      const html = `<div class="a"><div class="b">nested</div>outside</div>`;
      const result = getBalancedDiv(html, 0);
      expect(result).toBe(html);
    });

    it("should return empty string if target does not start with div", () => {
      const html = `<span>not a div</span>`;
      const result = getBalancedDiv(html, 0);
      expect(result).toBe("");
    });
  });

  describe("resolveSuspenseStreaming", () => {
    it("should resolve basic suspense templates", () => {
      const html = `
        <div id="container">
          <template id="B:0">Loading...</template>
        </div>
        <div hidden id="S:0">
          <p>Real Content</p>
        </div>
      `;
      const result = resolveSuspenseStreaming(html);
      expect(result).toContain("<p>Real Content</p>");
      expect(result).not.toContain("Loading...");
    });

    it("should resolve nested suspense templates bottom-up", () => {
      const html = `
        <main>
          <template id="B:0">Fallback 0</template>
        </main>
        <div hidden id="S:0">
          <div class="layout">
            <template id="B:1">Fallback 1</template>
          </div>
        </div>
        <div hidden id="S:1">
          <div class="products">
            <h1>Nested Real Content</h1>
          </div>
        </div>
      `;
      const result = resolveSuspenseStreaming(html);
      expect(result).toContain("<h1>Nested Real Content</h1>");
      expect(result).not.toContain("Fallback 0");
      expect(result).not.toContain("Fallback 1");
    });
  });
});

describe("Markdown Converter API", () => {
  it("should fetch page HTML, convert it, cache it, and return correct cache headers", async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
          <style>body { color: red; }</style>
        </head>
        <body>
          <main class="content">
            <h1>Hello World</h1>
            <a href="/products">Products</a>
            <img src="/image.png" alt="Test Image" />
          </main>
        </body>
      </html>
    `;

    // Mock fetch to return custom HTML
    // Cast to unknown then typeof fetch to bypass Bun-specific properties on fetch (like preconnect)
    global.fetch = mock(() => {
      return Promise.resolve(
        new Response(mockHtml, {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "text/html" },
        })
      );
    }) as unknown as typeof fetch;

    try {
      // 1. First request (Cache MISS)
      const req1 = new NextRequest("http://localhost:3000/api/markdown-converter?path=/test-page-cache");
      const response1 = await GET(req1);
      expect(response1.status).toBe(200);
      expect(response1.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(response1.headers.get("Cache-Control")).toBe("public, max-age=60, s-maxage=3600, stale-while-revalidate=600");
      expect(response1.headers.get("x-cache")).toBe("MISS");

      const bodyText1 = await response1.text();
      expect(bodyText1).toContain("# Hello World");
      expect(bodyText1).toContain("[Products](http://localhost:3000/products)");

      // 2. Second request (Cache HIT)
      const req2 = new NextRequest("http://localhost:3000/api/markdown-converter?path=/test-page-cache");
      const response2 = await GET(req2);
      expect(response2.status).toBe(200);
      expect(response2.headers.get("x-cache")).toBe("HIT");

      const bodyText2 = await response2.text();
      expect(bodyText2).toBe(bodyText1);
    } finally {
      // Restore original fetch
      global.fetch = originalFetch;
    }
  });

  it("should resolve nested Next.js Suspense streaming templates in the end-to-end flow", async () => {
    const streamedHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <main>
            <template id="B:0">Fallback 0</template>
          </main>
          <div hidden id="S:0">
            <div class="layout">
              <template id="B:1">Fallback 1</template>
            </div>
          </div>
          <div hidden id="S:1">
            <div class="products">
              <h1>Real Products Catalog</h1>
              <a href="/products/hyundai-30cle">Hyundai 30CLE</a>
            </div>
          </div>
        </body>
      </html>
    `;

    global.fetch = mock(() => {
      return Promise.resolve(
        new Response(streamedHtml, {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "text/html" },
        })
      );
    }) as unknown as typeof fetch;

    try {
      const req = new NextRequest("http://localhost:3000/api/markdown-converter?path=/test-suspense");
      const response = await GET(req);
      expect(response.status).toBe(200);

      const bodyText = await response.text();
      
      expect(bodyText).toContain("# Real Products Catalog");
      expect(bodyText).toContain("[Hyundai 30CLE](http://localhost:3000/products/hyundai-30cle)");
      expect(bodyText).not.toContain("Fallback 0");
      expect(bodyText).not.toContain("Fallback 1");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
