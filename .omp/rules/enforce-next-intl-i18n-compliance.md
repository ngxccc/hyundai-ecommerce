---
name: enforce-next-intl-i18n-compliance
description: "Use next-intl for all UI strings, dynamic metadata, and toast messages in admin and storefront"
condition:
  [
    "export\\s+const\\s+metadata:\\s*Metadata\\s*=\\s*\\{",
    "toast\\.(?:success|error|info|warning)\\s*\\(\\s*[\"'][^\"']+[\"']\\s*\\)",
  ]
scope:
  [
    "tool:write(admin/app/**)",
    "tool:edit(admin/app/**)",
    "tool:write(admin/src/**)",
    "tool:edit(admin/src/**)",
    "tool:write(storefront/app/**)",
    "tool:edit(storefront/app/**)",
    "tool:write(storefront/src/**)",
    "tool:edit(storefront/src/**)",
  ]
---

# Frontend next-intl Standards

Use next-intl for all user-visible strings in `admin/` and `storefront/`:

1. **Metadata**: `generateMetadata({ params })` calling `getTranslations({ locale, namespace })`.
2. **Server Components**: `getTranslations("<namespace>")` from `next-intl/server`.
3. **Client Components**: `useTranslations("<namespace>")` from `next-intl` (labels, placeholders, toasts: `toast.success(t("messages.success"))`).
4. **Dictionaries**: Add keys symmetrically to both `messages/vi/*.json` and `messages/en/*.json`.
