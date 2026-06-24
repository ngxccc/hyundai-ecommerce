import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, HEAD } from "./route";

interface OidcConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  grant_types_supported: string[];
}

describe("OIDC Configuration Discovery Endpoint", () => {
  it("should return OIDC config and correct headers on GET", async () => {
    const req = new NextRequest(
      "http://localhost:3000/.well-known/openid-configuration",
    );
    const response = GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, stale-while-revalidate=3600",
    );

    const data = (await response.json()) as OidcConfig;
    expect(data.issuer).toBe("http://localhost:3000");
    expect(data.authorization_endpoint).toBe(
      "http://localhost:3000/api/auth/oauth/authorize",
    );
    expect(data.token_endpoint).toBe(
      "http://localhost:3000/api/auth/oauth/token",
    );
    expect(data.jwks_uri).toBe("http://localhost:3000/api/auth/jwks");
    expect(data.response_types_supported).toEqual(["code", "token", "id_token"]);
    expect(data.grant_types_supported).toEqual([
      "authorization_code",
      "client_credentials",
    ]);
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
