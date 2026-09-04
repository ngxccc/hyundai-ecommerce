import { QuoteRequestView } from "@/features/quote/components/quote-request-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yêu cầu báo giá B2B | Hyundai Nhật Năng",
  description:
    "Gửi danh sách sản phẩm thiết bị, máy phát điện và xe thương mại Hyundai cần báo giá nhanh chóng và chính xác.",
};

export default function QuotePage() {
  return <QuoteRequestView />;
}
