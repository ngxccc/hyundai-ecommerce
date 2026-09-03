import { describe, expect, it } from "bun:test";
import { isPostgresErrorCode } from "./error.util";

describe("isPostgresErrorCode", () => {
  it("should return true when error is an object with matching code string", () => {
    const error = { code: "23505", detail: "Key already exists" };
    expect(isPostgresErrorCode(error, "23505")).toBe(true);
  });

  it("should return true when error has a cause object with matching code string (Drizzle wrapped)", () => {
    const error = {
      name: "DrizzleQueryError",
      cause: { code: "23P01", detail: "Exclusion violation" },
    };
    expect(isPostgresErrorCode(error, "23P01")).toBe(true);
  });

  it("should return false when error code does not match target code", () => {
    const error = { code: "23503" };
    expect(isPostgresErrorCode(error, "23505")).toBe(false);
  });

  it("should return false when error is primitive, null, or undefined", () => {
    expect(isPostgresErrorCode(null, "23505")).toBe(false);
    expect(isPostgresErrorCode(undefined, "23505")).toBe(false);
    expect(isPostgresErrorCode("23505", "23505")).toBe(false);
    expect(isPostgresErrorCode(123, "23505")).toBe(false);
  });

  it("should return false when error is an object without code property or code is not a string", () => {
    expect(isPostgresErrorCode({}, "23505")).toBe(false);
    expect(isPostgresErrorCode({ code: 23505 }, "23505")).toBe(false);
  });
});
