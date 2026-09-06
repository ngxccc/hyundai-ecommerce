import type { ProductSpecSheet } from "@/types/product-spec";

export const INDUSTRIAL_DIESEL_GENERATOR_TEMPLATE: ProductSpecSheet = [
  {
    groupKey: "general",
    titleVi: "Thông số chung",
    titleEn: "General Specifications",
    order: 1,
    items: [
      {
        key: "continuous_power",
        nameVi: "Công suất liên tục",
        nameEn: "Prime Power",
        value: "",
        unit: "kVA",
      },
      {
        key: "standby_power",
        nameVi: "Công suất dự phòng",
        nameEn: "Standby Power",
        value: "",
        unit: "kVA",
      },
      {
        key: "voltage",
        nameVi: "Điện thế",
        nameEn: "Voltage",
        value: "230/400",
        unit: "V",
      },
      {
        key: "frequency",
        nameVi: "Tần số",
        nameEn: "Frequency",
        value: "50",
        unit: "Hz",
      },
      {
        key: "fuel_type",
        nameVi: "Nhiên liệu",
        nameEn: "Fuel Type",
        value: "Diesel",
      },
      {
        key: "canopy_type",
        nameVi: "Loại vỏ",
        nameEn: "Canopy Type",
        value: "Vỏ chống ồn",
      },
    ],
  },
  {
    groupKey: "engine",
    titleVi: "Động cơ",
    titleEn: "Engine Specifications",
    order: 2,
    items: [
      {
        key: "engine_brand",
        nameVi: "Hãng sản xuất động cơ",
        nameEn: "Engine Manufacturer",
        value: "",
      },
      {
        key: "engine_model",
        nameVi: "Model động cơ",
        nameEn: "Engine Model",
        value: "",
      },
      {
        key: "cylinders",
        nameVi: "Số xi lanh",
        nameEn: "Number of Cylinders",
        value: "",
      },
      {
        key: "speed",
        nameVi: "Tốc độ vòng quay",
        nameEn: "Engine Speed",
        value: "1500",
        unit: "vòng/phút",
      },
    ],
  },
];

export const DIESEL_STANDBY_GENERATOR_TEMPLATE: ProductSpecSheet = [
  {
    groupKey: "general",
    titleVi: "Thông số chung",
    titleEn: "General Specifications",
    order: 1,
    items: [
      {
        key: "continuous_power",
        nameVi: "Công suất liên tục",
        nameEn: "Prime Power",
        value: "",
        unit: "kVA",
      },
      {
        key: "standby_power",
        nameVi: "Công suất dự phòng",
        nameEn: "Standby Power",
        value: "",
        unit: "kVA",
      },
      {
        key: "voltage",
        nameVi: "Điện thế",
        nameEn: "Voltage",
        value: "230",
        unit: "V",
      },
      {
        key: "frequency",
        nameVi: "Tần số",
        nameEn: "Frequency",
        value: "50",
        unit: "Hz",
      },
    ],
  },
];

export const GASOLINE_PORTABLE_GENERATOR_TEMPLATE: ProductSpecSheet = [
  {
    groupKey: "general",
    titleVi: "Thông số chung",
    titleEn: "General Specifications",
    order: 1,
    items: [
      {
        key: "power",
        nameVi: "Công suất liên tục",
        nameEn: "Rated Power",
        value: "",
        unit: "kW",
      },
      {
        key: "voltage",
        nameVi: "Điện thế",
        nameEn: "Voltage",
        value: "220",
        unit: "V",
      },
      {
        key: "fuel_type",
        nameVi: "Nhiên liệu",
        nameEn: "Fuel Type",
        value: "Xăng",
      },
    ],
  },
];

export const UPS_ONLINE_TEMPLATE: ProductSpecSheet = [
  {
    groupKey: "general",
    titleVi: "Thông số chung",
    titleEn: "General Specifications",
    order: 1,
    items: [
      {
        key: "capacity_kva",
        nameVi: "Công suất kVA",
        nameEn: "Capacity kVA",
        value: "",
        unit: "kVA",
      },
      {
        key: "capacity_kw",
        nameVi: "Công suất kW",
        nameEn: "Capacity kW",
        value: "",
        unit: "kW",
      },
      {
        key: "topology",
        nameVi: "Công nghệ UPS",
        nameEn: "UPS Topology",
        value: "Online chuyển đổi kép",
      },
      {
        key: "transfer_time",
        nameVi: "Thời gian chuyển mạch",
        nameEn: "Transfer Time",
        value: "0",
        unit: "ms",
      },
    ],
  },
];

export interface SpecTemplateOption {
  id: string;
  name: string;
  productType: "generator" | "ups";
  template: ProductSpecSheet;
}

export const SPEC_TEMPLATE_OPTIONS: SpecTemplateOption[] = [
  {
    id: "industrial_diesel",
    name: "Máy phát điện công nghiệp Diesel 1500rpm",
    productType: "generator",
    template: INDUSTRIAL_DIESEL_GENERATOR_TEMPLATE,
  },
  {
    id: "diesel_standby",
    name: "Máy phát điện dự phòng Diesel 3000rpm",
    productType: "generator",
    template: DIESEL_STANDBY_GENERATOR_TEMPLATE,
  },
  {
    id: "gasoline_portable",
    name: "Máy phát điện xách tay chạy xăng",
    productType: "generator",
    template: GASOLINE_PORTABLE_GENERATOR_TEMPLATE,
  },
  {
    id: "ups_online",
    name: "Bộ lưu điện UPS Online Double Conversion",
    productType: "ups",
    template: UPS_ONLINE_TEMPLATE,
  },
];
