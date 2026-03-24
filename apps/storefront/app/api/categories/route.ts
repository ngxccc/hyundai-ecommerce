import { delay } from "@/shared/lib/utils";
import { NextResponse } from "next/server";

const MOCK_CATEGORIES_DB = [
  {
    id: "cat_01",
    slug: "industrial",
    name: "Industrial Power",
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/MAY-PHAT-DIEN-CONG-NGHIEP-HYUNDAI-NHAT-NANG-vn-1-600x600.jpg",
    description: "Máy phát điện công nghiệp công suất lớn",
  },
  {
    id: "cat_02",
    slug: "household",
    name: "Household Setup",
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/may-phat-dien-12kva-3pha-co-vo-cach-am-DHY-12500Se-1.jpg",
    description: "Giải pháp điện dự phòng cho gia đình",
  },
  {
    id: "cat_03",
    slug: "ups",
    name: "UPS Systems",
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2020/11/UPS-HYUNDAI-HD-KT9-3-600x600.jpg",
    description: "Bộ lưu điện liên tục chống sập nguồn",
  },
  {
    id: "cat_04",
    slug: "hpgreen",
    name: "HPGreen Energy",
    imageUrl:
      "https://hyundainhatnang.vn/wp-content/uploads/2022/07/Tram-sac-du-phong-600W-HPgreen-2-600x600.png",
    description: "Năng lượng xanh thân thiện môi trường",
  },
];

export async function GET() {
  try {
    await delay(800);

    return NextResponse.json(
      {
        status: true,
        data: MOCK_CATEGORIES_DB,
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
