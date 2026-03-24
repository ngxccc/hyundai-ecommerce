import { delay } from "@/shared/lib/utils";
import { NextResponse } from "next/server";

const MOCK_PRODUCTS = [
  {
    id: "sku-hy-30cle",
    model: "Hyundai HY-30CLE",
    name: "Máy phát điện chạy xăng 2.3kW cho gia đình",
    specs: ["2.3kW", "Xăng"],
    price: 150000000,
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/MAY-PHAT-DIEN-HYUNDAI-HY-30CLE-1-600x600.jpg",
  },
  {
    id: "sku-hy-7000le",
    model: "Hyundai HY-7000LE",
    name: "Máy phát điện chạy xăng 5kW cho gia đình văn phòng",
    specs: ["5kW", "Xăng"],
    price: 25000000,
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/MAY-PHAT-DIEN-hyundai-hy-7000le-nn-dai-dien-1-600x600.jpg",
  },
  {
    id: "sku-hpg1000l",
    model: "HPgreen HPG1000L",
    name: "Bộ lưu điện cho gia đình, văn phòng HPgreen HPG1000L - Pin Lithium",
    specs: ["1.2kW", "Online Double Conversion"],
    price: 18500000,
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2022/07/Tram-sac-du-phong-di-dong-HPgreen-HPG1000L-Pin-Lithium-cong-suat-600W-600x600.png",
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
