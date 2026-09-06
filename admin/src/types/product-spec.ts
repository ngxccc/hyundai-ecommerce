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
