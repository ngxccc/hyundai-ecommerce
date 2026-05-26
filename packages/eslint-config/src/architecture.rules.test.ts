import { ESLint } from "eslint";
import { importX } from "eslint-plugin-import-x";
import architectureConfig from "./architecture";
import { describe, expect, it } from "bun:test";

const lintText = async (code: string, filePath: string) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        plugins: {
          "import-x": importX,
        },
      },
      ...architectureConfig,
    ],
  });

  return await eslint.lintText(code, { filePath });
};

describe("architecture config", () => {
  it("blocks private deep import across features", async () => {
    const results = await lintText(
      'import { Header } from "@/features/home/components/Header";\n',
      "apps/storefront/src/features/auth/components/login-form.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("allows import through feature public interface", async () => {
    const results = await lintText(
      'import { Header } from "@/features/home";\n',
      "apps/storefront/src/features/auth/components/login-form.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBe(0);
  });

  it("allows deep feature import from app layer for safe sub-folders like components", async () => {
    const results = await lintText(
      'import {} from "@/features/auth/components/auth-page-shell";\n',
      "apps/storefront/app/[locale]/(auth)/register/page.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBe(0);
  });

  it("allows public barrel import from app layer", async () => {
    const results = await lintText(
      'import { AuthPageShell } from "@/features/auth/components";\n',
      "apps/storefront/app/[locale]/(auth)/register/page.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBe(0);
  });

  it("allows deep feature import from app layer with package-local path", async () => {
    const results = await lintText(
      'import {} from "@/features/auth/components/auth-page-shell";\n',
      "app/[locale]/(auth)/register/page.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBe(0);
  });

  it("blocks barrel self-import in a feature index", async () => {
    const results = await lintText(
      'import "./index";\n',
      "apps/storefront/src/features/home/index.ts",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("allows import from another feature's sub-barrel (e.g. hooks)", async () => {
    const results = await lintText(
      'import { useAdminNav } from "@/features/dashboard/hooks";\n',
      "apps/admin/src/features/products/components/product-header.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    expect(result.messages.length).toBe(0);
  });
});
