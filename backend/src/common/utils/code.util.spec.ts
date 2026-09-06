import { describe, expect, it } from "bun:test";
import { generateDocumentCode } from "./code.util";

describe("generateDocumentCode", () => {
  it("should generate a code with the expected prefix and format", () => {
    const code = generateDocumentCode("RFQ");
    expect(code).toMatch(/^RFQ-\d{8}-[A-Z0-9]{12}$/);
    expect(code.length).toBe(25);
  });

  it("should generate distinct codes on consecutive invocations without collision", () => {
    const generated = new Set<string>();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      generated.add(generateDocumentCode("ORD"));
    }
    expect(generated.size).toBe(count);
  });
});
