import { describe, expect, test } from "bun:test";
import { numberToVietnameseWords } from "./number-to-words.util";

describe("numberToVietnameseWords", () => {
  describe("numberToVietnameseWords()", () => {
    describe("when amount is zero", () => {
      test("should return Không đồng chẵn.", () => {
        expect(numberToVietnameseWords(0)).toBe("Không đồng chẵn.");
      });
    });

    describe("when amount is negative", () => {
      test("should prefix with Âm", () => {
        expect(numberToVietnameseWords(-15000)).toBe(
          "Âm mười lăm nghìn đồng chẵn.",
        );
      });
    });

    describe("when formatting small and medium values", () => {
      test("should format thousands and millions with standard Vietnamese conventions", () => {
        expect(numberToVietnameseWords(15000)).toBe(
          "Mười lăm nghìn đồng chẵn.",
        );
        expect(numberToVietnameseWords(21000)).toBe(
          "Hai mươi mốt nghìn đồng chẵn.",
        );
        expect(numberToVietnameseWords(24000)).toBe(
          "Hai mươi tư nghìn đồng chẵn.",
        );
        expect(numberToVietnameseWords(104000)).toBe(
          "Một trăm lẻ bốn nghìn đồng chẵn.",
        );
        expect(numberToVietnameseWords(55000000)).toBe(
          "Năm mươi lăm triệu đồng chẵn.",
        );
        expect(numberToVietnameseWords(125000000)).toBe(
          "Một trăm hai mươi lăm triệu đồng chẵn.",
        );
      });
    });

    describe("when formatting billions and numeric strings", () => {
      test("should format billions and handle string inputs correctly", () => {
        expect(numberToVietnameseWords(1200500000)).toBe(
          "Một tỷ hai trăm triệu năm trăm nghìn đồng chẵn.",
        );
        expect(numberToVietnameseWords("55000000.00")).toBe(
          "Năm mươi lăm triệu đồng chẵn.",
        );
      });
    });
  });
});
