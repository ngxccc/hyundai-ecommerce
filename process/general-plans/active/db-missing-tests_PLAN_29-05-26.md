# Database Missing Services Tests Plan

Date: 29-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Dự án đã có Unit Tests cho `auth.service.ts` và `product.service.ts` nhưng vẫn còn 5 file Service quan trọng trong gói `@nhatnang/database` chưa có test. Kế hoạch này nhằm bổ sung đầy đủ Unit Tests (`bun:test`) cho 5 services còn lại (Brand, Category, Order, User, Warehouse-Stock) để đảm bảo độ bao phủ (coverage) và tính ổn định.

## Quick Links

- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Implementation Checklist](#implementation-checklist)

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
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

## Execution Brief

- **Phase 1: Basic Services (Brand & Category)**
  - Viết Unit test mock `this.db.query` sử dụng `bun:test` và `mock()` cho `brand.service.ts` và `category.service.ts`.
- **Phase 2: Complex Services (User, Order, Warehouse-Stock)**
  - Viết Test cho `user.service.ts`.
  - Viết Test cho `order.service.ts` (kiểm tra luồng liên quan đến logic đơn hàng nếu có).
  - Viết Test cho `warehouse-stock.service.ts` (đảm bảo logic cộng trừ tồn kho được test).
- **Phase 3: Validation & CI**
  - Chạy `bun test packages/database/src/services` để đảm bảo 100% tests passed.

## Acceptance Criteria

- [x] Tất cả 5 file `*.service.test.ts` đều được tạo và co-located đúng thư mục `packages/database/src/services`.
- [x] Toàn bộ các phương thức public trong 5 services đều có ít nhất 1 test case.
- [x] Lệnh `bun test` trong `packages/database` phải Passed toàn bộ mà không báo lỗi Type hay Mocking.
- [x] Tuân thủ `process/context/tests/all-tests.md` khi chạy test.

## Implementation Checklist

### Phase 1: Basic Services

- [x] Khởi tạo file `brand.service.test.ts`.
- [x] Khởi tạo file `category.service.test.ts`.
- [x] Chạy `bun test` cho 2 file này.

### Phase 2: Complex Services

- [x] Khởi tạo file `user.service.test.ts`.
- [x] Khởi tạo file `order.service.test.ts`.
- [x] Khởi tạo file `warehouse-stock.service.test.ts`.
- [x] Chạy `bun test` cho 3 file này.

### Phase 3: Validation

- [x] Chạy `bun run lint` ở root để đảm bảo chuẩn ESLint (đặc biệt không dính lỗi `unsafe-assignment`).
- [x] Chạy `bun test` ở `packages/database` để gom nhóm toàn bộ.

## Touchpoints

- `packages/database/src/services/brand.service.ts`
- `packages/database/src/services/category.service.ts`
- `packages/database/src/services/order.service.ts`
- `packages/database/src/services/user.service.ts`
- `packages/database/src/services/warehouse-stock.service.ts`

## Public Contracts

- Không thay đổi bất kỳ business logic nào, chỉ Mock DB và Test. Tuân thủ `process/context/all-context.md`.

## Blast Radius

- Không có rủi ro đối với Production vì đây chỉ là Test.

## Verification Evidence

- Console log Output của `bun test` hiển thị số Test Suites và Tests thành công.

## Resume and Execution Handoff

- Executor cần xem file `product.service.test.ts` hoặc `auth.service.test.ts` để học cách mock Drizzle Database Client của dự án trước khi viết test mới.
- Sau khi User xác nhận, chuyển sang [MODE: EXECUTE] để code Phase 1.

## Cursor + RIPER-5 Guidance

- RIPER-5: PLAN (đang ở đây) → User Approve → EXECUTE.
