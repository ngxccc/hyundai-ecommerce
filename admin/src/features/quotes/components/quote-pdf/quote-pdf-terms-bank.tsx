import { View, Text, Image } from "@react-pdf/renderer";
import { companyConfig } from "@/config/company";
import type { QuoteCommercialTerms } from "@/types/api";
import { styles, TEXT_MUTED } from "./quote-pdf.styles";
import { generateVietQrUrl } from "./quote-pdf.helpers";
import type { QuotePdfDictionary } from "./quote-pdf.i18n";

export interface QuotePdfTermsBankProps {
  terms?: QuoteCommercialTerms | null;
  shippingAddress?: string | null;
  note?: string | null;
  quoteNo: string;
  customerPhone?: string | null;
  grandTotal: number;
  dict: QuotePdfDictionary;
}

/**
 * Commercial execution terms and official banking details with dynamic VietQR image.
 */
export const QuotePdfTermsBank = ({
  terms,
  shippingAddress,
  note,
  quoteNo,
  customerPhone,
  grandTotal,
  dict,
}: QuotePdfTermsBankProps) => {
  // Standard B2B contractual policy mandates 30% initial deposit for equipment reservation
  const depositAmount = grandTotal * 0.3;
  const vietQrUrl = generateVietQrUrl(quoteNo, depositAmount);

  return (
    <>
      <Text style={styles.sectionHeading}>{dict.termsSectionTitle}</Text>
      <View style={styles.termsAndBankGrid}>
        <View style={styles.termsCol}>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>{dict.termDeliveryTimeLabel} </Text>
            {terms?.deliveryTime ?? dict.termDeliveryTimeDefault}
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>
              {dict.termDeliveryLocationLabel}{" "}
            </Text>
            {terms?.deliveryLocation ??
              shippingAddress ??
              dict.termDeliveryLocationDefault}
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>
              {dict.termPaymentScheduleLabel}{" "}
            </Text>
            {terms?.paymentSchedule ?? dict.termPaymentScheduleDefault}
          </Text>
          <Text style={styles.termItem}>
            <Text style={styles.termBold}>{dict.termWarrantyLabel} </Text>
            {terms?.warrantyTerms ?? dict.termWarrantyDefault}
          </Text>
          {note ? (
            <Text style={styles.termItem}>
              <Text style={styles.termBold}>
                {dict.termTechnicalNotesLabel}{" "}
              </Text>
              {note}
            </Text>
          ) : null}
        </View>

        <View style={styles.bankCol}>
          <Text style={styles.boxTitle}>{dict.bankBoxTitle}</Text>
          <Text style={styles.bankItem}>
            <Text style={styles.companyHighlight}>
              {dict.bankBeneficiaryLabel}
            </Text>
            {"\n"}
            {companyConfig.bank.accountName}
          </Text>
          <Text style={styles.bankItem}>
            <Text style={styles.companyHighlight}>
              {dict.bankAccountNoLabel}{" "}
            </Text>
            {companyConfig.bank.accountNo}
          </Text>
          <Text style={styles.bankItem}>
            <Text style={styles.companyHighlight}>{dict.bankNameLabel} </Text>
            {companyConfig.bank.bankName} ({dict.bankBranch})
          </Text>
          <Text style={styles.bankItem}>
            <Text style={styles.companyHighlight}>{dict.bankMemoLabel} </Text>
            {quoteNo} {customerPhone ?? ""}
          </Text>
          <View style={styles.bankQrRow}>
            <Image src={vietQrUrl} style={styles.bankQrImage} />
            <Text style={{ fontSize: 6.8, color: TEXT_MUTED, flex: 1 }}>
              {dict.bankQrCaption}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};
