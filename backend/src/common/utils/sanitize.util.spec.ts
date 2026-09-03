import { describe, expect, it } from "bun:test";
import { sanitizeString } from "./sanitize.util";

describe("Sanitize Utilities", () => {
  describe("sanitizeString", () => {
    it("should strip all HTML tags when input string contains markup", () => {
      const dirty = "<script>alert('XSS')</script>Hello <b>World</b>";
      const clean = sanitizeString(dirty);
      expect(clean).toBe("Hello World");
    });

    it("should trim surrounding whitespace when input string contains extra padding", () => {
      const input = "   <b>Clean Text</b>   ";
      const clean = sanitizeString(input);
      expect(clean).toBe("Clean Text");
    });

    it("should pass value through untouched when input is not a string", () => {
      expect(sanitizeString(123)).toBe(123);
      expect(sanitizeString(null)).toBeNull();
      expect(sanitizeString(undefined)).toBeUndefined();
      expect(sanitizeString({ key: "value" })).toEqual({ key: "value" });
    });
  });
});
