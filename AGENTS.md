# AGENTS.md - Hyundai Ecommerce Project

## Project Overview

- **Type**: B2B E-commerce platform for industrial equipment (Hyundai, Mitsubishi, Kubota generators)
- **Architecture**: Turborepo monorepo with Next.js 16 App Router
- **Main Apps**:
  - `apps/storefront` — Customer-facing B2B website
  - `apps/docs` — Technical documentation (Fumadocs)
- **Shared Packages**:
  - `packages/database` — Drizzle ORM + Better Auth schemas
  - `packages/types`, `packages/typescript-config`, `packages/eslint-config`

## Core Principles (MUST FOLLOW)

### 1. Server vs Client Components

- **Default**: Use Server Components (`"use server"` implicit)
- Only add `"use client"` when absolutely necessary (hooks, browser APIs, state)
- Prefer Server Actions over API routes when possible

### 2. File & Folder Structure

- Use **feature-based** structure: `src/features/[feature]/`
- Components go in `components/`
- Keep `page.tsx` as thin Server Component (only layout + metadata)
- Business logic → `actions/`, `services/`, `stores/`

### 3. Component Export Style (IMPORTANT)

**Rules must follow:**

- **Page.tsx files** (ex: `register/page.tsx`, `products/[slug]/page.tsx`):

  ```tsx
  const RegisterPage = () => {
    return <div>...</div>;
  };

  export default RegisterPage;
  ```

- **Child Components / Reusable Components**:

  ```tsx
  export const RegisterForm = () => {
    return <form>...</form>;
  };
  ```

- **Không dùng** `export default` cho component con (trừ Page.tsx)
- **Luôn tách component** — không gom quá nhiều logic vào 1 file (tối đa ~150-200 dòng)

### 4. TypeScript Best Practices

#### 4.1 Type vs Interface

- **Ưu tiên `interface`** cho object shapes, props, API responses
- Chỉ dùng `type` khi cần union, intersection, hoặc mapped types

```tsx
// ✅ GOOD
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// ❌ AVOID (trừ khi cần union)
type User = {
  id: string;
  name: string;
};
```

#### 4.2 Naming Conventions cho Types

- **Interface**: `IPascalCase` (ví dụ: `IUser`, `IProduct`, `IOrder`)
- **Type**: `TPascalCase` (ví dụ: `TUserRole`, `TBusinessType`)
- **Props**: `ComponentNameProps` (ví dụ: `RegisterFormProps`, `ProductCardProps`)

#### 4.3 Function & Component Typing

```tsx
// ✅ Tốt - Arrow function với type rõ ràng
export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const handleSubmit = async (data: RegisterFormData) => {
    // ...
  };

  return <form onSubmit={handleSubmit}>...</form>;
};

// ✅ Tốt - Function declaration (cho page)
const ProductDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return <div>...</div>;
};

export default ProductDetailPage;
```

#### 4.4 Strict Type Safety

- **Không dùng `any`** trừ khi không thể tránh (phải comment lý do)
- Dùng `unknown` thay vì `any` khi không biết type
- Luôn validate input từ user/API bằng **Zod**
- Dùng `satisfies` khi cần type inference chặt chẽ

```tsx
// ✅ Tốt
const user = {
  name: "John",
  age: 30,
} satisfies User;

// ❌ Tránh
const user: any = { ... };
```

#### 4.5 Import/Export Rules

- Dùng **named exports** cho component con và utilities
- Chỉ dùng `export default` cho `page.tsx` và `layout.tsx`
- Import theo thứ tự: External → Internal → Relative
- Group imports bằng comment khi cần

```tsx
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import { registerSchema } from "@/features/auth/schemas/auth.schema";
```

#### 4.6 React Hook Form Best Practices (QUAN TRỌNG - Tránh re-render)

**Luôn ưu tiên `useWatch` thay vì `watch` hoặc `Controller`:**

- `form.watch()` → Gây re-render toàn bộ component mỗi khi field thay đổi
- `Controller` → Cô lập components → **Tối ưu hiệu năng**
- `useWatch` → Chỉ re-render component nào đang dùng field đó → **Tối ưu hiệu năng**

**✅ Đúng (dùng useWatch):**

```tsx
import { useWatch } from "react-hook-form";

export const BusinessInfoSection = ({ form }: BusinessInfoSectionProps) => {
  const businessType = useWatch({
    control: form.control,
    name: "businessType",
  });

  const isB2B = ["dealer", "contractor", "distributor"].includes(businessType);

  return (
    <div>
      {isB2B && <CompanyFields />}

      // Dùng Controller khi có thể
      <Controller
        name="businessType"
        control={form.control}
        render={({ field }) => <Select {...field} />}
      />
    </div>
  );
};
```

**❌ Tránh:**

```tsx
// Tránh dùng form.watch() trực tiếp trong component
const businessType = form.watch("businessType")
```

### 5. Styling & UI

- Use **shadcn/ui** components from `@/shared/components/ui`
- Tailwind CSS v4 + custom design system
- Follow existing component patterns in `src/features/home/components/`

### 6. Monorepo Rules (Turborepo)

- Never import directly from `apps/` into `packages/`
- Use workspace protocol: `"@nhatnang/database": "workspace:*"`
- Run commands with `bun --filter=storefront run dev`

### 7. Authentication (Better Auth)

- Always use `authClient` from `@/shared/lib/auth-client`
- Never manually hash passwords — Better Auth handles it
- Registration flow must collect: fullName, email, phone, companyName, taxId, businessType, province

### 8. Database (Drizzle)

- All queries go through `packages/database`
- Use transactions (`withTransaction`) for multi-table operations
- Never write raw SQL unless absolutely necessary

### 9. Internationalization (i18n) & Hardcoded Text (QUAN TRỌNG)

**Frontend (Next.js):**

- **Không được hardcode text** trong component.
- Tất cả chuỗi text phải được đưa vào thư mục `messages/`:
  - `messages/en.json` — English
  - `messages/vi.json` — Tiếng Việt
- Sử dụng `next-intl` hoặc tương đương để load translation.
- Ví dụ đúng:

  ```tsx
  import { useTranslations } from 'next-intl';
  const t = useTranslations('HomePage');
  <h1>{t('hero.titleLine1')}</h1>
  ```

**Backend / Packages / Shared code:**

- Tạo file riêng cho constants/messages (ví dụ: `constants.ts`, `messages.ts`, `errors.ts`).
- Không hardcode string trong logic backend.
- Dễ maintain và chuẩn bị cho i18n sau này.

## Commands

- `bun run dev` — Start all apps
- `bun --filter=storefront run dev` — Start only storefront
- `bun run build` — Build everything
- `bun run db:generate` — Generate Drizzle migrations (in packages/database)
- `bun run lint` — Run ESLint

## What NOT to do

- Do NOT create new API routes under `app/api` unless necessary (prefer Server Actions)
- Do NOT use `any` type
- Do NOT put business logic inside `page.tsx`
- Do NOT bypass shadcn/ui components
- Do NOT create huge component files (> 200 dòng) — luôn tách nhỏ
- Do NOT hardcode text in frontend components (must use `messages/` folder)
- Do NOT hardcode strings in backend/packages without dedicated constant files

## When in doubt

- Look at existing patterns in:
  - `src/features/home/components/` (good component examples)
  - `src/features/auth/` (current auth implementation)
  - `packages/database/src/schemas/` (Drizzle schema patterns)
