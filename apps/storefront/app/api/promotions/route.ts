import { delay } from "@/shared/lib/utils";
import type { PromoCampaign } from "@/shared/types/common";
import { NextResponse } from "next/server";

const MOCK_PROMOTIONS: PromoCampaign[] = [
  {
    id: "promo-001",
    badge: "Flash Sale",
    title: "Black Friday",
    subtitle: "Sập Sàn Toàn Hệ Thống",
    description: "Mua 1 tặng 1 cho tất cả sản phẩm, chỉ trong 48 giờ",
    discount: "-50%",
    ctaText: "Săn ngay",
    ctaLink: "/products",
    isActive: true,
    themeColor: "primary",
  },
  {
    id: "promo-002",
    badge: "Khuyến Mãi",
    title: "Hè Rực Rỡ",
    subtitle: "Giảm Tới 30%",
    description: "Thanh toán qua tài khoản ngân hàng được giảm thêm 10%",
    discount: "-30%",
    ctaText: "Xem chi tiết",
    ctaLink: "/products",
    isActive: true,
    themeColor: "secondary",
  },
];

export async function GET() {
  try {
    // Mock data - Mốt thay cái này bằng logic: await db.promotions.findFirst({ where: { isActive: true } })
    await delay(300);

    const activePromo = MOCK_PROMOTIONS.filter((p) => p.isActive) ?? null;

    return NextResponse.json(
      {
        status: true,
        data: activePromo,
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
