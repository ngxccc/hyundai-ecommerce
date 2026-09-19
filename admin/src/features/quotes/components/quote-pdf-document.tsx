import { Document, Page, View, Text } from "@react-pdf/renderer";
import { formatCurrencyWords } from "@/lib/utils";
import type { AdminQuote, AdminCompanySettings } from "@/types/api";
import {
  styles,
  QuotePdfHeader,
  QuotePdfCustomerInfo,
  QuotePdfItemsTable,
  QuotePdfTermsBank,
  QuotePdfSignatures,
  QuotePdfAppendix,
  getPdfDictionary,
  type PdfLocale,
} from "./quote-pdf";

export interface QuotePdfDocumentProps {
  quote: AdminQuote;
  company: AdminCompanySettings;
  includeAppendix?: boolean;
  locale?: PdfLocale;
}

/**
 * Root React-PDF Document Orchestrator rendering commercial quotation and technical datasheets.
 * Supports bilingual (Vietnamese & English) localized export.
 */
export const QuotePdfDocument = ({
  quote,
  company,
  includeAppendix = true,
  locale = "vi",
}: QuotePdfDocumentProps) => {
  const dict = getPdfDictionary(locale, company);
  const terms = quote.commercialTerms;
  const subtotal = parseFloat(quote.subtotalPrice ?? "0");
  const vatRate = quote.vatRate ?? 10;
  const vatAmount = parseFloat(quote.vatAmount ?? "0");
  const grandTotal = parseFloat(quote.totalQuotedPrice ?? "0");
  const amountInWords = formatCurrencyWords(grandTotal, locale);

  const quoteNo = quote.quoteNumber ?? "DRAFT";

  const items = quote.items;
  const generatorItems = items.filter((item) => {
    const hasItemSpecs = Boolean(item.itemSpecs);
    return hasItemSpecs || !item.isCustomItem;
  });

  const shouldRenderAppendix = includeAppendix && generatorItems.length > 0;

  return (
    <Document
      title={`${dict.documentTitle} ${quoteNo} - ${dict.companyName}`}
      author={dict.companyBrandTitle}
      subject={`${dict.documentTitle} #${quoteNo}`}
    >
      <Page size="A4" style={styles.page}>
        <QuotePdfHeader
          quoteNo={quoteNo}
          createdAt={quote.createdAt}
          expirationDate={quote.expirationDate}
          validityDays={terms?.validityDays}
          dict={dict}
        />

        <QuotePdfCustomerInfo
          customerName={quote.customerName}
          customerPhone={quote.customerPhone}
          companyName={quote.companyName}
          customerEmail={quote.customerEmail}
          taxId={quote.taxId}
          shippingAddress={quote.shippingAddress}
          dict={dict}
        />

        <QuotePdfItemsTable
          items={items}
          subtotal={subtotal}
          vatRate={vatRate}
          vatAmount={vatAmount}
          grandTotal={grandTotal}
          amountInWords={amountInWords}
          dict={dict}
          locale={locale}
        />

        <QuotePdfTermsBank
          terms={terms}
          shippingAddress={quote.shippingAddress}
          note={quote.note}
          quoteNo={quoteNo}
          customerPhone={quote.customerPhone}
          grandTotal={grandTotal}
          dict={dict}
        />

        <QuotePdfSignatures customerName={quote.customerName} dict={dict} />

        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>{dict.footerDocument(quoteNo)}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              dict.footerPage(pageNumber, totalPages)
            }
          />
        </View>
      </Page>

      {shouldRenderAppendix && (
        <QuotePdfAppendix
          quoteNo={quoteNo}
          generatorItems={generatorItems}
          dict={dict}
        />
      )}
    </Document>
  );
};
