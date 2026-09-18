import { View, Text } from "@react-pdf/renderer";
import { companyConfig } from "@/config/company";
import { styles } from "./quote-pdf.styles";
import { formatDateVn, resolveExpirationDate } from "./quote-pdf.helpers";
import type { QuotePdfDictionary } from "./quote-pdf.i18n";

export interface QuotePdfHeaderProps {
  quoteNo: string;
  createdAt: Date | string | null | undefined;
  expirationDate: Date | string | null | undefined;
  validityDays?: number | null;
  dict: QuotePdfDictionary;
}

/**
 * Top corporate identity banner and document metadata for commercial quotations.
 */
export const QuotePdfHeader = ({
  quoteNo,
  createdAt,
  expirationDate,
  validityDays = 15,
  dict,
}: QuotePdfHeaderProps) => {
  const days = validityDays ?? 15;
  const effectiveExpirationDate = resolveExpirationDate(
    createdAt,
    expirationDate,
    days,
  );

  return (
    <View style={styles.headerRow}>
      <View style={styles.logoSection}>
        <Text style={styles.companyBrand}>{companyConfig.brandTitle}</Text>
        <Text style={styles.companyName}>{dict.companyName}</Text>
        <Text style={styles.companyDetails}>
          {dict.officePrefix}: {dict.companyAddress}
        </Text>
        <Text style={styles.companyDetails}>
          {dict.hotlineLabel}:{" "}
          <Text style={styles.companyHighlight}>
            {companyConfig.hotlines.project.display}
          </Text>{" "}
          | {dict.emailLabel}: {companyConfig.emails.support}
        </Text>
        <Text style={styles.companyDetails}>
          {dict.taxIdLabel}:{" "}
          <Text style={styles.companyHighlight}>{companyConfig.taxId}</Text> |{" "}
          {dict.websiteLabel}: {companyConfig.links.website}
        </Text>
      </View>

      <View style={styles.documentMetaRight}>
        <Text style={styles.documentTitle}>{dict.documentTitle}</Text>
        <Text style={styles.metaItem}>
          {dict.quoteNumberLabel}:{" "}
          <Text style={styles.metaValue}>{quoteNo}</Text>
        </Text>
        <Text style={styles.metaItem}>
          {dict.issueDateLabel}:{" "}
          <Text style={styles.metaValue}>{formatDateVn(createdAt)}</Text>
        </Text>
        <Text style={styles.metaItem}>
          {dict.validityLabel}:{" "}
          <Text style={styles.metaValue}>
            {days} {dict.validityDaysUnit}
          </Text>{" "}
          ({dict.validityUntilPrefix} {formatDateVn(effectiveExpirationDate)})
        </Text>
      </View>
    </View>
  );
};
