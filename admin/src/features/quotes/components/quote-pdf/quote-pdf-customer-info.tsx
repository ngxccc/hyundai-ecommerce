import { View, Text } from "@react-pdf/renderer";
import { styles } from "./quote-pdf.styles";
import type { QuotePdfDictionary } from "./quote-pdf.i18n";

export interface QuotePdfCustomerInfoProps {
  customerName?: string | null;
  customerPhone?: string | null;
  companyName?: string | null;
  customerEmail?: string | null;
  taxId?: string | null;
  shippingAddress?: string | null;
  dict: QuotePdfDictionary;
}

/**
 * Customer identification and jobsite shipping address card for quotation documents.
 */
export const QuotePdfCustomerInfo = ({
  customerName,
  customerPhone,
  companyName,
  customerEmail,
  taxId,
  shippingAddress,
  dict,
}: QuotePdfCustomerInfoProps) => {
  return (
    <View style={styles.customerBox}>
      <Text style={styles.boxTitle}>{dict.customerSectionTitle}</Text>
      <View style={styles.customerGrid}>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.attentionLabel}:</Text>
          <Text style={styles.fieldValue}>{customerName ?? "---"}</Text>
        </View>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.phoneLabel}:</Text>
          <Text style={styles.fieldValue}>{customerPhone ?? "---"}</Text>
        </View>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.companyLabel}:</Text>
          <Text style={styles.fieldValue}>
            {companyName ?? dict.individualCustomer}
          </Text>
        </View>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.emailLabel}:</Text>
          <Text style={styles.fieldValue}>{customerEmail ?? "---"}</Text>
        </View>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.taxIdLabel}:</Text>
          <Text style={styles.fieldValue}>{taxId ?? "---"}</Text>
        </View>
        <View style={styles.customerCol}>
          <Text style={styles.fieldLabel}>{dict.deliveryAddressLabel}:</Text>
          <Text style={styles.fieldValue}>
            {shippingAddress ?? dict.defaultDeliveryAddress}
          </Text>
        </View>
      </View>
    </View>
  );
};
