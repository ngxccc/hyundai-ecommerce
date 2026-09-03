import type { DrizzleDB } from "@/database/database.module";
import {
  brands,
  categories,
  products,
  warehouses,
  warehouseStocks,
} from "@/database/schemas";
import { isScopeActive, type SeedScope } from "../constants/seed.constant";
import type { Tier1SeedResult, Tier2SeedResult } from "../types/seed.type";
import {
  DIESEL_STANDBY_GENERATOR_TEMPLATE,
  GASOLINE_PORTABLE_GENERATOR_TEMPLATE,
  INDUSTRIAL_DIESEL_GENERATOR_TEMPLATE,
  UPS_ONLINE_TEMPLATE,
} from "../data/spec-templates";

export const HYUNDAI_BRAND_ID = "019de188-641f-768f-8fe7-da0964943808";
export const MITSUBISHI_BRAND_ID = "019de188-642a-71bf-8082-ec510823ed3c";
export const KUBOTA_BRAND_ID = "019de188-642a-71bf-8082-f37ae97f09e4";

export const PARENT_GEN_CAT_ID = "019de188-6756-735c-8639-3e1d67c3f6c5";
export const CHILD_HOME_GEN_CAT_ID = "019de188-6756-735c-8639-42a4f367350b";
export const CHILD_IND_GEN_CAT_ID = "019de188-6756-735c-8639-44cdd56f6e88";
export const PARENT_UPS_CAT_ID = "019de188-7777-7000-8000-000000000001";
export const CHILD_UPS_ONLINE_CAT_ID = "019de188-7777-7000-8000-000000000002";

export const PRODUCT1_ID = "019de188-693a-79a4-ab25-2ad9513da470";
export const PRODUCT2_ID = "019de188-693a-79a4-ab25-3008985ebba1";
export const PRODUCT3_ID = "019de188-693a-79a4-ab25-3430f81d11ff";
export const PRODUCT4_ID = "019de188-693a-79a4-ab25-37f26d36e2f1";

export const WAREHOUSE1_ID = "019de188-8888-7000-8000-000000000001";
export const WAREHOUSE2_ID = "019de188-8888-7000-8000-000000000002";

