# Product Feature Pre-Merge Audit

Date: 29-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Kế hoạch này nhằm mục đích rà soát tổng thể (audit) toàn bộ luồng tính năng Quản lý Sản phẩm (Products) trên nhánh `feature/products-manage` trước khi merge vào `main`. Mục tiêu là phát hiện các thiếu sót về UI, API, Database (đặc biệt là tính năng lọc Specs vừa tối ưu) và Unit Test để đảm bảo hệ thống vận hành hoàn hảo trên Production, tuân thủ chặt chẽ kiến trúc trong `process/context/all-context.md`.

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

- **Phase 1: DB & Service Audit**
  - Rà soát các Migration của Drizzle xem đã sinh đủ file SQL cho các Expression Indexes chưa.
  - Chạy toàn bộ Unit test trong `product.service.test.ts`.
- **Phase 2: Admin UI & Server Actions Audit**
  - Kiểm tra `product.actions.ts` xem đã map đúng kiểu dữ liệu với Drizzle (JSONB specs) chưa.
  - Review lại `product-filters.tsx` xem các param (power, min vol) đã được push đúng lên URL chưa.
- **Phase 3: Storefront & Build Audit**
  - Chạy thử `bun run build` toàn cục để post-phase testing.
  - Chạy `bun run lint`.

## Acceptance Criteria

- [x] Tất cả Unit Test của `product.service.ts` đều xanh (Passed).
- [x] Form tạo/sửa sản phẩm ở Admin bắt được lỗi Validation (Zod).
- [x] Có báo cáo (Report) xác nhận nhánh `feature/products-manage` đã sẵn sàng để merge.
- [x] Post-phase testing thành công bằng các bài kiểm tra được liệt kê trong `process/context/tests/all-tests.md`.

## Implementation Checklist

### Phase 1: DB & Backend

- [x] (Research) Kiểm tra xem Drizzle migrations đã được generate cho các index mới chưa.
- [x] (Execute) Chạy lệnh `bun test packages/database/src/services/product.service.test.ts`.
- [x] (Review) Đọc file `product.actions.ts` xem luồng gọi `this.db` có đúng chuẩn `Fat Service` không.

### Phase 2: Frontend (Admin & Storefront)

- [x] (Research) Đọc file `apps/admin/src/features/products/components/product-filters.tsx` để xem việc map params.
- [x] (Execute) Kiểm tra logic Zod schemas tại `packages/database/src/validators/product.validators.ts`.

### Phase 3: CI / CD Gates

- [x] (Execute) Chạy `bun run lint`.
- [x] (Execute) Chạy `bun run build`.

## Touchpoints

- `packages/database/src/services/product.service.ts`
- `packages/database/src/schemas/product.schema.ts`
- `apps/admin/src/features/products/*`

## Public Contracts

- Không thay đổi Schema hay API trong lần audit này.

## Blast Radius

- Nếu merge khi chưa check kỹ, tính năng lọc JSONB (Specs) có thể crash database trên production do lỗi ép kiểu.

## Verification Evidence

- Log kết quả của `bun test` và `bun run build`.

## Resume and Execution Handoff

- Sau khi được User duyệt Plan, Executor sẽ chuyển sang `[MODE: EXECUTE]` để tự động chạy các bước trong Checklist.

## Cursor + RIPER-5 Guidance

- RIPER-5: PLAN (đang ở đây) → User Approve → EXECUTE.
