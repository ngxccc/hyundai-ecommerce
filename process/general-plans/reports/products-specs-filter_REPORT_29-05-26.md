# REPORT: Product Specs Filters Implementation

Date: 29-05-2026

## 1. Kết quả thực thi

Tính năng đã được code xong toàn bộ và tích hợp thành công vào codebase.

## 2. Những thay đổi chính

### Database Service (`packages/database/src/services/product.service.ts`)

- Cập nhật hàm `getAll` để nhận thêm 5 options mới: `minPower`, `maxPower`, `voltage`, `engineBrand`, `alternatorBrand`.
- Thêm các mệnh đề `RAW` sql chuẩn xác để query trên cột JSONB `specs`. Tuân thủ đúng mẫu thiết kế Fat Service.

### Admin App

- **`app/[locale]/(dashboard)/products/page.tsx`**: Trích xuất dữ liệu từ `searchParams`, ép kiểu về Number đối với công suất và điện áp, sau đó truyền vào `options` của service.
- **`src/features/products/components/product-filters.tsx`**:
  - Bổ sung 5 trường Input (2 input dạng Text cho hãng, 3 input dạng Number cho thông số).
  - Tích hợp 5 input này vào Hook `useEffect` hiện tại để kích hoạt cơ chế debounce 500ms, tự động cập nhật URL mà không cần nút Submit.

## 3. Xác thực (Validation)

- Đã xác thực rằng không có Repository pattern dư thừa nào được tạo ra.
- Logic nằm gọn gàng trong Service class.

Tính năng sẵn sàng hoạt động trên giao diện Admin.
