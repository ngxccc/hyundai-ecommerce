import { delay } from "@/shared/lib/utils";
import { NextResponse } from "next/server";

const MOCK_PRODUCTS = [
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

export async function GET() {
  try {
    // Mock data - Mốt thay cái này bằng logic: await db.products.findMany()
    await delay(500);

    return NextResponse.json(
      {
        status: true,
        data: MOCK_PRODUCTS,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: 500 },
    );
  }
}
