import { View, Text } from "@react-pdf/renderer";
import type { AdminQuoteItem } from "@/types/api";
import { styles } from "./quote-pdf.styles";
import {
  formatCurrencyVnd,
  deduceModel,
  deduceUnit,
} from "./quote-pdf.helpers";
import type { QuotePdfDictionary, PdfLocale } from "./quote-pdf.i18n";

export interface QuotePdfItemsTableProps {
  items: AdminQuoteItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  amountInWords: string;
  dict: QuotePdfDictionary;
  locale?: PdfLocale;
}

/**
 * Line item pricing matrix, tax computations, and financial grand totals in words.
 */
export const QuotePdfItemsTable = ({
  items,
  subtotal,
  vatRate,
  vatAmount,
  grandTotal,
  amountInWords,
  dict,
  locale = "vi",
}: QuotePdfItemsTableProps) => {
  return (
    <>
      <Text style={styles.sectionHeading}>{dict.itemsSectionTitle}</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thCell, styles.colStt]}>{dict.colIndex}</Text>
          <Text style={[styles.thCell, styles.colName]}>
            {dict.colItemName}
          </Text>
          <Text style={[styles.thCell, styles.colModel]}>{dict.colModel}</Text>
          <Text style={[styles.thCell, styles.colUnit]}>{dict.colUnit}</Text>
          <Text style={[styles.thCell, styles.colQty]}>{dict.colQuantity}</Text>
          <Text style={[styles.thCell, styles.colPrice]}>
            {dict.colUnitPrice}
          </Text>
          <Text style={[styles.thCell, styles.colTotal]}>
            {dict.colTotalPrice}
          </Text>
        </View>

        {items.map((item, idx) => {
          const unitPrice = parseFloat(item.unitPrice ?? "0");
          const discountPercent = parseFloat(item.discountPercent ?? "0");
          const finalUnitPrice =
            item.finalUnitPrice != null
              ? parseFloat(item.finalUnitPrice)
              : discountPercent > 0
                ? unitPrice * (1 - discountPercent / 100)
                : unitPrice;
          const totalPrice =
            item.totalPrice != null
              ? parseFloat(item.totalPrice)
              : finalUnitPrice * item.quantity;
          const model = deduceModel(
            item.itemName,
            item.itemModel,
            item.itemSpecs,
          );
          const unit = deduceUnit(item.itemName, locale);
          const isZebra = idx % 2 === 1;

          return (
            <View
              key={item.id}
              style={[styles.tableRow, isZebra ? styles.tableRowZebra : {}]}
            >
              <Text style={[styles.tdCell, styles.colStt]}>{idx + 1}</Text>
              <View style={[styles.tdCell, styles.colName]}>
                <Text style={styles.itemTitle}>{item.itemName}</Text>
                {discountPercent > 0 ? (
                  <Text style={styles.discountBadge}>
                    {dict.discountBadge(
                      discountPercent,
                      formatCurrencyVnd(unitPrice),
                    )}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.tdCell, styles.colModel]}>{model}</Text>
              <Text style={[styles.tdCell, styles.colUnit]}>{unit}</Text>
              <Text style={[styles.tdCell, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tdCell, styles.colPrice]}>
                {formatCurrencyVnd(finalUnitPrice)}
              </Text>
              <Text style={[styles.tdCell, styles.colTotal]}>
                {formatCurrencyVnd(totalPrice)}
              </Text>
            </View>
          );
        })}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{dict.subtotalLabel}</Text>
          <Text style={styles.summaryValue}>{formatCurrencyVnd(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{dict.vatLabel(vatRate)}</Text>
          <Text style={styles.summaryValue}>
            {formatCurrencyVnd(vatAmount)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={[styles.summaryLabel, styles.grandTotalLabel]}>
            {dict.grandTotalLabel}
          </Text>
          <Text style={[styles.summaryValue, styles.grandTotalValue]}>
            {formatCurrencyVnd(grandTotal)}
          </Text>
        </View>
      </View>

      <View style={styles.wordsBox}>
        <Text style={styles.wordsLabel}>{dict.amountInWordsLabel} </Text>
        <Text style={styles.wordsValue}>{amountInWords}</Text>
      </View>
    </>
  );
};
