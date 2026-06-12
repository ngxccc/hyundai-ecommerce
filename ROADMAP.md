# 🗺️ BẢN ĐỒ DỰ ÁN: Hyundai E-Commerce (hyundai-ecommerce)

> **Tuyên ngôn dự án (Mission):** Xây dựng hệ thống thương mại điện tử phân phối máy phát điện Hyundai chính hãng tại Việt Nam, tối ưu hóa SEO vượt trội, tốc độ tải trang cực nhanh nhờ Next.js 16 PPR (Partial Prerendering) và kiến trúc Monorepo bền vững.

---

## 🎯 Đích đến hiện tại (Active Milestone)
*Tập trung hoàn thành giai đoạn tối ưu hóa Catalog và cấu trúc cơ sở dữ liệu.*

### Cột mốc 2: Hoàn thiện Product Catalog & Đa ngôn ngữ (Phase 2 Catalog)
- [x] Đồng bộ hệ thống chịu lỗi: Cài đặt `error.tsx` và `global-error.tsx` cho Storefront.
- [x] Tối ưu hóa hiệu năng LCP (Largest Contentful Paint) bằng cách nén ảnh hệ thống và cấu hình `priority` cho các ảnh trên nếp gấp (above-the-fold).
- [x] Đồng bộ hóa định dạng tham số sắp xếp danh mục từ snake_case (`price_asc`) sang camelCase (`priceAsc`).
- [ ] Di chuyển các truy vấn SQL trực tiếp từ Storefront sang các lớp dịch vụ cache của Database (`@nhatnang/database`).
- [ ] Thiết kế cơ sở dữ liệu đa ngôn ngữ: Chuyển đổi định dạng schema từ lưu trữ JSONB sang dạng cột song hành (`name_vi`, `name_en`).
- [ ] Tích hợp DTO Mapping Layer để xử lý dữ liệu đầu ra giữa Database và Storefront.

---

## 📋 3 Đầu việc tiếp theo (Next 3 Actions)
*Chỉ chọn tối đa 3 việc từ Cột mốc hiện tại để làm ngay. Không ôm đồm.*
1. 🏃 **[Đang làm]** Tách biệt các truy vấn SQL trực tiếp trong `sitemap.ts` và `/api/products/metadata` vào lớp dịch vụ cache.
2. 🔄 **[Kế tiếp]** Refactor `getStaticProductSlugs` để fetch slug qua hàm `productService.getAllActiveSlugs()`.
3. 🔄 **[Kế tiếp]** Đánh giá chi tiết phương án dịch chuyển schema trong `multilingual-db-and-dto-architecture_PLAN_12-06-26.md`.

---

## 🚀 Lộ trình dài hạn (Future Milestones)
*Các cột mốc tiếp theo dưới dạng lát cắt dọc (Vertical Slices).*

*   **Cột mốc 3: Hoàn thiện Luồng Khách Hàng Doanh Nghiệp (B2B & CRM)**
    *   Tối ưu hóa form đăng ký B2B doanh nghiệp và kiểm thực trường dữ liệu.
    *   Đồng bộ dữ liệu khách hàng vào phân hệ CRM nội bộ.
    *   Hệ thống phân quyền khách hàng sỉ/lẻ.
*   **Cột mốc 4: Tích hợp Hệ thống Secret Management & Security Audit**
    *   Chuyển đổi biến môi trường sang Doppler để quản lý tập trung.
    *   Thực hiện đợt rà soát bảo mật toàn diện (OWASP & CSP).
*   **Cột mốc 5: Hệ thống Đặt hàng & Tracking đơn hàng**
    *   Tính năng giỏ hàng lưu trữ Database đồng bộ đa thiết bị.
    *   Trang Checkout và tích hợp cổng thanh toán nội địa.

---

## 🧊 Hộp đóng băng ý tưởng (Idea Icebox / Backlog)
*⚠️ Khu vực lưu trữ ý tưởng mới phát sinh. Tuyệt đối không code ngay để tránh lan man (Scope Creep).*

- [ ] Tính năng đề xuất máy phát điện phù hợp công suất tiêu thụ bằng AI Chatbot.
- [ ] So sánh thông số kỹ thuật chi tiết giữa nhiều mẫu máy phát điện cùng phân khúc.
- [ ] Tải file PDF catalogue thông số kỹ thuật trực tiếp từ trang chi tiết sản phẩm.
- [ ] Hệ thống tự động tính toán chi phí vận chuyển & lắp đặt tận nơi theo vị trí địa lý.