export async function seedTier2Catalog(
  db: DrizzleDB,
  scopes: SeedScope[],
  _tier1Result?: Tier1SeedResult,
): Promise<Tier2SeedResult> {
  const result: Tier2SeedResult = {
    brands: [],
    categories: [],
    products: [],
    warehouses: [],
    warehouseStocksCount: 0,
  };

  // 1. Seed Brands
  if (isScopeActive(scopes, "catalog", "brands")) {
    const brandData = [
      {
        id: HYUNDAI_BRAND_ID,
        name: "Hyundai",
        slug: "hyundai",
        logo: "https://cdn.example.com/hyundai.png",
        descriptionVi: "Thương hiệu máy phát điện uy tín từ Hàn Quốc",
        descriptionEn: "Reputable generator brand from South Korea",
        isActive: true,
      },
      {
        id: MITSUBISHI_BRAND_ID,
        name: "Mitsubishi",
        slug: "mitsubishi",
        logo: "https://cdn.example.com/mitsubishi.png",
        descriptionVi: "Máy phát điện công nghiệp cao cấp Nhật Bản",
        descriptionEn: "Premium industrial generators from Japan",
        isActive: true,
      },
      {
        id: KUBOTA_BRAND_ID,
        name: "Kubota",
        slug: "kubota",
        logo: "https://cdn.example.com/kubota.png",
        descriptionVi: "Máy phát điện diesel Nhật Bản chất lượng cao",
        descriptionEn: "High-quality Japanese diesel generators",
        isActive: true,
      },
    ];

    await db.insert(brands).values(brandData).onConflictDoNothing();

    result.brands = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
      })
      .from(brands);
  }

  // 2. Seed Categories
  if (isScopeActive(scopes, "catalog", "categories")) {
    const categoryData = [
      {
        id: PARENT_GEN_CAT_ID,
        nameVi: "Máy phát điện",
        nameEn: "Generators",
        slug: "may-phat-dien",
        parentId: null,
        descriptionVi: "Tất cả các loại máy phát điện",
        descriptionEn: "All types of generators",
        isActive: true,
      },
      {
        id: CHILD_HOME_GEN_CAT_ID,
        nameVi: "Máy phát điện gia đình",
        nameEn: "Household Generators",
        slug: "may-phat-dien-gia-dinh",
        parentId: PARENT_GEN_CAT_ID,
        descriptionVi: "Máy phát điện dùng cho gia đình, văn phòng",
        descriptionEn: "Generators for home and office use",
        isActive: true,
      },
      {
        id: CHILD_IND_GEN_CAT_ID,
        nameVi: "Máy phát điện công nghiệp",
        nameEn: "Industrial Generators",
        slug: "may-phat-dien-cong-nghiep",
        parentId: PARENT_GEN_CAT_ID,
        descriptionVi: "Máy phát điện công suất lớn cho nhà máy, công trường",
        descriptionEn:
          "High-power generators for factories and construction sites",
        isActive: true,
      },
      {
        id: PARENT_UPS_CAT_ID,
        nameVi: "Bộ lưu điện (UPS)",
        nameEn: "Uninterruptible Power Supply (UPS)",
        slug: "bo-luu-dien-ups",
        parentId: null,
        descriptionVi:
          "Thiết bị lưu điện dự phòng cho server, y tế, viễn thông",
        descriptionEn: "Backup power supply for servers, medical, and telecom",
        isActive: true,
      },
      {
        id: CHILD_UPS_ONLINE_CAT_ID,
        nameVi: "Bộ lưu điện Online",
        nameEn: "Online UPS",
        slug: "bo-luu-dien-online",
        parentId: PARENT_UPS_CAT_ID,
        descriptionVi: "UPS Online chuyển đổi kép sóng sin chuẩn 0ms",
        descriptionEn: "Online double conversion UPS pure sine wave 0ms",
        isActive: true,
      },
    ];

    await db.insert(categories).values(categoryData).onConflictDoNothing();

    result.categories = await db
      .select({
        id: categories.id,
        nameVi: categories.nameVi,
        slug: categories.slug,
      })
      .from(categories);
  }

  // 3. Seed Warehouses
  if (isScopeActive(scopes, "catalog", "warehouses")) {
    const warehouseData = [
      {
        id: WAREHOUSE1_ID,
        nameVi: "Kho Hà Nội",
        nameEn: "Hanoi Warehouse",
        streetAddress: "Cụm Công nghiệp Ngọc Hồi, Xã Ngọc Hồi",
        district: "Huyện Thanh Trì",
        city: "Thành phố Hà Nội",
        isActive: true,
      },
      {
        id: WAREHOUSE2_ID,
        nameVi: "Kho TP.HCM",
        nameEn: "HCM Warehouse",
        streetAddress: "Số 89, Đường Nguyễn Thị Minh Khai",
        district: "Quận 1",
        city: "Thành phố Hồ Chí Minh",
        isActive: true,
      },
    ];

    await db.insert(warehouses).values(warehouseData).onConflictDoNothing();

    result.warehouses = await db
      .select({
        id: warehouses.id,
        nameVi: warehouses.nameVi,
        city: warehouses.city,
      })
      .from(warehouses);
  }

  // 4. Seed Products with Hybrid Specifications
  if (isScopeActive(scopes, "catalog", "products")) {
    const productData = [
      {
        id: PRODUCT1_ID,
        nameVi: "Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha",
        nameEn: "Hyundai DHY65KSE 60kVA 3 Phase Diesel Generator",
        slug: "may-phat-dien-diesel-hyundai-dhy65kse-60kva-3-pha",
        price: "245000000.00",
        descriptionVi: { type: "doc", content: [] },
        descriptionEn: { type: "doc", content: [] },
        shortDescriptionVi:
          "Máy phát điện công nghiệp 60kVA vỏ chống ồn đồng bộ cao cấp",
        images: ["https://cdn.example.com/dhy65kse.jpg"],
        brandId: HYUNDAI_BRAND_ID,
        categoryId: CHILD_IND_GEN_CAT_ID,
        productType: "generator" as const,
        powerKva: "60.00",
        powerKw: "48.00",
        standbyPowerKva: "66.00",
        standbyPowerKw: "52.80",
        phase: "3phase" as const,
        voltage: "230/400V",
        frequency: 50,
        fuelType: "diesel" as const,
        canopyType: "silent" as const,
        startMethod: "auto_ats" as const,
        engineBrand: "Hyundai",
        alternatorBrand: "Hyundai Brushless",
        specSheet: INDUSTRIAL_DIESEL_GENERATOR_TEMPLATE,
        totalStockCache: 25,
        isActive: true,
      },
      {
        id: PRODUCT2_ID,
        nameVi: "Máy phát điện Diesel Hyundai DHY11KSEm 10kVA 1 Pha",
        nameEn: "Hyundai DHY11KSEm 10kVA Single Phase Diesel Generator",
        slug: "may-phat-dien-diesel-hyundai-dhy11ksem-10kva-1-pha",
        price: "85000000.00",
        descriptionVi: { type: "doc", content: [] },
        descriptionEn: { type: "doc", content: [] },
        shortDescriptionVi:
          "Máy phát điện diesel gia đình, văn phòng vỏ siêu chống ồn",
        images: ["https://cdn.example.com/dhy11ksem.jpg"],
        brandId: HYUNDAI_BRAND_ID,
        categoryId: CHILD_HOME_GEN_CAT_ID,
        productType: "generator" as const,
        powerKva: "10.00",
        powerKw: "8.00",
        standbyPowerKva: "11.00",
        standbyPowerKw: "8.80",
        phase: "1phase" as const,
        voltage: "230V",
        frequency: 50,
        fuelType: "diesel" as const,
        canopyType: "super_silent" as const,
        startMethod: "electric" as const,
        engineBrand: "Hyundai",
        alternatorBrand: "Hyundai",
        specSheet: DIESEL_STANDBY_GENERATOR_TEMPLATE,
        totalStockCache: 4,
        isActive: true,
      },
      {
        id: PRODUCT3_ID,
        nameVi: "Máy phát điện Xăng Hyundai HY3100LE 2.8kW",
        nameEn: "Hyundai HY3100LE 2.8kW Portable Gasoline Generator",
        slug: "may-phat-dien-xang-hyundai-hy3100le-28kw",
        price: "12500000.00",
        descriptionVi: { type: "doc", content: [] },
        descriptionEn: { type: "doc", content: [] },
        shortDescriptionVi: "Máy phát điện xách tay nhỏ gọn dùng xăng",
        images: ["https://cdn.example.com/hy3100le.jpg"],
        brandId: HYUNDAI_BRAND_ID,
        categoryId: CHILD_HOME_GEN_CAT_ID,
        productType: "generator" as const,
        powerKva: "3.50",
        powerKw: "2.80",
        phase: "1phase" as const,
        voltage: "220V",
        frequency: 50,
        fuelType: "gasoline" as const,
        canopyType: "open_frame" as const,
        startMethod: "recoil" as const,
        specSheet: GASOLINE_PORTABLE_GENERATOR_TEMPLATE,
        totalStockCache: 12,
        isActive: true,
      },
      {
        id: PRODUCT4_ID,
        nameVi: "Bộ lưu điện Online Hyundai HD-10KS 10kVA/9kW",
        nameEn: "Hyundai HD-10KS 10kVA/9kW Online UPS",
        slug: "bo-luu-dien-online-hyundai-hd-10ks-10kva-9kw",
        price: "42000000.00",
        descriptionVi: { type: "doc", content: [] },
        descriptionEn: { type: "doc", content: [] },
        shortDescriptionVi: "UPS Online sóng sin chuẩn thời gian lưu điện dài",
        images: ["https://cdn.example.com/hd10ks.jpg"],
        brandId: HYUNDAI_BRAND_ID,
        categoryId: CHILD_UPS_ONLINE_CAT_ID,
        productType: "ups" as const,
        powerKva: "10.00",
        powerKw: "9.00",
        phase: "1phase" as const,
        voltage: "220V",
        upsTopology: "online_double_conversion" as const,
        upsBatteryType: "external" as const,
        specSheet: UPS_ONLINE_TEMPLATE,
        totalStockCache: 8,
        isActive: true,
      },
    ];

    await db.insert(products).values(productData).onConflictDoNothing();

    result.products = await db
      .select({
        id: products.id,
        nameVi: products.nameVi,
        slug: products.slug,
        price: products.price,
        totalStockCache: products.totalStockCache,
      })
      .from(products);

    // 5. Seed Warehouse Stocks
    const stockData = [
      {
        warehouseId: WAREHOUSE1_ID,
        productId: PRODUCT1_ID,
        stock: 15,
        minStockWarning: 5,
      },
      {
        warehouseId: WAREHOUSE2_ID,
        productId: PRODUCT1_ID,
        stock: 10,
        minStockWarning: 5,
      },
      {
        warehouseId: WAREHOUSE1_ID,
        productId: PRODUCT2_ID,
        stock: 4,
        minStockWarning: 2,
      },
      {
        warehouseId: WAREHOUSE2_ID,
        productId: PRODUCT3_ID,
        stock: 12,
        minStockWarning: 3,
      },
      {
        warehouseId: WAREHOUSE1_ID,
        productId: PRODUCT4_ID,
        stock: 8,
        minStockWarning: 2,
      },
    ];

    await db.insert(warehouseStocks).values(stockData).onConflictDoNothing();
    result.warehouseStocksCount = stockData.length;
  }

  return result;
}
