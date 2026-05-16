import { describe, it, expect } from "bun:test";
import fs from "fs";
import path from "path";

describe("Frontend Environment Isolation Boundary", () => {
  it("should strictly prohibit client components from importing server-side env configuration", () => {
    const glob = new Bun.Glob("src/**/*.{ts,tsx}");

    const violations: string[] = [];

    for (const file of glob.scanSync({ absolute: true })) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
        continue;
      }

      const content = fs.readFileSync(file, "utf-8");
      const isClientComponent =
        content.includes('"use client"') || content.includes("'use client'");

      if (isClientComponent) {
        const hasServerEnvImport = content.includes("@nhatnang/database");

        if (hasServerEnvImport) {
          const relativePath = path.relative(process.cwd(), file);
          violations.push(relativePath);
        }
      }
    }

    // TODO: If violations array is not empty, fail the pipeline immediately to block deployment.
    expect(
      violations,
      `Bớ người ta có biến lọt! Phát hiện các Client Components sau đây đang import lén lút từ @nhatnang/database:\n${violations.join("\n")}\n👉 Sửa ngay bằng cách bóc tách logic sang Server Component hoặc Server Actions!`,
    ).toEqual([]);
  });
});
