import { Page, View, Text } from "@react-pdf/renderer";
import type { AdminQuoteItem } from "@/types/api";
import { styles } from "./quote-pdf.styles";
import { deduceModel } from "./quote-pdf.helpers";
import type { QuotePdfDictionary } from "./quote-pdf.i18n";

export interface QuotePdfAppendixProps {
  quoteNo: string;
  generatorItems: AdminQuoteItem[];
  dict: QuotePdfDictionary;
}

interface SpecItemEntry {
  label: string;
  value: string;
}

interface SpecPair {
  left: SpecItemEntry;
  right?: SpecItemEntry;
}

interface RawSpecItem {
  nameVi?: string;
  nameEn?: string;
  value?: string | number;
  unit?: string | null;
}

interface RawSpecGroup {
  titleVi?: string;
  items?: RawSpecItem[];
}

/**
 * Extracts and normalizes genuine specifications from itemSpecs without any fabricated fallbacks.
 */
function extractSpecs(
  item: AdminQuoteItem,
  dict: QuotePdfDictionary,
): SpecItemEntry[] {
  const entries: SpecItemEntry[] = [];
  if (!item.itemSpecs?.trim()) {
    return entries;
  }

  const raw = item.itemSpecs.trim();

  // 1. Try parsing JSON format
  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(raw);

      // Handle Array of SpecGroup or SpecItem
      if (Array.isArray(parsed)) {
        for (const itemNode of parsed) {
          if (itemNode && typeof itemNode === "object") {
            const rawNode = itemNode as RawSpecGroup & RawSpecItem;
            if (Array.isArray(rawNode.items)) {
              for (const spec of rawNode.items) {
                if (spec.value != null && String(spec.value).trim()) {
                  const label = spec.nameVi ?? "Thông số";
                  const valStr = String(spec.value).trim();
                  const value = spec.unit ? `${valStr} ${spec.unit}` : valStr;
                  entries.push({ label: `${label}:`, value });
                }
              }
            } else if (rawNode.nameVi && rawNode.value != null) {
              const valStr = String(rawNode.value).trim();
              if (valStr) {
                const label = rawNode.nameVi;
                const value = rawNode.unit
                  ? `${valStr} ${rawNode.unit}`
                  : valStr;
                entries.push({ label: `${label}:`, value });
              }
            }
          }
        }
        if (entries.length > 0) return entries;
      }
      // Handle Key-Value Object: { power: "30kVA", voltage: "380V", ... }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>;
        const labelMap: Record<string, string> = {
          power: dict.specRatedOutput,
          powerKva: dict.specRatedOutput,
          powerKw: "Công suất (kW):",
          voltage: dict.specVoltageFreq,
          frequency: "Tần số:",
          phase: "Số pha:",
          powerFactor: "Hệ số công suất:",
          fuelType: "Nhiên liệu:",
          fuelConsumption: dict.specFuelConsumption,
          fuelTankCapacity: dict.specFuelTank,
          engine: dict.specEngine,
          engineBrand: "Hãng động cơ:",
          alternator: dict.specAlternator,
          alternatorBrand: "Hãng đầu phát:",
          noiseLevel: dict.specNoiseLevel,
          length: "Chiều dài:",
          width: "Chiều rộng:",
          height: "Chiều cao:",
          dimensions: dict.specDimensions,
          weight: dict.specDryWeight,
          topology: dict.specTopology,
          batteryType: dict.specBatteryType,
        };

        for (const [key, val] of Object.entries(obj)) {
          if (
            (typeof val === "string" || typeof val === "number") &&
            key !== "model"
          ) {
            const valStr = String(val).trim();
            if (valStr) {
              const label = labelMap[key] ?? `${key}:`;
              entries.push({ label, value: valStr });
            }
          }
        }
        if (entries.length > 0) return entries;
      }
    } catch {
      // Fall through to plain text parser below
    }
  }

  // 2. Parse Plain text key-value lines or delimited strings
  // Examples:
  // "Công suất: 30kVA/24kW, 3 Pha (380V, 50Hz)"
  // "Động cơ: Diesel\nĐầu phát: Stamford\nKích thước: 2200x900x1200mm"
  const lines = raw
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.includes(":")) {
      const colonIdx = line.indexOf(":");
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (label && value) {
        entries.push({ label: `${label}:`, value });
      }
    } else if (line.includes(",")) {
      const parts = line
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      for (const part of parts) {
        if (part.includes(":")) {
          const colonIdx = part.indexOf(":");
          const label = part.slice(0, colonIdx).trim();
          const value = part.slice(colonIdx + 1).trim();
          if (label && value) {
            entries.push({ label: `${label}:`, value });
          }
        } else {
          entries.push({ label: "Quy cách:", value: part });
        }
      }
    } else {
      entries.push({ label: "Quy cách kỹ thuật:", value: line });
    }
  }

  return entries;
}

/**
 * Compact technical specification datasheets grouped into flowing pages with synchronized 2-column cards.
 * Strict Zero Fabricated Fallback: Renders ONLY real existing specifications from database records.
 */
export const QuotePdfAppendix = ({
  quoteNo,
  generatorItems,
  dict,
}: QuotePdfAppendixProps) => {
  // Filter items that actually have real specifications
  const itemsWithSpecs = generatorItems
    .map((item) => ({
      item,
      model: deduceModel(item.itemName, item.itemModel, item.itemSpecs),
      specs: extractSpecs(item, dict),
    }))
    .filter((entry) => entry.specs.length > 0);

  if (itemsWithSpecs.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.appendixTitleBar}>
        <Text style={styles.appendixHeading}>{dict.appendixHeading}</Text>
        <Text style={styles.appendixSubtitle}>
          {dict.appendixSubtitle(quoteNo)}
        </Text>
      </View>

      {itemsWithSpecs.map(({ item, model, specs }, idx) => {
        // Group specs into pairs for synchronized 2-column rows
        const pairs: SpecPair[] = [];
        for (let i = 0; i < specs.length; i += 2) {
          const left = specs[i];
          const right = specs[i + 1];
          pairs.push({ left, right });
        }

        return (
          <View key={item.id || idx} style={styles.specCard} wrap={false}>
            <View style={styles.specCardHeader}>
              <View style={styles.specCardTitleBox}>
                <Text style={styles.specCardTitle}>
                  {idx + 1}. {item.itemName.toUpperCase()}
                </Text>
              </View>
              {model && model !== "---" ? (
                <View style={styles.specCardBadge}>
                  <Text style={styles.specCardBadgeText}>MODEL: {model}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.specGridContainer}>
              {pairs.map((pair, pIdx) => {
                const isLast = pIdx === pairs.length - 1;
                return (
                  <View
                    key={pIdx}
                    style={[
                      styles.specGridRow,
                      isLast ? styles.specGridRowLast : {},
                    ]}
                  >
                    <View style={styles.specCellLeft}>
                      <Text style={styles.specItemLabel}>
                        {pair.left.label}
                      </Text>
                      <Text style={styles.specItemValue}>
                        {pair.left.value}
                      </Text>
                    </View>
                    <View style={styles.specCellRight}>
                      {pair.right ? (
                        <>
                          <Text style={styles.specItemLabel}>
                            {pair.right.label}
                          </Text>
                          <Text style={styles.specItemValue}>
                            {pair.right.value}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={styles.pageFooter} fixed>
        <Text style={styles.footerText}>{dict.footerAppendix(quoteNo)}</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            dict.footerPage(pageNumber, totalPages)
          }
        />
      </View>
    </Page>
  );
};
