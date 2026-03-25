import { delay } from "@/shared/lib/utils";
import type { NewsArticle } from "@/shared/types/common";
import { NextResponse } from "next/server";

export const revalidate = 3600;

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "news-001",
    title: "Hyundai ra mắt dòng máy phát điện công nghiệp DHY series mới",
    description:
      "Thế hệ máy phát điện 3 pha mới với công suất từ 10kVA đến 1000kVA, sử dụng động cơ diesel tiết kiệm nhiên liệu, phù hợp cho nhà máy và bệnh viện.",
    category: "Sản phẩm mới",
    date: "24/03/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    slug: "hyundai-dhy-series-ra-mat",
  },
  {
    id: "news-002",
    title: "Tối ưu hóa hệ thống điện dự phòng cho Data Center mùa cao điểm",
    description:
      "Bí quyết lựa chọn và bảo trì máy phát điện công suất lớn để đảm bảo trung tâm dữ liệu hoạt động 24/7 không gián đoạn trong mùa hè.",
    category: "Kiến thức",
    date: "20/03/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    slug: "toi-uu-dien-du-phong-data-center",
  },
];

export async function GET() {
  try {
    // ⏳ Giả lập độ trễ của Network/Database
    await delay(300);

    return NextResponse.json(
      { status: true, data: MOCK_NEWS },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ status: false, data: [] }, { status: 500 });
  }
}
