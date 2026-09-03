export type ProductType = "generator" | "ups" | "ats" | "accessory";

export type PowerPhase = "1phase" | "3phase" | "multi_phase";

export type FuelType = "diesel" | "gasoline" | "gas";

export type CanopyType =
  | "silent"
  | "super_silent"
  | "open_frame"
  | "closed_case"
  | "tower"
  | "rackmount";

export type StartMethod = "electric" | "recoil" | "remote" | "auto_ats";

export type UpsTopology =
  "offline" | "line_interactive" | "online_double_conversion";

export type UpsBatteryType = "internal" | "external";

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

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: TipTapMark[];
  text?: string;
  [key: string]: unknown;
}
