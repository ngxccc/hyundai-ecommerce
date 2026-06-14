import { cacheLife } from "next/cache";
import type { PromoCampaign } from "@nhatnang/shared";

export const MOCK_PROMOTIONS: PromoCampaign[] = [
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

export const promoService = {
  getPromos: async (): Promise<PromoCampaign[]> => {
    "use cache";
    cacheLife("hours");
    return await Promise.resolve(MOCK_PROMOTIONS.filter((p) => p.isActive));
  },
};
