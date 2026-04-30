import { db } from "./index";
import { products } from "./schemas/product.schema";

async function seed() {
  console.log("🌱 Seeding database...");

  const seedProducts = [
    {
      name: "Máy phát điện Hyundai DHY-5000LE",
      slug: "may-phat-dien-hyundai-dhy-5000le",
      price: "12500000",
      description:
        "Máy phát điện chạy dầu diesel Hyundai DHY-5000LE, công suất 5kVA, đề nổ điện, có bánh xe di chuyển tiện lợi.",
      shortDescription: "Máy phát điện diesel 5kVA, đề điện, di chuyển dễ dàng",
      images: ["https://cdn.example.com/hyundai-dhy-5000le-1.jpg"],
      specs: { power: "5kVA", engine: "Diesel 186FA", weight: "95kg" },
      brand: "Hyundai",
      totalStockCache: 25,
      isQuoteOnly: false,
    },
    {
      name: "Máy phát điện Mitsubishi MGE-10000",
      slug: "may-phat-dien-mitsubishi-mge-10000",
      price: "28900000",
      description:
        "Máy phát điện công nghiệp Mitsubishi MGE-10000, công suất 10kVA, động cơ Mitsubishi chất lượng cao.",
      shortDescription: "Máy phát điện công nghiệp 10kVA",
      images: ["https://cdn.example.com/mitsubishi-mge-10000-1.jpg"],
      specs: { power: "10kVA", engine: "Mitsubishi S4S", weight: "185kg" },
      brand: "Mitsubishi",
      totalStockCache: 8,
      isQuoteOnly: false,
    },
    {
      name: "Máy phát điện Hyundai DHY-8500LE",
      slug: "may-phat-dien-hyundai-dhy-8500le",
      price: "18900000",
      description:
        "Máy phát điện diesel Hyundai DHY-8500LE công suất 8.5kVA, đề nổ điện, có hệ thống AVR ổn định điện áp.",
      shortDescription: "Máy phát điện 8.5kVA, đề điện, AVR",
      images: ["https://cdn.example.com/hyundai-dhy-8500le-1.jpg"],
      specs: { power: "8.5kVA", engine: "Diesel 192FA", weight: "125kg" },
      brand: "Hyundai",
      totalStockCache: 15,
      isQuoteOnly: false,
    },
  ];

  await db.insert(products).values(seedProducts).onConflictDoNothing();

  console.log("✅ Seed completed! (3 products)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
