export const PRODUCT_TYPES = ["generator", "ups", "ats", "accessory"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const POWER_PHASES = ["1phase", "3phase", "multi_phase"] as const;
export type PowerPhase = (typeof POWER_PHASES)[number];

export const FUEL_TYPES = ["diesel", "gasoline", "gas"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const CANOPY_TYPES = [
  "silent",
  "super_silent",
  "open_frame",
  "closed_case",
  "tower",
  "rackmount",
] as const;
export type CanopyType = (typeof CANOPY_TYPES)[number];

export const START_METHODS = [
  "electric",
  "recoil",
  "remote",
  "auto_ats",
] as const;
export type StartMethod = (typeof START_METHODS)[number];

export const UPS_TOPOLOGIES = [
  "offline",
  "line_interactive",
  "online_double_conversion",
] as const;
export type UpsTopology = (typeof UPS_TOPOLOGIES)[number];

export const UPS_BATTERY_TYPES = ["internal", "external"] as const;
export type UpsBatteryType = (typeof UPS_BATTERY_TYPES)[number];

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

export interface ProductSpecs {
  model?: string | undefined;
  origin?: string | undefined;
  engineModel?: string | undefined;
  alternatorModel?: string | undefined;
  controller?: string | undefined;
  dimensions?: string | undefined;
  weight?: string | undefined;
  noiseLevel?: string | undefined;
  fuelConsumption?: string | undefined;
  warranty?: string | undefined;
  [key: string]: unknown;
}

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
