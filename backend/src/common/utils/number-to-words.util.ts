const VIETNAMESE_DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
] as const;

const SCALE_UNITS = [
  "",
  "nghìn",
  "triệu",
  "tỷ",
  "nghìn tỷ",
  "triệu tỷ",
] as const;

function readThreeDigits(triplet: number, readZeroHundreds: boolean): string {
  const hundreds = Math.floor(triplet / 100);
  const tens = Math.floor((triplet % 100) / 10);
  const ones = triplet % 10;
  const result: string[] = [];

  const hundredsWord = VIETNAMESE_DIGITS[hundreds];
  if ((hundreds > 0 || readZeroHundreds) && hundredsWord) {
    result.push(`${hundredsWord} trăm`);
  }

  if (tens > 1) {
    const tensWord = VIETNAMESE_DIGITS[tens];
    if (tensWord) {
      result.push(`${tensWord} mươi`);
    }
    if (ones === 1) {
      result.push("mốt");
    } else if (ones === 4) {
      result.push("tư");
    } else if (ones === 5) {
      result.push("lăm");
    } else if (ones > 0) {
      const digit = VIETNAMESE_DIGITS[ones];
      if (digit) result.push(digit);
    }
  } else if (tens === 1) {
    result.push("mười");
    if (ones === 1) {
      result.push("một");
    } else if (ones === 5) {
      result.push("lăm");
    } else if (ones > 0) {
      const digit = VIETNAMESE_DIGITS[ones];
      if (digit) result.push(digit);
    }
  } else if (tens === 0 && ones > 0) {
    if (hundreds > 0 || readZeroHundreds) {
      result.push("lẻ");
    }
    const digit = VIETNAMESE_DIGITS[ones];
    if (digit) result.push(digit);
  }

  return result.join(" ");
}

/**
 * Converts a numeric amount in VND to standard Vietnamese words for commercial quotes and contracts.
 *
 * @param amount - Numeric currency value or string number
 * @returns Capitalized Vietnamese representation ending with "đồng chẵn."
 * @example numberToVietnameseWords(55000000) => "Năm mươi lăm triệu đồng chẵn."
 */
export function numberToVietnameseWords(amount: number | string): string {
  const num =
    typeof amount === "string"
      ? Math.round(parseFloat(amount) || 0)
      : Math.round(amount || 0);

  if (num === 0) {
    return "Không đồng chẵn.";
  }

  if (num < 0) {
    return `Âm ${numberToVietnameseWords(Math.abs(num)).toLowerCase()}`;
  }

  const triplets: number[] = [];
  let temp = num;
  while (temp > 0) {
    triplets.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const words: string[] = [];
  for (let i = triplets.length - 1; i >= 0; i--) {
    const triplet = triplets[i];
    if (triplet !== undefined && triplet > 0) {
      const readZeroHundreds = i < triplets.length - 1;
      const tripletText = readThreeDigits(triplet, readZeroHundreds);
      const unit = SCALE_UNITS[i] ?? "";
      if (tripletText) {
        words.push(unit ? `${tripletText} ${unit}` : tripletText);
      }
    }
  }

  const rawSentence = words.join(" ").trim();
  if (!rawSentence) return "Không đồng chẵn.";

  const formatted = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1);
  return `${formatted} đồng chẵn.`;
}
