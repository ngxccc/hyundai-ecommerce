# Product Filters Reset Plan

Date: 30-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Hiện tại, trang quản lý Product của Admin đang có rất nhiều bộ lọc (Category, Brand, Status, Fuel Type, Phase, Specs, Quote Only, v.v.). Tuy nhiên, người dùng chưa có nút để bấm xoá nhanh toàn bộ các bộ lọc này mà phải xoá thủ công. Tính năng "Reset Filter" sẽ bổ sung một nút bấm giúp xoá toàn bộ query params trên URL và làm rỗng các local state (ô input/select) trên giao diện.

## Touchpoints

- `apps/admin/src/features/products/components/product-filters.tsx`
- `apps/admin/messages/vi.json`
- `apps/admin/messages/en.json`
- `process/context/all-context.md` (tham chiếu quy chuẩn chung)
- `process/context/tests/all-tests.md` (tham chiếu quy chuẩn test)

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working by User
- 🚧 BLOCKED - Has issues

## Public Contracts

- Component `ProductFilters` sẽ có thêm một button "Reset Filters" (có icon 🔄 hoặc ✖️) để huỷ toàn bộ bộ lọc.
- Sử dụng hàm `router.push(pathname)` kết hợp làm rỗng các state: `searchTerm`, `engineBrand`, `alternatorBrand`, `minPower`, `maxPower`, `voltage`. (Các trường select dùng URL Params nên `router.push` không parameter sẽ tự reset).

## Blast Radius

- Tính năng này chỉ ảnh hưởng đến UI Component `ProductFilters` trên app Admin. An toàn 100%, không dính dáng đến API hay Database.

## Verification Evidence

- Giao diện Product Filters có thêm một nút Reset (Ghost hoặc Outline button).
- Khi click, tất cả Inputs text bị làm rỗng, tất cả các Selects về "All", và checkbox Quote Only bị uncheck. URL không còn query parameters.

## Resume and Execution Handoff

- Lập trình viên (`Executor`) cần:
  1. Vào file `product-filters.tsx`.
  2. Khai báo hàm `handleResetFilters()`.
  3. Render nút `Button` (từ `@nhatnang/ui/components/ui/button`) gọi hàm `handleResetFilters()`.
  4. Vào 2 file ngôn ngữ (`vi.json` và `en.json`) tìm object `AdminProducts.filters` và thêm field `"resetFilters": "Xoá bộ lọc"` / `"Reset filters"`.

## Acceptance Criteria

- [x] Tính năng xoá filter hoạt động đúng trên trình duyệt: URL sạch sẽ, UI reset về rỗng/"all".
- [x] Nút Reset có thiết kế phù hợp (Ghost/Outline) và có tooltips/text đúng với i18n.
- [x] Post-phase testing thành công (kiểm tra manual trên trình duyệt theo `process/context/tests/all-tests.md`).

## Implementation Checklist

- [x] Bổ sung dịch ngôn ngữ `"resetFilters"` vào `vi.json` và `en.json`.
- [x] Cập nhật `product-filters.tsx` với hàm `handleResetFilters` và render Button reset.
- [x] Xác nhận tính năng trên trình duyệt cùng user để đánh dấu ✅ VERIFIED.

## Cursor + RIPER-5 Guidance

- Chế độ hiện tại: `PLAN`.
- Chờ User phản hồi (vd: `go`, `ok`). Sau khi nhận được đồng ý, chuyển sang chế độ `EXECUTE`.
