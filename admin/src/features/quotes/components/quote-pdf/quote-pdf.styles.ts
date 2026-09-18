import { StyleSheet, Font } from "@react-pdf/renderer";

// Register Unicode-supported fonts for Vietnamese diacritics
Font.register({
  family: "NotoSans",
  fonts: [
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Regular.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-400-normal.ttf",
      fontWeight: "normal",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Bold.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-700-normal.ttf",
      fontWeight: "bold",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-Italic.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-400-italic.ttf",
      fontStyle: "italic",
    },
    {
      src:
        typeof window !== "undefined"
          ? `${window.location.origin}/fonts/NotoSans-BoldItalic.ttf`
          : "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/vietnamese-700-italic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// Custom hyphenation: allow wrapping on hyphens, slashes, or excessively long words
// while preserving Vietnamese words, numbers, and currency strings intact.
Font.registerHyphenationCallback((word) => {
  if (word.includes("-") || word.includes("_") || word.includes("/")) {
    const parts = word.split(/([-_/])/);
    const result: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const part = parts[i] ?? "";
      const delim = parts[i + 1] ?? "";
      if (part || delim) {
        result.push(part + delim);
      }
    }
    return result.filter(Boolean);
  }
  if (word.length > 16) {
    const chunks = word.match(/.{1,12}/g);
    if (chunks) return chunks;
  }
  return [word];
});

export const NAVY = "#002C6C";
export const TEXT_DARK = "#0F172A";
export const TEXT_MUTED = "#475569";
export const BORDER_COLOR = "#CBD5E1";
export const BG_HEADER = "#F1F5F9";
export const BG_ZEBRA = "#F8FAFC";

export const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 8.5,
    lineHeight: 1.35,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 28,
    color: TEXT_DARK,
    backgroundColor: "#FFFFFF",
  },

  // Header Corporate Block
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 8,
    marginBottom: 8,
  },
  logoSection: {
    width: "58%",
  },
  companyBrand: {
    fontSize: 12,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  companyName: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: TEXT_DARK,
    marginTop: 2,
    textTransform: "uppercase",
  },
  companyDetails: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 1.3,
  },
  companyHighlight: {
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  documentMetaRight: {
    width: "40%",
    alignItems: "flex-end",
    textAlign: "right",
  },
  documentTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    textAlign: "right",
    marginBottom: 4,
  },
  metaItem: {
    fontSize: 7.8,
    color: TEXT_MUTED,
    marginTop: 1.5,
  },
  metaValue: {
    fontWeight: "bold",
    color: TEXT_DARK,
  },

  // Customer & Delivery Information Block
  customerBox: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 6,
    marginBottom: 8,
    backgroundColor: BG_ZEBRA,
  },
  boxTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 2,
    marginBottom: 4,
  },
  customerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  customerCol: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 2.5,
  },
  customerColFull: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 1,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    width: "32%",
  },
  fieldValue: {
    fontSize: 7.8,
    color: TEXT_DARK,
    width: "68%",
    fontWeight: "bold",
  },

  // Section Heading
  sectionHeading: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 4,
  },

  // Line Items Table
  tableContainer: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BG_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    alignItems: "center",
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    alignItems: "flex-start",
    minHeight: 18,
  },
  tableRowZebra: {
    backgroundColor: BG_ZEBRA,
  },
  thCell: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: NAVY,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
    textTransform: "uppercase",
  },
  tdCell: {
    fontSize: 7.5,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
    overflow: "hidden",
  },
  colStt: { width: "5%", textAlign: "center" },
  colName: { width: "34%" },
  colModel: { width: "17%" },
  colUnit: { width: "7%", textAlign: "center" },
  colQty: { width: "7%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right", borderRightWidth: 0 },

  itemTitle: {
    fontWeight: "bold",
    color: TEXT_DARK,
    fontSize: 7.8,
  },
  itemSubtitle: {
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  discountBadge: {
    fontSize: 6.5,
    color: "#B45309",
    fontStyle: "italic",
    marginTop: 1,
  },

  // Financial Summary Block
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
  },
  summaryLabel: {
    width: "40%",
    fontSize: 7.8,
    textAlign: "right",
    color: TEXT_MUTED,
    paddingRight: 8,
  },
  summaryValue: {
    width: "18%",
    fontSize: 7.8,
    textAlign: "right",
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  grandTotalRow: {
    backgroundColor: BG_HEADER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingVertical: 3.5,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: NAVY,
  },
  grandTotalValue: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: NAVY,
  },
  wordsBox: {
    padding: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: BG_ZEBRA,
    marginBottom: 6,
    flexDirection: "row",
  },
  wordsLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: TEXT_DARK,
  },
  wordsValue: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: NAVY,
    fontWeight: "bold",
    flex: 1,
  },

  // Commercial Terms & Bank Box
  termsAndBankGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  termsCol: {
    width: "58%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 5,
  },
  bankCol: {
    width: "40%",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    padding: 5,
    backgroundColor: BG_ZEBRA,
  },
  termItem: {
    fontSize: 7.3,
    color: TEXT_DARK,
    marginBottom: 2.5,
    lineHeight: 1.25,
  },
  termBold: {
    fontWeight: "bold",
    color: NAVY,
  },
  bankItem: {
    fontSize: 7.3,
    color: TEXT_DARK,
    marginBottom: 2,
  },
  bankQrRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  bankQrImage: {
    width: 48,
    height: 48,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: BORDER_COLOR,
  },

  // Signatures Section
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
  },
  signBox: {
    width: "31%",
    textAlign: "center",
    alignItems: "center",
  },
  signTitle: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
  },
  signSub: {
    fontSize: 6.8,
    color: TEXT_MUTED,
    fontStyle: "italic",
    marginTop: 1,
  },
  signGap: {
    height: 38,
  },
  signName: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: TEXT_DARK,
  },

  // Page 2: Appendix Table
  appendixTitleBar: {
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 4,
    marginBottom: 8,
  },
  appendixHeading: {
    fontSize: 10,
    fontWeight: "bold",
    color: NAVY,
    textTransform: "uppercase",
  },
  appendixSubtitle: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  // Compact Technical Spec Card Layout
  specCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  specCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BG_HEADER,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  specCardTitleBox: {
    flex: 1,
    paddingRight: 8,
  },
  specCardTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: NAVY,
  },
  specCardSubtitle: {
    fontSize: 7.2,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  specCardBadge: {
    backgroundColor: NAVY,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
    alignItems: "center",
  },
  specCardBadgeText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  specGridContainer: {
    flexDirection: "column",
  },
  specGridRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
    minHeight: 14,
  },
  specGridRowLast: {
    borderBottomWidth: 0,
  },
  specCellLeft: {
    width: "50%",
    flexDirection: "row",
    borderRightWidth: 0.5,
    borderRightColor: BORDER_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  specCellRight: {
    width: "50%",
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  specItemLabel: {
    width: "42%",
    fontSize: 7.0,
    color: TEXT_MUTED,
  },
  specItemValue: {
    width: "58%",
    fontSize: 7.0,
    color: TEXT_DARK,
    fontWeight: "bold",
  },
  // Footer & Page Numbering
  pageFooter: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: BORDER_COLOR,
    paddingTop: 3,
  },
  footerText: {
    fontSize: 6.8,
    color: TEXT_MUTED,
  },
});
