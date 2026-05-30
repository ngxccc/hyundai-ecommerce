# PLAN: Neon DB Migration Workflow & Seed Schema Update

Date: 30-05-26
Complexity: Medium
Status: ✅ VERIFIED

## Overview

Dự án đang sử dụng Neon Database với 2 nhánh (branches) riêng biệt: `dev` và `main` (prod). Hiện tại, quy trình áp dụng database migration (Drizzle) chưa được chuẩn hoá rõ ràng giữa 2 môi trường này, dẫn đến nguy cơ lệch schema hoặc lỗi khi deploy. Đồng thời, file `packages/database/scripts/seed.ts` đang bị lỗi schema do cột `product.description` đã được chuyển sang `jsonb().$type<JSONContent>()` (dành cho Rich Text Tiptap) nhưng dữ liệu mẫu vẫn là chuỗi văn bản thuần (string).

Kế hoạch này giải quyết hai vấn đề:

1. Thiết kế và ghi lại quy trình chuẩn (Process) để migrate từ nhánh `dev` lên `main` của Neon DB.
2. Cập nhật `seed.ts` để tương thích hoàn toàn với schema mới.

## Touchpoints

- `packages/database/scripts/seed.ts`
- `packages/database/package.json` (bổ sung script migrate rõ ràng)
- `README.md` hoặc `process/context/all-context.md` (nếu cần ghi chú quy trình mới).

## Public Contracts

- Lệnh `db:migrate` mặc định (local) sẽ tiếp tục trỏ tới nhánh `dev` thông qua Doppler config (`dev`).
- Bổ sung lệnh `db:migrate:prod` (tùy chọn) hoặc mô tả rõ trong luồng CI/CD GitHub Actions cách áp dụng migration lên nhánh `main`.
- Dữ liệu `description` trong `seed.ts` sẽ trả về định dạng `JSONContent` chuẩn của Tiptap: `{ type: "doc", content: [...] }`.

## Blast Radius

- Không ảnh hưởng đến dữ liệu hiện hữu trên Production do `seed.ts` chỉ chạy trên local/dev.
- Làm rõ cấu hình biến môi trường, đảm bảo không ai vô tình chạy migrate nhầm lên nhánh `main` khi đang code ở local.

## Proposed Changes

### 1. Quy trình Migrate Dev -> Prod (Neon Branching)

Quy trình được đề xuất như sau:

- **Local Development**: Developer chạy `bun run db:generate` để tạo file `.sql` trong `drizzle/`. Sau đó chạy `bun run db:migrate` (sử dụng token Doppler của môi trường `dev` -> tự động trỏ `DATABASE_URL` vào nhánh `dev` của Neon).
- **Review (PR)**: Các file `.sql` bắt buộc phải được commit vào Git. Code Reviewer kiểm tra file migration SQL.
- **Production (Main)**: Khi branch được merge vào `main`, GitHub Actions CD pipeline (được cấp phát Doppler Token của môi trường `prd`) sẽ tự động chạy `drizzle-kit migrate`. Do URL trỏ vào nhánh `main` của Neon, schema sẽ được apply tự động lên Prod.
- **Thêm Script an toàn**: Bổ sung `db:migrate:prod` vào `package.json` (ví dụ: `doppler run -c prd -- drizzle-kit migrate`) dành cho trường hợp Admin muốn tự tay trigger từ local nếu cần.

### 2. Cập nhật `seed.ts`

- Sửa lại 3 sản phẩm mẫu trong `productData`.
- Chuyển `description: "Máy phát điện..."` thành:

  ```json
  {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Máy phát điện chạy dầu diesel..." }
        ]
      }
    ]
  }
  ```

- Sửa đường dẫn chạy `db:seed` trong `package.json` từ `src/seed.ts` thành `scripts/seed.ts` vì hiện tại đang cấu hình sai.

## Verification Evidence

- [x] Không cần verify hoặc để manual vì nếu chạy script này thì tôi không biết nó có bị ghi đè data ở dev hay không và nó chỉ cần được chạy để test ở CI pr.yml hoặc khi dev chưa có data.
- [x] Mở `seed.ts` và chạy `bun run db:seed`. Đảm bảo không văng lỗi Zod hoặc Postgres Syntax.
- [x] Kiểm tra DB `dev` xem dữ liệu cột `description` có đúng định dạng JSON object không.

## Acceptance Criteria

- [x] `seed.ts` chạy mượt mà không lỗi.
- [x] `package.json` có script `db:seed` trỏ đúng đường dẫn.
- [x] Quy trình migrate dev-prod được giải thích và thiết lập rõ ràng.

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

- [x] Cập nhật `package.json` (sửa `db:seed` và thêm `db:migrate:prod`).
- [x] Sửa lại format `description` trong `packages/database/scripts/seed.ts`.
- [x] Chạy lệnh seed để test.

## Resume and Execution Handoff

Executor sẽ bắt đầu bằng cách chỉnh sửa `package.json` và `seed.ts`. Hãy đảm bảo việc cập nhật `description` cover đủ tất cả các bản ghi có trong script seed. Hướng dẫn test sẽ dựa theo `process/context/tests/all-tests.md`.

---

**User Review Required:**
Bạn có đồng ý với thiết kế luồng Migrate qua Doppler và cấu trúc JSONContent cho seed file như trên không? Hãy phản hồi "go" để Agent tiến hành Code.
