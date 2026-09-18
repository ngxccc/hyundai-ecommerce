import { View, Text } from "@react-pdf/renderer";
import { styles } from "./quote-pdf.styles";
import type { QuotePdfDictionary } from "./quote-pdf.i18n";

export interface QuotePdfSignaturesProps {
  customerName?: string | null;
  dict: QuotePdfDictionary;
}

/**
 * Three-tier formal signature block (Buyer, Sales Specialist, Legal Representative).
 */
export const QuotePdfSignatures = ({
  customerName,
  dict,
}: QuotePdfSignaturesProps) => {
  return (
    <View style={styles.signatureSection}>
      <View style={styles.signBox}>
        <Text style={styles.signTitle}>{dict.signBuyerTitle}</Text>
        <Text style={styles.signSub}>{dict.signBuyerSubtitle}</Text>
        <View style={styles.signGap} />
        <Text style={styles.signName}>{customerName ?? "---"}</Text>
      </View>

      <View style={styles.signBox}>
        <Text style={styles.signTitle}>{dict.signPreparerTitle}</Text>
        <Text style={styles.signSub}>{dict.signPreparerSubtitle}</Text>
        <View style={styles.signGap} />
        <Text style={styles.signName}>{dict.signPreparerRole}</Text>
      </View>

      <View style={styles.signBox}>
        <Text style={styles.signTitle}>{dict.signSellerTitle}</Text>
        <Text style={styles.signSub}>{dict.companyName}</Text>
        <View style={styles.signGap} />
        <Text style={styles.signName}>{dict.signSellerRole}</Text>
      </View>
    </View>
  );
};
