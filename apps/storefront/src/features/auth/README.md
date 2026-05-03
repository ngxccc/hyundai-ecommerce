# Registration Flow Implementation Guide

**Mục đích:** File này giúp các Agent (và developer) biết **đọc file nào trước** khi muốn làm gì liên quan đến Registration Form.

---

## 1. Cấu trúc hiện tại (đã chuẩn theo AGENTS.md)

```text
features/auth/
├── actions/
│   └── register.action.ts          ← Server action
├── components/
│   ├── register-form.tsx           ← Form chính
│   ├── personal-info-section.tsx   ← Section 1
│   ├── business-info-section.tsx   ← Section 2 (có useWatch + conditional UI)
│   ├── password-section.tsx        ← Section 3
│   └── terms-section.tsx           ← Section 4
└── schemas/
    └── auth.schema.ts              ← Zod schema
```

---

## 2. Khi muốn làm gì → Đọc file nào

| Muốn làm gì                                      | Đọc file nào trước                                                                 |
|--------------------------------------------------|------------------------------------------------------------------------------------|
| Hiểu toàn bộ flow Registration                 | `README.md` (file này) + `register-form.tsx`           |
| Sửa validation / thêm field mới                | `schemas/auth.schema.ts`                                                           |
| Sửa UI một section (Personal / Business / ...) | `components/*.tsx`                                                       |
| Thay đổi logic submit (gọi API / Server Action)| `register-form.tsx` (hàm onSubmit) + `actions/register.action.ts`                 |
| Thêm i18n text mới                             | `messages/en.json` và `messages/vi.json` (section "Register")                    |
| Hiểu React Hook Form best practice             | `web-forms-react-hook-form/SKILL.md` + `reference.md`                             |
| Xem ví dụ useWatch + conditional UI            | `components/business-info-section.tsx`                                            |
| Xem ví dụ FormStateSubscribe / performance     | `web-forms-react-hook-form/examples/performance.md`                               |

---

## 3. Trình tự triển khai (đã hoàn thành 80%)

1. **Schema** → `schemas/auth.schema.ts`
2. **Components** → 5 file section + `register-form.tsx` (đã refactor theo AGENTS.md: named export, useWatch, Field component, no hardcode)
3. **Action** → `actions/register.action.ts` ← **ĐANG LÀM** (bạn đang đọc đây)
4. **i18n** → Cập nhật `messages/en.json` + `vi.json` (đã có phần Register)
5. **Test** → Chạy form và kiểm tra validation + submit

---

## 4. Trạng thái hiện tại (May 2026)

- Form UI: **Hoàn chỉnh** (dùng shadcn Field + useWatch + conditional rendering)
- Validation: **Hoàn chỉnh** (Zod + superRefine + discriminatedUnion)
- Submit: **Chưa thực tế** (chỉ mock console.log + toast)
- **Cần làm ngay:** Implement `register.action.ts` dùng **Better Auth Server Action**

---

## 5. Hướng dẫn implement Action (Bước tiếp theo)

1. Tạo file `features/auth/actions/register.action.ts`
2. Import `auth` từ `@nhatnang/database` (Better Auth instance)
3. Validate lại bằng Zod (bảo mật)
4. Gọi `auth.api.signUpEmail()` hoặc `authClient.signUp.email()`
5. Xử lý error từ Better Auth
6. Trả về kết quả cho client

**Lưu ý quan trọng:**

- Dùng **Server Action** (`"use server"`)
- Không hardcode error message → dùng key i18n
- B2B fields (companyName, taxId, businessType, province) nên được lưu vào bảng `user` hoặc bảng riêng (nếu schema đã hỗ trợ)

---

**File này sẽ được cập nhật khi có thay đổi lớn về flow.**

---

*Last updated: May 03, 2026*
