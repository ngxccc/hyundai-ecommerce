# Zustand Architecture Analysis

Date: 29-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Dự án `apps/admin` hiện đang sử dụng Next.js 16 App Router, ưu tiên Server Components và URL Query Params (vd: bộ lọc sản phẩm). Mặc dù `zustand` đã được cài đặt trong `package.json`, nhưng qua quá trình rà soát, chưa có bất kỳ Client Store nào được khởi tạo. Bản phân tích này dựa trên `process/context/all-context.md` nhằm đưa ra quyết định việc giữ lại hay gỡ bỏ thư viện này.

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

- **Phase 1: Decision Making**
  - What happens: Thảo luận để chọn 1 trong 2 hướng đi (Giữ hoặc Xóa).
  - Test: N/A
  - Verify: N/A
  - Done when: User đưa ra quyết định.
- **Phase 2: Action**
  - What happens: Thực thi quyết định. Nếu xóa, gỡ `zustand` khỏi `apps/admin`. Nếu giữ, tạo file `store/README.md` để quy định rule.
  - Test: Ứng dụng vẫn build và chạy bình thường.
  - Verify: File `package.json` đã sạch (nếu xóa).
  - Done when: User xác nhận hoàn thành thông qua quá trình post-phase testing.

## 💡 Phân tích & Khuyến nghị (User Review Required)

**Tại sao Zustand đang "thất nghiệp" trong apps/admin?**

1. **Server-centric UI**: App Router khuyến khích fetch data trên Server Component.
2. **URL as State**: Các state cần share (như filter, pagination) đang được lưu trữ hoàn hảo trên URL Query Params, giúp dễ share link.
3. **Form Actions**: Các form submit đang dùng Server Actions, không cần lưu trữ state client phức tạp.

**Zustand SẼ HỮU ÍCH TRONG TƯƠNG LAI NẾU bạn làm các tính năng sau:**

1. **Bulk Selection xuyên trang (Cross-page Selection):** Chọn các hàng ở trang 1, sang trang 2 chọn thêm, và bấm "Xóa tất cả". Tính năng này không thể lưu vào URL vì payload quá lớn.
2. **Global UI State:** Trạng thái Sidebar Toggle, Global Loading Spinner overlay (nếu lưu localStorage).
3. **Multi-step Wizards phức tạp:** Form tạo sản phẩm có nhiều bước phức tạp mà không reload trang.

**=> Lời khuyên:** Hiện tại **CHƯA CẦN** dùng Zustand. Bạn nên gỡ nó ra khỏi `apps/admin` để giảm bớt 1 dependency không cần thiết (bundle size, maintainance). Lúc nào thực sự cần các tính năng phức tạp trên thì cài lại.

## Scope (In/Out)

- **In scope**: Gỡ bỏ hoặc quy hoạch lại Zustand trong `apps/admin`.
- **Out scope**: Các app khác trong monorepo.

## Acceptance Criteria

- [x] User đã xác nhận định hướng giữ hay bỏ thư viện Zustand.
- [x] Nếu quyết định bỏ: `zustand` không còn nằm trong `apps/admin/package.json` và code vẫn build được.
- [x] Post-phase testing thành công: Lệnh `bun run build` chạy pass hoàn toàn mà không lỗi module.

## Implementation Checklist

- [x] Lựa chọn phương án: Xóa `zustand` hay Giữ lại.
- [x] (Nếu xóa): Gỡ `zustand` khỏi `apps/admin/package.json`
- [ ] (Nếu giữ): Khởi tạo thư mục `apps/admin/src/store` kèm theo file hướng dẫn.
- [x] Chạy lệnh build theo `process/context/tests/all-tests.md` để post-phase testing.

## Touchpoints

- Tương tác chủ yếu với `apps/admin/package.json`.

## Public Contracts

- Không thay đổi bất kỳ hành vi công khai nào.

## Blast Radius

- **Rủi ro (Rất thấp):** Việc gỡ bỏ một thư viện chưa được dùng sẽ không ảnh hưởng gì tới tính năng đang chạy.

## Verification Evidence

- Giao diện Admin không bị crash sau khi gỡ bỏ.
- Lệnh `bun install` và `bun build` không báo lỗi dependency.

## Resume and Execution Handoff

- Executor cần đọc lời khuyên ở phần Khuyến nghị, sau đó hỏi ý kiến user trước khi tiến hành check list.

## Cursor + RIPER-5 Guidance

- RIPER-5: PLAN (đang ở đây) → User Approve → EXECUTE.
- Vui lòng chờ ý kiến của User ở Phase 1 trước khi sang Phase 2.
