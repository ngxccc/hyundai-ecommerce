# Github Actions Paths Filter Migration Plan

Date: 30-05-26
Complexity: Medium
Status: ✅ VERIFIED

## Overview

Hiện tại, các luồng CD của Admin, Storefront, và Docs đang sử dụng cấu hình `paths:` mặc định của GitHub Actions trên sự kiện `push` vào branch `main`. Tuy nhiên, vì giới hạn của GitHub khi tính toán diff trong trường hợp `rebase` hoặc force push, CD có thể bị bỏ qua (skipped) nếu commit trên cùng không chứa thay đổi nằm trong `paths:`.

Kế hoạch này sẽ chuyển đổi 3 file CD sang sử dụng [dorny/paths-filter](https://github.com/dorny/paths-filter). Tool này giúp phân tích chính xác những thay đổi trên toàn bộ các commits được đẩy lên, từ đó trigger job một cách ổn định, ngay cả khi rebase.

## Touchpoints

- `.github/workflows/admin.yml`
- `.github/workflows/storefront.yml`
- `.github/workflows/docs.yml`
- (File `pr.yml` dùng sự kiện `pull_request` nên không bị ảnh hưởng bởi lỗi này và sẽ được giữ nguyên).

## Public Contracts

- Lịch sử trigger của các CD sẽ trở thành:
  - Job `changes` sẽ LUÔN CHẠY mỗi khi có push vào `main`. Job này chạy rất nhanh.
  - Job `deploy` (hoặc `docs-pipeline`) sẽ CHỈ CHẠY nếu Job `changes` phát hiện có thay đổi trong danh sách path.
- Các path cũ vẫn được giữ nguyên không thay đổi logic.

## Blast Radius

- Mọi nhánh push vào `main` sẽ đều đi qua Job filter trước.
- Không thay đổi môi trường, bí mật (secrets) hay bất kỳ token nào của Vercel/Turbo.
- Workflow sẽ an toàn hơn và không bao giờ bị miss CD nữa.

## Acceptance Criteria

- [x] Xoá cấu trúc `paths:` trong sự kiện `push` ở 3 file yml.
- [x] Thêm Job `changes` sử dụng `dorny/paths-filter@v3` trên đầu danh sách `jobs:`.
- [x] Cấu hình đúng `needs: changes` và `if:` cho các Job chính.
- [x] Cú pháp file yml hợp lệ, không bị lỗi thụt lề (indentation).

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

## Implementation Checklist

- [x] Chỉnh sửa `.github/workflows/admin.yml`
- [x] Chỉnh sửa `.github/workflows/storefront.yml`
- [x] Chỉnh sửa `.github/workflows/docs.yml`
- [x] Đợi User đồng ý ✅ VERIFIED.

## Resume and Execution Handoff

- Executor sẽ sử dụng công cụ thay thế nội dung (replace_file_content) để cấu trúc lại các block YAML cẩn thận, tránh lỗi indent đặc thù của `.yml`.

## Cursor + RIPER-5 Guidance

- Đang ở chế độ `[MODE: PLAN]`. Chờ User phê duyệt để chuyển sang `[MODE: EXECUTE]`.
