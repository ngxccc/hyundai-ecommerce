import { db, dealerTiers } from "./index";
import { brands } from "./schemas/brand.schema";
import { categories } from "./schemas/category.schema";
import { products } from "./schemas/product.schema";
import { warehouses } from "./schemas/warehouse.schema";
import { warehouseStocks } from "./schemas/warehouse-stock.schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Brands
  const hyundaiId = "019de188-641f-768f-8fe7-da0964943808";
  const mitsubishiId = "019de188-642a-71bf-8082-ec510823ed3c";
  const kubotaId = "019de188-642a-71bf-8082-f37ae97f09e4";

  const brandData = [
    {
      id: hyundaiId,
      name: "Hyundai",
      slug: "hyundai",
      logo: "https://cdn.example.com/hyundai.png",
      description: "Thương hiệu máy phát điện uy tín từ Hàn Quốc",
      isActive: true,
    },
    {
      id: mitsubishiId,
      name: "Mitsubishi",
      slug: "mitsubishi",
      logo: "https://cdn.example.com/mitsubishi.png",
      description: "Máy phát điện công nghiệp cao cấp Nhật Bản",
      isActive: true,
    },
    {
      id: kubotaId,
      name: "Kubota",
      slug: "kubota",
      logo: "https://cdn.example.com/kubota.png",
      description: "Máy phát điện diesel Nhật Bản chất lượng cao",
      isActive: true,
    },
  ];

  await db.insert(brands).values(brandData).onConflictDoNothing();

  // 2. Seed Categories (with hierarchy)
  const parentCatId = "019de188-6756-735c-8639-3e1d67c3f6c5";
  const childCat1Id = "019de188-6756-735c-8639-42a4f367350b";
  const childCat2Id = "019de188-6756-735c-8639-44cdd56f6e88";

  const categoryData = [
    {
      id: parentCatId,
      name: "Máy phát điện",
      slug: "may-phat-dien",
      parentId: null,
      description: "Tất cả các loại máy phát điện",
      image: null,
      isActive: true,
    },
    {
      id: childCat1Id,
      name: "Máy phát điện gia đình",
      slug: "may-phat-dien-gia-dinh",
      parentId: parentCatId,
      description: "Máy phát điện dùng cho gia đình, văn phòng",
      image: null,
      isActive: true,
    },
    {
      id: childCat2Id,
      name: "Máy phát điện công nghiệp",
      slug: "may-phat-dien-cong-nghiep",
      parentId: parentCatId,
      description: "Máy phát điện công suất lớn cho nhà máy, công trường",
      image: null,
      isActive: true,
    },
  ];

  await db.insert(categories).values(categoryData).onConflictDoNothing();

  // 3. Seed Products
  const product1Id = "019de188-6799-761e-bb91-7c6ecf6377d8";
  const product2Id = "019de188-6799-761e-bb91-825a77b45568";
  const product3Id = "019de188-6799-761e-bb91-84a024241fd3";

  const productData = [
    {
      id: product1Id,
      name: "Máy phát điện Hyundai DHY-5000LE",
      slug: "may-phat-dien-hyundai-dhy-5000le",
      price: "12500000",
      description:
        "Máy phát điện chạy dầu diesel Hyundai DHY-5000LE, công suất 5kVA, đề nổ điện, có bánh xe di chuyển tiện lợi.",
      shortDescription: "Máy phát điện diesel 5kVA, đề điện",
      images: ["https://cdn.example.com/hyundai-dhy-5000le-1.jpg"],
      brandId: hyundaiId,
      categoryId: childCat1Id,
      specs: { power: "5kVA", engine: "Diesel 186FA", weight: "95kg" },
      totalStockCache: 25,
      isQuoteOnly: false,
    },
    {
      id: product2Id,
      name: "Máy phát điện Mitsubishi MGE-10000",
      slug: "may-phat-dien-mitsubishi-mge-10000",
      price: "28900000",
      description:
        "Máy phát điện công nghiệp Mitsubishi MGE-10000, công suất 10kVA, động cơ Mitsubishi chất lượng cao.",
      shortDescription: "Máy phát điện công nghiệp 10kVA",
      images: ["https://cdn.example.com/mitsubishi-mge-10000-1.jpg"],
      brandId: mitsubishiId,
      categoryId: childCat2Id,
      specs: { power: "10kVA", engine: "Mitsubishi S4S", weight: "185kg" },
      totalStockCache: 8,
      isQuoteOnly: false,
    },
    {
      id: product3Id,
      name: "Máy phát điện Kubota GL-6500",
      slug: "may-phat-dien-kubota-gl-6500",
      price: "21500000",
      description:
        "Máy phát điện diesel Kubota GL-6500 công suất 6.5kVA, động cơ Kubota bền bỉ, tiết kiệm nhiên liệu.",
      shortDescription: "Máy phát điện Kubota 6.5kVA",
      images: ["https://cdn.example.com/kubota-gl-6500-1.jpg"],
      brandId: kubotaId,
      categoryId: childCat1Id,
      specs: { power: "6.5kVA", engine: "Kubota Z482", weight: "112kg" },
      totalStockCache: 12,
      isQuoteOnly: false,
    },
  ];

  await db.insert(products).values(productData).onConflictDoNothing();

  // 4. Seed Warehouses
  const warehouse1Id = "019de188-67e2-70cd-994e-0a8039622008";
  const warehouse2Id = "019de188-67e2-70cd-994e-0f3ee6da06c6";

  const warehouseData = [
    {
      id: warehouse1Id,
      name: "Kho Hà Nội",
      streetAddress: "Số 12, Ngõ 45, Đường Nguyễn Xiển",
      district: "Thanh Xuân",
      city: "Hà Nội",
      isActive: true,
    },
    {
      id: warehouse2Id,
      name: "Kho TP.HCM",
      streetAddress: "Số 89, Đường Nguyễn Thị Minh Khai",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
      isActive: true,
    },
  ];

  await db.insert(warehouses).values(warehouseData).onConflictDoNothing();

  // 5. Seed Warehouse Stocks
  const stockData = [
    {
      warehouseId: warehouse1Id,
      productId: product1Id,
      stock: 15,
      minStockWarning: 5,
    },
    {
      warehouseId: warehouse1Id,
      productId: product2Id,
      stock: 4,
      minStockWarning: 3,
    },
    {
      warehouseId: warehouse2Id,
      productId: product1Id,
      stock: 10,
      minStockWarning: 5,
    },
    {
      warehouseId: warehouse2Id,
      productId: product3Id,
      stock: 12,
      minStockWarning: 4,
    },
  ];

  await db.insert(warehouseStocks).values(stockData).onConflictDoNothing();

  // 6. Seed Dealer Tier
  const silverTierId = "019de19f-863e-7b1d-ab3d-4539b4f9b950";
  const goldTierId = "019de19f-ecc7-71c1-a06c-2377ca8d5a33";
  const platinumTierId = "019de1a0-0705-729b-a369-9ccb56fb8a8d";

  const dealerTierData = [
    {
      id: silverTierId,
      name: "Đại lý Bạc (Silver)",
      discountPercentage: "5.00",
      minimumSpend: "50000000.00", // 50m
    },
    {
      id: goldTierId,
      name: "Đại lý Vàng (Gold)",
      discountPercentage: "10.00",
      minimumSpend: "200000000.00", // 200m
    },
    {
      id: platinumTierId,
      name: "Đại lý Bạch Kim (Platinum)",
      discountPercentage: "15.00",
      minimumSpend: "1000000000.00", // 1b
    },
  ];

  await db.insert(dealerTiers).values(dealerTierData).onConflictDoNothing();

  console.log(
    "✅ Seed completed! (Brands, Categories, Products, Warehouses, Stocks, Dealer Tiers)",
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
