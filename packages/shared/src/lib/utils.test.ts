import { describe, it, expect } from "bun:test";
import { numberToVietnameseWords } from "./utils";

describe("numberToVietnameseWords() Unit Tests", () => {
  describe("Basic & Small Amounts", () => {
    it("should format 0 as Không đồng chẵn.", () => {
      expect(numberToVietnameseWords(0)).toBe("Không đồng chẵn.");
    });

    it("should format small units correctly", () => {
      expect(numberToVietnameseWords(15000)).toBe("Mười lăm nghìn đồng chẵn.");
      expect(numberToVietnameseWords(21000)).toBe("Hai mươi mốt nghìn đồng chẵn.");
      expect(numberToVietnameseWords(24000)).toBe("Hai mươi tư nghìn đồng chẵn.");
    });

    it("should handle zero-hundreds and zero-tens (lẻ)", () => {
      expect(numberToVietnameseWords(104000)).toBe("Một trăm lẻ bốn nghìn đồng chẵn.");
      expect(numberToVietnameseWords(101000)).toBe("Một trăm lẻ một nghìn đồng chẵn.");
    });
  });

  describe("Commercial & Generator Quote Amounts", () => {
    it("should format millions correctly", () => {
      expect(numberToVietnameseWords(55000000)).toBe(
        "Năm mươi lăm triệu đồng chẵn.",
      );
      expect(numberToVietnameseWords(125000000)).toBe(
        "Một trăm hai mươi lăm triệu đồng chẵn.",
      );
      expect(numberToVietnameseWords(350000000)).toBe(
        "Ba trăm năm mươi triệu đồng chẵn.",
      );
    });

    it("should format billions correctly", () => {
      expect(numberToVietnameseWords(1200500000)).toBe(
        "Một tỷ hai trăm triệu năm trăm nghìn đồng chẵn.",
      );
      expect(numberToVietnameseWords(2500000000)).toBe(
        "Hai tỷ năm trăm triệu đồng chẵn.",
      );
    });

    it("should handle numeric strings with decimals", () => {
      expect(numberToVietnameseWords("55000000.00")).toBe(
        "Năm mươi lăm triệu đồng chẵn.",
      );
      expect(numberToVietnameseWords("150000000")).toBe(
        "Một trăm năm mươi triệu đồng chẵn.",
      );
    });
  });
});
