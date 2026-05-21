export interface ProductSpecs {
  model?: string; // Model sản phẩm
  power?: string; // Công suất (ví dụ: "50 kVA / 40 kW")
  voltage?: string; // Điện áp (ví dụ: "380V - 400V")
  frequency?: string; // Tần số (ví dụ: "50Hz / 60Hz")
  phase?: "1 Phase" | "3 Phase"; // Số pha

  // === ĐỘNG CƠ & MÁY PHÁT ===
  engine?: string; // Model động cơ
  engineBrand?: string; // Thương hiệu động cơ (Hyundai, Mitsubishi, Perkins...)
  alternator?: string; // Model máy phát
  alternatorBrand?: string; // Thương hiệu máy phát

  // === NHIÊN LIỆU & TIÊU HAO ===
  fuelType?: "Diesel" | "Gasoline" | "Gas";
  fuelConsumption?: string; // Tiêu hao nhiên liệu (L/h)
  fuelTankCapacity?: string; // Dung tích bình nhiên liệu (L)

  // === KÍCH THƯỚC & TRỌNG LƯỢNG ===
  weight?: string; // Trọng lượng (kg)
  dimensions?: string; // Kích thước (D x R x C mm)

  // === ÂM THANH & BẢO HÀNH ===
  noiseLevel?: string; // Mức ồn (dB)
  warranty?: string; // Thời gian bảo hành (tháng/năm)

  // === THÔNG SỐ NÂNG CAO (tùy chọn) ===
  ratedCurrent?: string; // Dòng điện định mức (A)
  powerFactor?: string; // Hệ số công suất (cos φ)
  startingSystem?: string; // Hệ thống khởi động (Electric / Recoil)
  coolingSystem?: string; // Hệ thống làm mát (Water / Air)

  // Cho phép thêm các thông số khác linh hoạt
  [key: string]: string | number | boolean | undefined;
}
