import { ESLint } from "eslint";
import nextConfig from "./next";
import { describe, expect, it } from "bun:test";

const lintText = async (code: string, filePath: string) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        settings: {
          react: {
            version: "detect",
          },
        },
      },
      ...nextConfig,
    ],
  });

  return await eslint.lintText(code, { filePath });
};

describe("next config rules", () => {
  it("blocks the usage of normal <img> tag", async () => {
    const results = await lintText(
      'export default function Page() { return <img src="test.png" alt="test" />; }\n',
      "app/page.tsx",
    );

    const result = results[0];
    if (!result) throw new Error("Expected ESLint to return one lint result");

    const hasError = result.messages.some(
      (m) => m.ruleId === "@next/next/no-img-element",
    );
    expect(hasError).toBe(true);
  });
});
