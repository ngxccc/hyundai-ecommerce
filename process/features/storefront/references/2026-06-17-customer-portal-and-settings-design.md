# Design Specification: Customer Portal & Settings UI (Storefront)

**Date**: 2026-06-17
**Author**: Antigravity (Advanced Agentic Coding Agent)
**Status**: Approved (User-confirmed & Multi-Agent Predict-Reviewed)

---

## 1. Context and Goals

This design specification details the implementation of the missing B2C/B2B Customer Portal in the storefront application (`apps/storefront`). It establishes a unified dashboard for registered users to manage their profiles, update corporate details, reset passwords, and maintain a multi-address shipping book. It also details the integration of the address book during the checkout process to improve conversion rates and user experience.

### Goals

- Build a responsive Customer Portal (`/portal/*`) featuring a sidebar navigation layout.
- Implement forms for managing personal profiles and corporate details (specifically for B2B Dealers).
- Support a secure change password workflow.
- Build a multi-address management subsystem linked to the database `user_address` table.
- Integrate the address book at checkout with a quick-select auto-fill modal.
- Optimize performance using Next.js 16 `'use cache'` at the service layer and `revalidateTag` in Server Actions.

---

## 2. Architecture & Portal Layout

### 2.1 Route Guard & Session Protection
All portal routes (`/portal/*`) are protected. The route layout performs a server-side session check using BetterAuth:
- If the session is inactive, the user is redirected to `/login?callbackUrl=<current_path>`.

### 2.2 Shared Sidebar Layout (`apps/storefront/app/[locale]/(shop)/portal/layout.tsx`)
- **Desktop Grid**: Split-screen layout.
  - Left column: Responsive Sidebar navigation menu (`250px` width) with active link styling.
  - Right column: Dynamic rendering area (`{children}`).
- **Mobile Drawer**: Responsive navigation header with a Hamburger icon that toggles the sidebar as a slide-out sheet/drawer.
- **Sidebar Links**:
  1. Profile Settings (Thông tin cá nhân) -> `/portal/profile`
  2. Change Password (Đổi mật khẩu) -> `/portal/password`
  3. Address Book (Sổ địa chỉ) -> `/portal/addresses`
  4. Order History (Lịch sử đơn hàng) -> `/portal/orders`
  5. Debt Repayment (Thanh toán công nợ) -> `/portal/debt` (Visible to Dealers only)

### 2.3 Login Success Redirection
The login redirect logic inside `LoginForm` (`apps/storefront/src/features/auth/components/login-form.tsx`) is updated:
- If a `callbackUrl` exists in the URL search parameters, the user is redirected to that URL.
- If no `callbackUrl` is present, the default redirect target is the **Home Page `/`** (rather than a missing `/dashboard`), avoiding 404 errors.

---

## 3. UI Routing & Page Specs

### 3.1 Profile Page (`/portal/profile`)
- Renders user profile information: Name and Phone Number are editable; Email is read-only.
- **B2B Corporate Section**: If the user's role is `dealer_approver` or `dealer_purchaser`, displays an additional "Business Profile" section showing:
  - Company Name (Tên công ty)
  - Tax ID (Mã số thuế)
  - Business Type (Loại hình kinh doanh)
  - Province (Tỉnh/Thành phố)
- **Form Actions**: Uses `updateProfileAction` (Server Action) with React Hook Form.

### 3.2 Change Password Page (`/portal/password`)
- Renders fields: Current Password, New Password, Confirm New Password.
- Utilizes `changePasswordAction` (Server Action) to communicate securely with BetterAuth on the server.
- Shows success toast on success and redirects the user to `/login` to re-authenticate if the session is invalidated.

### 3.3 Address Book Page (`/portal/addresses`)
- Displays a grid of saved user addresses fetched via `addressService.getByUserId(userId)`.
- Renders: Recipient Name, Phone, Street Address, District, Province/City, and a badge for the Default Address.
- **Interactive Actions**:
  - **Add Address**: Button opens a Modal sheet containing the Address form.
  - **Edit Address**: Opens the Modal sheet pre-populated with address details.
  - **Delete Address**: Confirms deletion with a modal, then invokes `deleteAddressAction`.
  - **Set Default**: Sets `isDefault = true` for the selected card and resets others.

### 3.4 Checkout Integration Modal
- In `apps/storefront/app/[locale]/(shop)/checkout/page.tsx`, next to the shippingAddress field, render a **"Select from Address Book" (Chọn từ sổ địa chỉ)** button.
- Clicking the button opens a modal listing all saved addresses for the logged-in user.
- Selecting an address auto-fills the Checkout form fields:
  - Recipient Name -> `shippingName`
  - Phone Number -> `shippingPhone`
  - Detailed Address -> `shippingAddress`

---

## 4. Database Services, Cache & Revalidation

### 4.1 Schema Validation
Input schemas are defined using Zod in `packages/database/validators/`:

```typescript
// Address Validation Schema
export const addressSchema = z.object({
  receiverName: z.string().min(1, "validation.nameRequired").max(100),
  phoneNumber: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "validation.invalidPhone"),
  streetAddress: z.string().min(1, "validation.addressRequired"),
  district: z.string().min(1, "validation.districtRequired"),
  city: z.string().min(1, "validation.cityRequired"),
  isDefault: z.boolean().default(false),
});
```

### 4.2 Read Caching (`'use cache'`)
We utilize the Next.js 16 `'use cache'` directive in the service package for reads:
- `userService.getById(id)`: Cached with tag `user-${id}`.
- `addressService.getByUserId(userId)`: Cached with tag `addresses-${userId}`.

### 4.3 Write Revalidation (`revalidateTag`)
Server Actions executing write operations trigger immediate cache revalidation:
- Profile updates -> `revalidateTag("user-" + userId)`
- Address mutations (create/update/delete/default) -> `revalidateTag("addresses-" + userId)`
- When setting a default address, the query executes in a database transaction:
  ```sql
  UPDATE user_address SET is_default = false WHERE user_id = userId;
  UPDATE user_address SET is_default = true WHERE id = targetAddressId;
  ```

---

## 5. Verification Plan

- **Unit Testing**:
  - Write test specs verifying Zod validations in `packages/database/validators/address.validators.ts`.
  - Write tests for address CRUD service operations in `packages/database/src/services/address/address.service.test.ts`.
- **UI & Flow Verification**:
  - Verify that unauthenticated requests to `/portal/*` redirect to `/login?callbackUrl=...`.
  - Verify address listing renders correctly and the form modal auto-fills on edit.
  - Verify that selecting an address from the book at checkout auto-fills the fields.
  - Verify that Server Actions revalidate cache tags successfully.
