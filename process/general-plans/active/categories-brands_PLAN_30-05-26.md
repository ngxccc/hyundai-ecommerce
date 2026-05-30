# PLAN: Categories & Brands Management

Date: 30-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Dựa trên Roadmap mới cập nhật, tính năng ưu tiên số 1 cần thực hiện là **Categories & Brands Management**.
Sản phẩm của dự án là thiết bị máy móc công nghiệp, do đó việc phân loại (Category) và gắn thương hiệu (Brand) là dữ liệu cơ bản (Master Data) bắt buộc phải có trước khi có thể khởi tạo Sản phẩm.
Pha này tập trung vào việc xây dựng bộ CRUD (Create, Read, Update, Delete) cho bảng `categories` và `brands` trên Admin Dashboard.

## Touchpoints

- **Context & Protocols**:
  - `process/context/all-context.md`
  - `process/context/tests/all-tests.md`
- **Database Layer (`packages/database`)**:
  - `src/validators/category.validators.ts` (NEW)
  - `src/validators/brand.validators.ts` (NEW)
  - `src/services/category.service.ts` (Update methods: `create`, `update`, `delete`)
  - `src/services/brand.service.ts` (Update methods: `create`, `update`, `delete`)
- **Admin App Layer (`apps/admin`)**:
  - `src/features/categories/` (Actions, Components, Types)
  - `src/features/brands/` (Actions, Components, Types)
  - `app/[locale]/(dashboard)/categories/page.tsx` (NEW)
  - `app/[locale]/(dashboard)/brands/page.tsx` (NEW)

## Public Contracts

- **Zod Schema:** Dùng làm single source of truth để validate form ở client và server (Server Actions).
- **Fat Service:** Bất cứ thao tác nào chạm vào Database (`db.insert`, `db.update`, `db.delete`) đều phải nằm trong Service layer. Server Actions chỉ gọi Service.
- **DataGrid UI:** Sử dụng chung pattern hiển thị bảng (Datagrid), phân trang (Pagination) đã được định nghĩa ở tính năng Products Listing trước đó.

## Blast Radius

- Đây là tính năng độc lập, thêm mới routes `/categories` và `/brands` nên không gây ảnh hưởng đến phần Dashboard Overview hay Products Listing hiện hữu.
- Các Service hiện tại của Brand và Category chỉ có hàm `getAll()` nên việc thêm mới method không gây lỗi compatibility.

## Proposed Changes

### 1. Database & Validators (Backend Layer)

- Tạo Zod schema cho việc Insert và Update Category/Brand.
- Bổ sung các phương thức CRUD vào `CategoryService` và `BrandService`. Lưu ý xử lý lỗi trùng `slug` (Unique Constraint) bằng cách trả về custom error message.

### 2. Admin UI & Actions (Frontend Layer)

- Tạo Server Actions tương ứng (VD: `createCategoryAction`, `updateBrandAction`).
- Dựng UI trang Listing (`/categories`, `/brands`) dạng Table/DataGrid.
  - Luôn sử dụng các component của shadcn ui nếu có thể.
  - Cài các component cần thiết ở packages/ui bằng lệnh `bun shadcn add -y <component-name>`.
- Dựng UI Modal/Dialog (hoặc Page riêng rẽ) để hiển thị Form Thêm/Sửa.
- Tích hợp `react-hook-form` + `@hookform/resolvers/zod` với các Input Component sẵn có.
- Khai báo đa ngôn ngữ (i18n) cho Label, Placeholder, Error Messages.

## Verification Evidence

- [x] Tham khảo `process/context/tests/all-tests.md` để áp dụng post-phase testing.
- [x] Tham khảo code của `apps/admin/src/features/products` để động bộ code.
- [x] Automated tests: Bổ sung Unit Test cho các hàm mới trong `category.service.test.ts` và `brand.service.test.ts` (Create thành công, Update thành công, Lỗi trùng slug).
- [x] Chạy `bun test src/` trong thư mục `packages/database` đảm bảo Pass 100%.

## Acceptance Criteria

- [x] Admin truy cập `/categories` và `/brands` thấy được danh sách dữ liệu (từ `seed.ts` cũ).
- [x] Mở Form thêm mới, validate các trường bắt buộc (name, slug).
- [x] Lưu thành công và danh sách tự động cập nhật.
- [x] Xóa thành công (hoặc báo lỗi nếu category/brand đang được Product sử dụng - Database đang dùng `onDelete: "set null"`, nên có thể an toàn xóa).

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:

- ⏳ PLANNED - Chưa bắt đầu
- 🔨 CODE DONE - Đã viết code nhưng chưa test E2E
- 🧪 TESTING - Đang test
- ✅ VERIFIED - Đã test và User xác nhận hoạt động

## Implementation Checklist

- [ ] Step 0: Đọc, tham khảo code mẫu, các file trước đó để có thể đồng bộ dự án
- [x] Step 1: Tạo Validator & Update DB Services (`packages/database`).
- [x] Step 2: Tạo Server Actions (`apps/admin`).
- [x] Step 3: Tạo UI Forms & Listing Components.
- [x] Step 4: Gắn vào Next.js Routes và cấu hình i18n.
- [x] Step 5: Bổ sung Tests và Validate.

## Resume and Execution Handoff

Executor sẽ bắt đầu từ Step 1 (Backend Layer). Lưu ý tham khảo cấu trúc file của `product.service.ts` và thư mục `features/products` để tái sử dụng convention. Sau đó tuân thủ `process/context/tests/all-tests.md` cho post-phase testing.
Tiếp theo, hãy chuyển sang chế độ EXECUTE.

---

**User Review Required:**
Bạn có đồng ý tiến hành triển khai tính năng **Categories & Brands Management** theo bản Plan này không? Nếu đồng ý, vui lòng phản hồi **"go"** để tiến hành.
