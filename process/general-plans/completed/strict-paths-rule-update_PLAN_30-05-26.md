# Strict Paths Rule Update Plan

Date: 30-05-26
Complexity: Simple
Status: ✅ VERIFIED

## Overview

Theo hướng dẫn của Antigravity CLI, mặc định AI sẽ luôn cố gắng tạo các file `implementation_plan.md`, `task.md`, và `walkthrough.md` trong thư mục nội bộ `<appDataDir>`. File `strict-paths.md` hiện tại đã chặn điều này nhưng lại yêu cầu tạo `[feature]_REPORT_[...].md` khi hoàn thành, dẫn đến việc dư thừa file và không phản ánh đúng triết lý "Single Source of Truth" (SSOT) của hệ thống hiện hành (nơi mà file PLAN chính là nơi duy nhất để theo dõi checklist và status).

Mục tiêu của kế hoạch này là cập nhật lại `process/riper5-plugin/rules/strict-paths.md` để:

1. Nhấn mạnh việc **không tạo** các file `task.md` hay `walkthrough.md` dư thừa.
2. Ép buộc sử dụng file `*_PLAN_*.md` làm **Single Source of Truth** xuyên suốt từ lúc PLAN đến lúc EXECUTE và VERIFY. Các cập nhật tiến độ phải được đánh dấu trực tiếp vào file PLAN này.
3. Chỉ tạo Report khi thực sự nằm trong quy trình "Multi-phase program" đặc thù.

## Touchpoints

- `process/riper5-plugin/rules/strict-paths.md`
- `process/context/all-context.md` (để reference)
- `process/context/tests/all-tests.md` (để reference)

## Public Contracts

- Các Agent (kể cả Antigravity) sẽ tuân thủ nghiêm ngặt việc không tự ý sinh file rác vào `appDataDir`.
- Khi EXECUTE, AI sẽ mở file PLAN tương ứng ra và tick vào checklist thay vì tạo `task.md`.

## Blast Radius

- Meta-rules. Ảnh hưởng đến behavior của chính AI trong tương lai, giúp tránh tạo file rác và tập trung tracking vào 1 file duy nhất. Không ảnh hưởng code logic của app.

## Verification Evidence

- File `strict-paths.md` được viết lại súc tích, nhấn mạnh "Single Source of Truth".
- Lệnh `node .claude/skills/ag-generate-plan/scripts/validate-plan-artifact.mjs` chạy qua mượt mà cho plan này.

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

## Acceptance Criteria

- [x] File `strict-paths.md` được ghi đè hoàn toàn.
- [x] Nội dung mới của `strict-paths.md` CẤM tạo file vào `.gemini/antigravity-cli/brain/` và `<appDataDir>/brain/`.
- [x] Nội dung mới nhấn mạnh việc dùng trực tiếp file `*_PLAN_*.md` hiện tại làm Single Source of Truth cho checklist/task tracking.
- [x] Không yêu cầu tạo `REPORT` ở cuối phase cho các công việc bình thường.

## Implementation Checklist

- [x] Xoá nội dung cũ của `process/riper5-plugin/rules/strict-paths.md`.
- [x] Cập nhật nội dung mới nhấn mạnh triết lý "Single Source of Truth" vào file PLAN, tuyệt đối cấm sử dụng `task.md` hay `walkthrough.md` trong `<appDataDir>`.
- [x] Chờ User xác nhận ✅ VERIFIED.

## Resume and Execution Handoff

- Executor sẽ sử dụng công cụ `replace_file_content` hoặc `write_to_file` với cờ `Overwrite: true` để thay thế toàn bộ nội dung của `strict-paths.md`.

## Cursor + RIPER-5 Guidance

- Đang ở chế độ `[MODE: PLAN]`. Chờ User phê duyệt để chuyển sang `[MODE: EXECUTE]`.
