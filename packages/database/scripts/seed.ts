import { db } from "../src/index";
import { brands } from "../src/schemas/brand.schema";
import { categories } from "../src/schemas/category.schema";
import { products } from "../src/schemas/product.schema";
import { warehouses } from "../src/schemas/warehouse.schema";
import { warehouseStocks } from "../src/schemas/warehouse-stock.schema";
import { dealerTiers } from "../src/schemas";
import { users } from "../src/schemas/auth.schema";
import { orders, orderItems } from "../src/schemas/order.schema";
import { quotes, quoteItems, quoteMessages } from "../src/schemas/quotes.schema";

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
      descriptionVi: "Thương hiệu máy phát điện uy tín từ Hàn Quốc",
      descriptionEn: "Reputable generator brand from South Korea",
      isActive: true,
    },
    {
      id: mitsubishiId,
      name: "Mitsubishi",
      slug: "mitsubishi",
      logo: "https://cdn.example.com/mitsubishi.png",
      descriptionVi: "Máy phát điện công nghiệp cao cấp Nhật Bản",
      descriptionEn: "Premium industrial generators from Japan",
      isActive: true,
    },
    {
      id: kubotaId,
      name: "Kubota",
      slug: "kubota",
      logo: "https://cdn.example.com/kubota.png",
      descriptionVi: "Máy phát điện diesel Nhật Bản chất lượng cao",
      descriptionEn: "High-quality Japanese diesel generators",
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
      nameVi: "Máy phát điện",
      nameEn: "Generators",
      slug: "may-phat-dien",
      parentId: null,
      descriptionVi: "Tất cả các loại máy phát điện",
      descriptionEn: "All types of generators",
      image: null,
      isActive: true,
    },
    {
      id: childCat1Id,
      nameVi: "Máy phát điện gia đình",
      nameEn: "Household Generators",
      slug: "may-phat-dien-gia-dinh",
      parentId: parentCatId,
      descriptionVi: "Máy phát điện dùng cho gia đình, văn phòng",
      descriptionEn: "Generators for home and office use",
      image: null,
      isActive: true,
    },
    {
      id: childCat2Id,
      nameVi: "Máy phát điện công nghiệp",
      nameEn: "Industrial Generators",
      slug: "may-phat-dien-cong-nghiep",
      parentId: parentCatId,
      descriptionVi: "Máy phát điện công suất lớn cho nhà máy, công trường",
      descriptionEn: "High-power generators for factories and construction sites",
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
      nameVi: "Máy phát điện Hyundai DHY-5000LE",
      nameEn: "Hyundai DHY-5000LE Generator",
      slug: "may-phat-dien-hyundai-dhy-5000le",
      price: "12500000",
      descriptionVi: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Máy phát điện chạy dầu diesel Hyundai DHY-5000LE, công suất 5kVA, đề nổ điện, có bánh xe di chuyển tiện lợi.",
              },
            ],
          },
        ],
      },
      descriptionEn: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Hyundai DHY-5000LE diesel generator, 5kVA capacity, electric starter, equipped with convenient wheels.",
              },
            ],
          },
        ],
      },
      shortDescriptionVi: "Máy phát điện diesel 5kVA, đề điện",
      shortDescriptionEn: "5kVA diesel generator, electric starter",
      images: ["https://cdn.example.com/hyundai-dhy-5000le-1.jpg"],
      brandId: hyundaiId,
      categoryId: childCat1Id,
      specs: { power: 5, engine: "Diesel 186FA", weight: 95 },
      totalStockCache: 25,
      isQuoteOnly: false,
    },
    {
      id: product2Id,
      nameVi: "Máy phát điện Mitsubishi MGE-10000",
      nameEn: "Mitsubishi MGE-10000 Generator",
      slug: "may-phat-dien-mitsubishi-mge-10000",
      price: "28900000",
      descriptionVi: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Máy phát điện công nghiệp Mitsubishi MGE-10000, công suất 10kVA, động cơ Mitsubishi chất lượng cao.",
              },
            ],
          },
        ],
      },
      descriptionEn: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Mitsubishi MGE-10000 industrial generator, 10kVA capacity, high-quality Mitsubishi engine.",
              },
            ],
          },
        ],
      },
      shortDescriptionVi: "Máy phát điện công nghiệp 10kVA",
      shortDescriptionEn: "10kVA industrial generator",
      images: ["https://cdn.example.com/mitsubishi-mge-10000-1.jpg"],
      brandId: mitsubishiId,
      categoryId: childCat2Id,
      specs: { power: 10, engine: "Mitsubishi S4S", weight: 185 },
      totalStockCache: 8,
      isQuoteOnly: false,
    },
    {
      id: product3Id,
      nameVi: "Máy phát điện Kubota GL-6500",
      nameEn: "Kubota GL-6500 Generator",
      slug: "may-phat-dien-kubota-gl-6500",
      price: "21500000",
      descriptionVi: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Máy phát điện diesel Kubota GL-6500 công suất 6.5kVA, động cơ Kubota bền bỉ, tiết kiệm nhiên liệu.",
              },
            ],
          },
        ],
      },
      descriptionEn: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Kubota GL-6500 diesel generator, 6.5kVA capacity, durable and fuel-efficient Kubota engine.",
              },
            ],
          },
        ],
      },
      shortDescriptionVi: "Máy phát điện Kubota 6.5kVA",
      shortDescriptionEn: "Kubota 6.5kVA generator",
      images: ["https://cdn.example.com/kubota-gl-6500-1.jpg"],
      brandId: kubotaId,
      categoryId: childCat1Id,
      specs: { power: 6.5, engine: "Kubota Z482", weight: 112 },
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
      nameVi: "Kho Hà Nội",
      nameEn: "Hanoi Warehouse",
      streetAddress: "Số 12, Ngõ 45, Đường Nguyễn Xiển",
      district: "Thanh Xuân",
      city: "Hà Nội",
      isActive: true,
    },
    {
      id: warehouse2Id,
      nameVi: "Kho TP.HCM",
      nameEn: "HCM Warehouse",
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
      nameVi: "Đại lý Bạc",
      nameEn: "Silver Dealer",
      discountPercentage: "5.00",
      minimumSpend: "50000000.00", // 50m
    },
    {
      id: goldTierId,
      nameVi: "Đại lý Vàng",
      nameEn: "Gold Dealer",
      discountPercentage: "10.00",
      minimumSpend: "200000000.00", // 200m
    },
    {
      id: platinumTierId,
      nameVi: "Đại lý Bạch Kim",
      nameEn: "Platinum Dealer",
      discountPercentage: "15.00",
      minimumSpend: "1000000000.00", // 1b
    },
  ];

  await db.insert(dealerTiers).values(dealerTierData).onConflictDoNothing();

  // 7. Seed B2B & regular users
  const user1Id = "019de1a0-1234-71bf-8082-ec510823ed3c";
  const user2Id = "019de1a0-5678-71bf-8082-f37ae97f09e4";
  const user3Id = "019de1a0-9012-735c-8639-3e1d67c3f6c5";

  const userData = [
    {
      id: user1Id,
      name: "Nguyễn Văn Hùng (Nhật Năng Partner)",
      email: "hung.nguyen@nhatnangpartner.vn",
      emailVerified: true,
      role: "dealer" as const,
      dealerTierId: goldTierId,
      phone: "0912.345.678",
      companyName: "Công ty Cổ phần Cơ điện Miền Nam",
      taxId: "0314567890",
      businessType: "dealer" as const,
      province: "Thành phố Hồ Chí Minh",
    },
    {
      id: user2Id,
      name: "Trần Thanh Sơn",
      email: "son.tran@vietnamconstruct.com",
      emailVerified: true,
      role: "dealer" as const,
      dealerTierId: silverTierId,
      phone: "0987.654.321",
      companyName: "Tổng Công ty Xây dựng Việt Nam",
      taxId: "0107894561",
      businessType: "contractor" as const,
      province: "Hà Nội",
    },
    {
      id: user3Id,
      name: "Lê Minh Tâm",
      email: "tam.le@gmail.com",
      emailVerified: false,
      role: "customer" as const,
      phone: "0909.123.456",
      businessType: "end_user" as const,
      province: "Đà Nẵng",
    },
  ];

  await db.insert(users).values(userData).onConflictDoNothing();

  // 8. Seed Orders
  const order1Id = "019de1a0-aaaa-761e-bb91-7c6ecf6377d8";
  const order2Id = "019de1a0-bbbb-761e-bb91-825a77b45568";
  const order3Id = "019de1a0-cccc-761e-bb91-84a024241fd3";
  const order4Id = "019de1a0-dddd-761e-bb91-9ccb56fb8a8d";

  const orderData = [
    {
      id: order1Id,
      userId: user1Id,
      status: "pending" as const,
      shippingFee: "150000.00",
      shippingAddress: "302/105 Phan Huy Ích, Phường 12, Quận Gò Vấp, TP. Hồ Chí Minh",
      totalAmount: "46650000.00", // (12,500,000 * 2) + (21,500,000 * 1) + 150,000 = 46,650,000
    },
    {
      id: order2Id,
      userId: user2Id,
      status: "processing" as const,
      shippingFee: "250000.00",
      shippingAddress: "Số 12, Ngõ 45, Đường Nguyễn Xiển, Quận Thanh Xuân, Hà Nội",
      totalAmount: "29150000.00", // (28,900,000 * 1) + 250,000 = 29,150,000
    },
    {
      id: order3Id,
      userId: user3Id,
      status: "shipped" as const,
      shippingFee: "100000.00",
      shippingAddress: "45 Lê Lợi, Quận Hải Châu, Thành phố Đà Nẵng",
      totalAmount: "12600000.00", // (12,500,000 * 1) + 100,000 = 12,600,000
    },
    {
      id: order4Id,
      userId: user1Id,
      status: "delivered" as const,
      shippingFee: "200000.00",
      shippingAddress: "Khu công nghiệp Amata, Biên Hòa, Đồng Nai",
      totalAmount: "64700000.00", // (21,500,000 * 3) + 200,000 = 64,700,000
    },
  ];

  await db.insert(orders).values(orderData).onConflictDoNothing();

  // 9. Seed Order Items
  const orderItemData = [
    // Order 1 Items
    {
      orderId: order1Id,
      productId: product1Id,
      productName: "Máy phát điện Hyundai DHY-5000LE",
      productSku: "DHY-5000LE",
      quantity: 2,
      unitPrice: "12500000.00",
    },
    {
      orderId: order1Id,
      productId: product3Id,
      productName: "Máy phát điện Kubota GL-6500",
      productSku: "GL-6500",
      quantity: 1,
      unitPrice: "21500000.00",
    },
    // Order 2 Items
    {
      orderId: order2Id,
      productId: product2Id,
      productName: "Máy phát điện Mitsubishi MGE-10000",
      productSku: "MGE-10000",
      quantity: 1,
      unitPrice: "28900000.00",
    },
    // Order 3 Items
    {
      orderId: order3Id,
      productId: product1Id,
      productName: "Máy phát điện Hyundai DHY-5000LE",
      productSku: "DHY-5000LE",
      quantity: 1,
      unitPrice: "12500000.00",
    },
    // Order 4 Items
    {
      orderId: order4Id,
      productId: product3Id,
      productName: "Máy phát điện Kubota GL-6500",
      productSku: "GL-6500",
      quantity: 3,
      unitPrice: "21500000.00",
    },
  ];

  await db.insert(orderItems).values(orderItemData).onConflictDoNothing();

  // 10. Seed B2B Quotes
  console.log("🌱 Seeding mock B2B quotes...");

  const product1Price = 12500000;
  const product2Price = 28900000;

  const quote1Id = "019de1a0-9999-4000-8000-000000000001";
  await db
    .insert(quotes)
    .values({
      id: quote1Id,
      userId: user1Id,
      status: "pending_review",
      note: "Cần báo giá gấp 2 chiếc máy phát điện Hyundai để đấu thầu công trình.",
    })
    .onConflictDoNothing();

  await db
    .insert(quoteItems)
    .values({
      id: "019de1a0-9999-4000-8000-000000000101",
      quoteId: quote1Id,
      productId: product1Id,
      quantity: 2,
      requestedPrice: (product1Price * 0.9).toFixed(2),
    })
    .onConflictDoNothing();

  await db
    .insert(quoteMessages)
    .values({
      id: "019de1a0-9999-4000-8000-000000000201",
      quoteId: quote1Id,
      senderId: user1Id,
      message: "Chào anh chị, nhờ anh chị báo giá tốt giúp em dự án này, em cần gấp trong ngày.",
    })
    .onConflictDoNothing();

  const quote2Id = "019de1a0-9999-4000-8000-000000000002";
  await db
    .insert(quotes)
    .values({
      id: quote2Id,
      userId: user2Id,
      status: "negotiating",
      note: "Yêu cầu chiết khấu thêm cho máy phát điện Kubota.",
    })
    .onConflictDoNothing();

  const requestedPrice2 = (product2Price * 0.85).toFixed(2);
  const agreedPrice2 = (product2Price * 0.92).toFixed(2);

  await db
    .insert(quoteItems)
    .values({
      id: "019de1a0-9999-4000-8000-000000000102",
      quoteId: quote2Id,
      productId: product2Id,
      quantity: 1,
      requestedPrice: requestedPrice2,
      agreedPrice: agreedPrice2,
    })
    .onConflictDoNothing();

  await db
    .insert(quoteMessages)
    .values({
      id: "019de1a0-9999-4000-8000-000000000202",
      quoteId: quote2Id,
      senderId: user2Id,
      message: `Bên em muốn đề xuất giá ${parseFloat(requestedPrice2).toLocaleString("vi-VN")} VND cho máy Máy phát điện Mitsubishi MGE-10000.`,
    })
    .onConflictDoNothing();

  await db
    .insert(quoteMessages)
    .values([
      {
        id: "019de1a0-9999-4000-8000-000000000203",
        quoteId: quote2Id,
        senderId: user2Id,
        message: `[SYSTEM] Trạng thái báo giá chuyển sang: Đang thương lượng (negotiating)`,
      },
      {
        id: "019de1a0-9999-4000-8000-000000000204",
        quoteId: quote2Id,
        senderId: user2Id,
        message: `[SYSTEM] Đã cập nhật giá thương lượng cho sản phẩm "Máy phát điện Mitsubishi MGE-10000" thành ${parseFloat(agreedPrice2).toLocaleString("vi-VN")} VND`,
      },
    ])
    .onConflictDoNothing();

  console.log(
    "✅ Seed completed! (Brands, Categories, Products, Warehouses, Stocks, Dealer Tiers, Users, Orders, Order Items, Quotes)",
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
