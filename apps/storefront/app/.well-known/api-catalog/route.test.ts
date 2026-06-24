import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, HEAD } from "./route";

interface LinksetEntry {
  anchor: string;
  "service-desc": { href: string; type: string }[];
  "service-doc": { href: string; type: string }[];
  status: { href: string; type: string }[];
}

interface CatalogResponse {
  linkset: LinksetEntry[];
}

describe("API Catalog Well-Known Endpoint", () => {
  it("should return linkset JSON and correct headers on GET", async () => {
    const req = new NextRequest("http://localhost:3000/.well-known/api-catalog");
    const response = GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, stale-while-revalidate=600"
    );

    const data = (await response.json()) as CatalogResponse;
    expect(data).toHaveProperty("linkset");
    expect(data.linkset).toBeArray();
    expect(data.linkset[0]).toHaveProperty("anchor", "http://localhost:3000/api");
    expect(data.linkset[0]).toHaveProperty("service-desc");
    expect(data.linkset[0]).toHaveProperty("service-doc");
    expect(data.linkset[0]).toHaveProperty("status");

    expect(data.linkset[0]?.["service-desc"]?.[0]?.href).toBe("http://localhost:3000/openapi.json");
    expect(data.linkset[0]?.["service-doc"]?.[0]?.href).toBe("http://localhost:3000/llms.txt");
    expect(data.linkset[0]?.status?.[0]?.href).toBe("http://localhost:3000/api/health");
  });

  it("should return empty body and correct headers on HEAD", async () => {
    const req = new NextRequest("http://localhost:3000/.well-known/api-catalog");
    const response = HEAD(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'
    );
    expect(response.headers.get("Link")).toBe(
      '<http://localhost:3000/.well-known/api-catalog>; rel="api-catalog"'
    );
    
    const text = await response.text();
    expect(text).toBe("");
  });
});
