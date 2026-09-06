export interface SpecItem {
  key: string;
  nameVi: string;
  nameEn?: string | undefined;
  value: string;
  unit?: string | null | undefined;
}

export interface SpecGroup {
  groupKey: string;
  titleVi: string;
  titleEn?: string | undefined;
  order: number;
  items: SpecItem[];
}

export type ProductSpecSheet = SpecGroup[];
