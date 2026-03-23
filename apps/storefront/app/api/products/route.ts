import type { Product } from "@/shared/types/common";
import { NextResponse } from "next/server";

export async function GET() {
  // Mock data - Mốt thay cái này bằng logic: await db.products.findMany()
  const mockProducts: Product[] = [
    {
      id: "sku-250kva",
      model: "HY-250KVA",
      name: "Máy Phát Điện 250kVA",
      specs: ["250kVA", "Dầu diesel"],
      price: 150000000,
      imageUrl: "/may-phat-dien-1.jpg",
    },
    {
      id: "sku-7kw",
      model: "HY-7500LE",
      name: "Máy Phát Điện 7.5kW",
      specs: ["7.5kW", "Xăng"],
      price: 25000000,
      imageUrl: "/may-phat-dien-1.jpg",
    },
    {
      id: "sku-3kva",
      model: "HY-3KVA-UPS",
      name: "Bộ Lưu Điện 3kVA",
      specs: ["3kVA", "Online Double Conversion"],
      price: 18500000,
      imageUrl: "/may-phat-dien-1.jpg",
    },
  ];

  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockProducts);
}
