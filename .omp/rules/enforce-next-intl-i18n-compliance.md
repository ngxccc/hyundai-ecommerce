---
name: enforce-next-intl-i18n-compliance
description: "Enforce next-intl i18n compliance and forbid hardcoded UI strings or static metadata in admin and storefront"
condition:
  [
    "export const metadata: Metadata = {",
    "<FormLabel>Tên pháp lý",
    "toast.success\\(\\\"[^\\\"]*thành công",
    "Cấu hình thông tin công ty",
  ]
scope: ["tool:write", "tool:edit"]
---

# Enforce next-intl i18n Compliance in Frontend Apps

Hardcoded UI text, Vietnamese string literals, hardcoded static `metadata`, or raw toast message strings are strictly forbidden in `admin/` and `storefront/`.

## Mandatory Standards

1. **Dynamic Metadata**:
   - Use `generateMetadata({ params })` with `getTranslations({ locale, namespace })` instead of static `export const metadata: Metadata = { title: ... }`.

2. **Server Components & Pages**:
   - Use `getTranslations("<namespace>")` from `next-intl/server` to fetch localized strings and pass them as props or render them directly.

3. **Client Components & Forms**:
   - Use `useTranslations("<namespace>")` from `next-intl` for all card titles, labels, placeholders, buttons, and toast notifications (e.g. `toast.success(t("messages.successUpdate"))`).

4. **Message Dictionaries**:
   - Define all translation keys symmetrically in both `messages/vi.json` and `messages/en.json` under appropriate namespaces before referencing them in components.
