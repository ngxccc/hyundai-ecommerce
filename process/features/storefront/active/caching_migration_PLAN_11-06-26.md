# Caching Migration Plan: Next.js 16 Cache Components

**Date**: 11-06-26 (June 11, 2026)
**Complexity**: COMPLEX
**Implementation Approach**: Component-level Caching via 'use cache' and cacheLife
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing

## Overview

Di chuyển hệ thống cache của ứng dụng `storefront` từ mô hình Next.js cấu hình Route-level cũ (`revalidate = 3600`, `dynamic = "force-dynamic"`) sang mô hình **Cache Components của Next.js 16** mới sử dụng chỉ thị `'use cache'`, hàm `cacheLife`, và `cacheTag` để tối ưu hóa hiệu năng render tĩnh, tăng tốc TTFB và bảo mật luồng dữ liệu DB.

**Status**: ⏳ PLANNED

---

## Quick Links

- [Context and Goals](#1-context-and-goals)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Phased Delivery Plan](#phased-delivery-plan)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Implementation Checklist](#implementation-checklist)

---

## 1. Context and Goals

Hiện tại, ứng dụng `storefront` đang sử dụng cấu hình revalidate ở cấp độ route/page (ví dụ: `export const revalidate = 3600`), buộc Next.js phải cache hoặc revalidate toàn bộ trang HTML. Mô hình này không tương thích với flag `cacheComponents: true` của Next.js 16, vốn yêu cầu kiểm soát caching hạt nhân hơn (granular) ở mức hàm dữ liệu.

Tham khảo tài liệu cấu trúc thư mục tại `process/context/all-context.md` để nắm bắt kiến trúc tổng quan.

Mục tiêu của đợt refactor này:

- Kích hoạt thành công `'use cache'` trên Next.js 16.2.9.
- Loại bỏ toàn bộ cấu hình revalidate/dynamic cấp độ route để vượt qua sự kiểm duyệt nghiêm ngặt của Turbopack.
- Caching trực tiếp các truy vấn database (RSC direct DB access) thông qua chỉ thị `'use cache'`, loại bỏ việc gọi API qua HTTP (`fetchApi`) ở server-side để giảm độ trễ (network latency) và bypass lỗi build-time HTTP fetch.

---

## Touchpoints

Các tệp tin chịu ảnh hưởng trực tiếp:

1. **`apps/storefront/next.config.ts`**: Kích hoạt `cacheComponents: true`.
2. **`apps/storefront/app/[locale]/page.tsx`**: Loại bỏ `dynamic = "force-static"`.
3. **`apps/storefront/app/[locale]/(shop)/products/[slug]/page.tsx`**: Loại bỏ `revalidate = 3600`.
4. **`apps/storefront/app/[locale]/(shop)/products/category/[slug]/page.tsx`**: Loại bỏ `revalidate = 3600`.
5. **`apps/storefront/app/[locale]/[...rest]/page.tsx`**: Loại bỏ `revalidate = 3600`.
6. **`apps/storefront/app/api/categories/route.ts`**: Loại bỏ `revalidate = 3600`.
7. **`apps/storefront/app/api/news/route.ts`**: Loại bỏ `revalidate = 3600`.
8. **`apps/storefront/app/api/products/route.ts`**: Loại bỏ `dynamic = "force-dynamic"`.
9. **`apps/storefront/app/api/products/metadata/route.ts`**: Loại bỏ `revalidate = 3600`.
10. **`apps/storefront/app/api/promotions/route.ts`**: Loại bỏ `revalidate = 3600`.
11. **`apps/storefront/src/shared/services/category.service.ts`**: Chuyển đổi sang truy vấn DB trực tiếp kết hợp `'use cache'` và `cacheLife("hours")`.
12. **`apps/storefront/src/shared/services/product.service.ts`**: Loại bỏ hack `isProductionBuild` và `BUILD_TIME_PRODUCTS`, dùng truy vấn DB trực tiếp kết hợp `'use cache'`.
13. **`apps/storefront/src/shared/services/news.service.ts`**: Cập nhật `'use cache'`.
14. **`apps/storefront/src/shared/services/promo.service.ts`**: Cập nhật `'use cache'`.

---

## Public Contracts

- **API Endpoints**: `/api/categories`, `/api/products`, `/api/news`, `/api/promotions` tiếp tục trả về dữ liệu JSON có cấu trúc y hệt cho Client-side fetch.
- **Routing URL**: Giữ nguyên toàn bộ cấu trúc URL tĩnh và URL động của các trang.
- **i18n & Locales**: Khả năng đa ngôn ngữ (`vi`, `en`) không thay đổi.

---

## Blast Radius

- **Phạm vi ảnh hưởng**: Trung bình (Medium). Chỉ tác động đến tầng nạp dữ liệu (Data Fetching Layer) của `storefront`, không ảnh hưởng tới UI hay Logic Nghiệp vụ.
- **Khả năng rollback**: Cao. Chỉ cần revert thay đổi trong 14 file và khôi phục lại config cũ trong `next.config.ts`.
- **Rủi ro build-time**: Nếu database kết nối thất bại tại build-time, quá trình pre-render trang tĩnh sẽ lỗi. Tuy nhiên, kết nối database Neon hiện đã ổn định trong CI/CD.

---

## Phase Completion Rules

Mỗi Phase chỉ được coi là hoàn thành khi đáp ứng các điều kiện sau:

1. Không có lỗi TypeScript (`check-types`) và ESLint (`lint`) xuất hiện trong các tệp tin được chỉnh sửa.
2. Mã nguồn được test cục bộ và hoạt động đúng logic cũ.
3. Khi hoàn thành toàn bộ các phase, bắt buộc chạy build production thành công.

---

## Acceptance Criteria

1. Dự án build thành công (`bun run build`) với flag `cacheComponents: true` được kích hoạt mà không bị Turbopack chặn.
2. Tất cả các trang tĩnh (SSG/ISR) được Next.js pre-render chuẩn xác tại build-time sử dụng dữ liệu thực từ Database thay vì mock data.
3. Client-side fetch qua API routes hoạt động bình thường, trả về cùng cấu trúc JSON cũ.

---

## Phased Delivery Plan

### Phase 1: Kích hoạt compiler & Dọn dẹp Route Config cũ

- **Nội dung**: Thêm `cacheComponents: true` vào `next.config.ts`. Xóa toàn bộ dòng `export const revalidate` và `export const dynamic` ở 9 routes/APIs nêu trên để vượt qua lỗi trình biên dịch.
- **Mục tiêu**: Project check-types qua và chạy được chế độ dev mà không gặp lỗi "Route segment config not compatible".

### Phase 2: Refactor local service layer và tích hợp 'use cache'

- **Nội dung**: Refactor các file service trong `apps/storefront/src/shared/services/`:
  - Thay vì dùng `fetchApi` gọi qua HTTP nội bộ, import trực tiếp services của `@nhatnang/database/services`.
  - Gắn chỉ thị `'use cache'` ở đầu các hàm service.
  - Sử dụng hàm `cacheLife("hours")` hoặc `cacheLife("days")` để định cấu hình thời hạn cache.
- **Mục tiêu**: Loại bỏ hoàn toàn hack `isProductionBuild` / `BUILD_TIME_PRODUCTS` giúp build tĩnh chính xác dữ liệu thực tế từ DB.

### Phase 3: Đồng bộ API Routes

- **Nội dung**: Cập nhật các API routes để tái sử dụng trực tiếp các hàm service đã được cached ở Phase 2, đảm bảo dữ liệu trả về giống hệt cấu trúc cũ.
- **Mục tiêu**: Client-side fetch qua API vẫn chạy mượt mà.

### Phase 4: Kiểm thử và Phát hành

- **Nội dung**: Chạy kiểm tra TypeScript (`check-types`), chạy lint (`lint`) và tiến hành build production (`bun run build`).
- **Mục tiêu**: Ứng dụng build thành công với 0 lỗi, tạo ra các trang tĩnh tối ưu thông qua Next.js 16 Caching.

---

## Verification Evidence

### Post-Phase Testing & Verification

Chúng ta sẽ thực hiện kiểm thử tự động theo các tiêu chuẩn trong `process/context/tests/all-tests.md`:

- **Kiểm tra kiểu dữ liệu**:

  ```bash
  bun turbo run check-types --filter=storefront
  ```

- **Kiểm tra chuẩn code (Linting)**:

  ```bash
  bun turbo run lint --filter=storefront
  ```

- **Kiểm tra build production (Trọng tâm)**:

  ```bash
  bun turbo run build --filter=storefront
  ```

  _Yêu cầu:_ Quá trình build hoàn thành thành công và hiển thị danh sách các trang tĩnh (SSG/ISR) hoạt động bình thường dưới cơ chế Cache Components.

---

## Resume and Execution Handoff

### Hướng dẫn tiếp tục thực hiện (RIPER-5 Handoff)

- Nhánh làm việc: `storefront/phase-2-product-catalog`
- Để thực hiện triển khai mã nguồn, người chạy kế tiếp hãy chuyển sang **EXECUTE MODE** bằng cách gõ:

  ```text
  ENTER EXECUTE MODE
  ```

---

## Implementation Checklist

### Phase 1: Configuration & Route Cleanup

- [ ] Kích hoạt `cacheComponents: true` trong `apps/storefront/next.config.ts`
- [ ] Xóa `revalidate`/`dynamic` khỏi `app/[locale]/page.tsx`
- [ ] Xóa `revalidate` khỏi `app/[locale]/(shop)/products/[slug]/page.tsx`
- [ ] Xóa `revalidate` khỏi `app/[locale]/(shop)/products/category/[slug]/page.tsx`
- [ ] Xóa `revalidate` khỏi `app/[locale]/[...rest]/page.tsx`
- [ ] Xóa `revalidate` khỏi `app/api/categories/route.ts`
- [ ] Xóa `revalidate` khỏi `app/api/news/route.ts`
- [ ] Xóa `dynamic` khỏi `app/api/products/route.ts`
- [ ] Xóa `revalidate` khỏi `app/api/products/metadata/route.ts`
- [ ] Xóa `revalidate` khỏi `app/api/promotions/route.ts`

### Phase 2: Local Service Layer & DB Query Caching

- [ ] Refactor `apps/storefront/src/shared/services/category.service.ts` sử dụng `'use cache'` và DB trực tiếp.
- [ ] Refactor `apps/storefront/src/shared/services/product.service.ts` sử dụng `'use cache'` và DB trực tiếp.
- [ ] Refactor `apps/storefront/src/shared/services/news.service.ts` sử dụng `'use cache'` và DB trực tiếp.
- [ ] Refactor `apps/storefront/src/shared/services/promo.service.ts` sử dụng `'use cache'` và DB trực tiếp.

### Phase 3: API Route Refactoring

- [ ] Đồng bộ hóa các API routes để gọi các cached local services.

### Phase 4: Final QA & Build

- [ ] Chạy check-types
- [ ] Chạy lint
- [ ] Chạy build production thành công
