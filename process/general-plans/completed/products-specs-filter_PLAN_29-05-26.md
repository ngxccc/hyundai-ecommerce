# PLAN: Product Specs Filters

Date: 29-05-2026

## 1. Context

Tính năng quản lý sản phẩm (`feature/products-manage`) hiện tại đang thiếu các bộ lọc dựa trên thông số kỹ thuật (specs) của máy phát điện. Cần bổ sung các filter quan trọng nhất để giúp Admin tìm kiếm sản phẩm dễ dàng hơn.

## 2. Đề xuất Thay đổi (Proposed Changes)

### Database Service (`packages/database`)

- **[MODIFY] `src/services/product.service.ts`**:
  - Bổ sung `minPower`, `maxPower`, `engineBrand`, `alternatorBrand` vào parameter `options` của hàm `getAll`.
  - Sử dụng Drizzle `sql` RAW query để trích xuất và filter dữ liệu từ cột JSONB `specs`:
    - `specs->>'power' >= minPower`
    - `specs->>'power' <= maxPower`
    - `specs->>'engineBrand' ILIKE %engineBrand%`
    - `specs->>'alternatorBrand' ILIKE %alternatorBrand%`

### Admin App (`apps/admin`)

- **[MODIFY] `app/[locale]/(dashboard)/products/page.tsx`**:
  - Lấy `minPower`, `maxPower`, `engineBrand`, `alternatorBrand` từ `searchParams`.
  - Truyền các params này xuống `productService.getAll`.
- **[MODIFY] `src/features/products/components/product-filters.tsx`**:
  - Thêm Input nhập số cho `minPower` (KW) và `maxPower` (KW).
  - Thêm Input text cho `engineBrand` và `alternatorBrand`.
  - Tích hợp vào hàm `handleFilterChange` (đã có sẵn debounce).

## 3. Câu hỏi mở (Open Questions cho User)

1. Trong mảng máy phát điện, ngoài Công suất (Power), Động cơ (Engine Brand) và Đầu phát (Alternator Brand), bạn có muốn thêm luôn filter cho Voltage hay Phase/Fuel (đã có sẵn) không?
   - Có nhé nhưng nó đã có sẵn rồi thì bạn sẽ thêm vào kiểu gì?
2. Bạn muốn Input dạng Text tìm kiếm tự do cho Engine/Alternator, hay dạng Dropdown (Select) cố định? (Hiện tại kế hoạch đang dùng Text tự do để linh hoạt nhất).
   - Hiện tại thì cứ sử dụng Input tự do, nếu sau này có thay đổi gì sẽ đổi sau.
