import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, HEAD } from "./route";

interface McpServerCard {
  name: string;
  version: string;
  serverInfo: {
    name: string;
    version: string;
  };
  endpoint: string;
  capabilities: {
    tools: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }[];
    resources: unknown[];
    prompts: unknown[];
  };
}

describe("MCP Server Card Discovery Endpoint", () => {
  it("should return MCP Server Card and correct headers on GET", async () => {
    const req = new NextRequest(
      "http://localhost:3000/.well-known/mcp/server-card.json",
    );
    const response = GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, stale-while-revalidate=3600",
    );

    const data = (await response.json()) as McpServerCard;
    expect(data.name).toBe("hyundai-nhatnang-storefront");
    expect(data.version).toBe("1.0.0");
    expect(data.serverInfo.name).toBe("hyundai-nhatnang-storefront");
    expect(data.serverInfo.version).toBe("1.0.0");
    expect(data.endpoint).toBe("http://localhost:3000/api/mcp");
    expect(data.capabilities.tools[0]?.name).toBe("search_products");
  });

  it("should return correct headers on HEAD", () => {
    const response = HEAD();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, stale-while-revalidate=3600",
    );
  });
});
