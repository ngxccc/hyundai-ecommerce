# PLAN: Admin App (CMS) Features Roadmap

Date: 30-05-26
Complexity: Complex
Status: 🚧 IN PROGRESS

## Overview

Based on the database structure (in `packages/database/src/schemas/`) which includes `brands`, `categories`, `products`, `warehouses`, `warehouseStocks`, `orders`, `shippingBids`, `payments`, `users`, `dealerTiers`, etc., the admin system (`apps/admin`) requires a logical development roadmap to manage the entire lifecycle of products and orders (B2B/B2C Ecommerce).

This plan outlines the CMS features roadmap sorted by **descending priority** (Top-down Priority), ensuring the data flow remains unobstructed. (e.g., Categories and Brands must exist before Products can be created; Warehouses must exist before Product inventory can be stocked, etc.).

## Touchpoints

- `README.md` (Roadmap section updated)
- Database schemas in `packages/database/src/schemas/*`
- Future directories in `apps/admin/src/features/*`

## Public Contracts

- General Architecture for all Admin features:
  1. **Schema-driven Validation:** Zod Schemas shared from `packages/database/src/validators`.
  2. **Fat Service:** All database operations are performed via the Service layer in `packages/database/src/services`.
  3. **App Router:** Using Next.js Server Actions for mutations.

## Blast Radius

- No risks to legacy systems. This is a Strategic Plan to build a sequential execution roadmap.

## Proposed Changes (Admin Features Roadmap - Descending Priority)

### 1. Categories & Brands Management (✅ Completed)

- **DB Foundation:** `categories` and `brands` schema.
- **Reason:** This is Master Data. Users cannot create Products if there are no Categories and Brands to select from dropdowns.
- **Features:** Data table listing, Create/Update/Delete (Soft delete) Categories & Brands. Category hierarchy support.
- **Status:** Completed. UI components (Cards, Header Search, Delete confirmation dialogs) have been implemented and verified.

### 2. Product Creation & Editing (⏳ Next Up)

- **DB Foundation:** `products` schema.
- **Reason:** The heart of the E-commerce system. Listing and dynamic forms already exist, but image upload is missing. There is also an existing issue noted in [#38](https://github.com/ngxccc/hyundai-ecommerce/issues/38). The current task is to improve the rich text editor in `packages/ui/src/editor` by adding necessary features since it currently only has basic functionality.
- **Features:** Improve Rich Text Editor (Tiptap) for product descriptions, and implement Image Upload capabilities.

### 3. Warehouse & Inventory Management

- **DB Foundation:** `warehouses`, `warehouseStocks` schema.
- **Reason:** For heavy industrial machinery (generators), managing inventory across multiple physical warehouses is essential before starting sales.
- **Features:** Warehouse listing, managing stock quantities for each product across different warehouses.

### 4. Order Management & Fulfillment Workflow

- **DB Foundation:** `orders`, `orderItems` schema.
- **Reason:** The lifecycle of a B2B/B2C order, from Pending -> Processing -> Shipped -> Delivered.
- **Features:** View order details, print invoices (PDF Quote), change delivery status.

### 5. Shipping & Logistics Bidding Management

- **DB Foundation:** `shippingBids` schema.
- **Reason:** The specific nature of heavy machinery requires transportation bidding by logistics providers (trucking companies).
- **Features:** Dashboard to review shipping quotes from providers, select the cheapest/best provider for each Order.

### 6. User, Role & Dealer Tier Management (RBAC & B2B)

- **DB Foundation:** `users`, `dealerTiers`, `userAddresses` schema.
- **Reason:** Customer base management, dealer discounts (B2B).
- **Features:** Assign Tiers to corporate clients, lock accounts, admin role-based access control (RBAC).

### 7. Payment & Financial Tracking

- **DB Foundation:** `payments` schema.
- **Reason:** Tracking cash flow, confirming deposits, and final payments.
- **Features:** Payment reconciliation, manual payment confirmation (bank transfers).

## Verification Evidence

- [x] `README.md` Roadmap has been updated with the correct priorities.
- [x] User agreed to the Roadmap and Phase 1 (Categories & Brands) has been successfully implemented.
- [x] Categories & Brands search, filtering, and delete dialog UI refactoring are verified.

## Acceptance Criteria

- [x] Establish a clear development roadmap with logical data constraints.
- [x] Ready to hand over to the EXECUTE phase.
- [x] All plan content must be written in clear English for optimal AI comprehension.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:

- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Code written but not E2E tested
- 🧪 TESTING - Currently testing
- ✅ VERIFIED - Tested and User confirmed working
- 🚧 BLOCKED - Has issues / In Progress

## Implementation Checklist

- [x] Read and understand the entire DB structure (`packages/database/src/schemas/relations.ts`).
- [x] Update `README.md` roadmap.
- [x] Draft this Strategic Plan.
- [x] Get user approval to proceed with Phase 1.
- [x] Complete Phase 1 implementation (Categories & Brands Management).
- [x] Translate the entire plan into English and update progress.

## Resume and Execution Handoff

Since Phase 1 (Categories & Brands Management) is complete, the Executor is now ready to move on to **Phase 2: Product Creation & Editing**, specifically focusing on improving the Tiptap Rich Text Editor (`packages/ui/src/editor`) and Image Upload handling.

---

**User Review Required:**
The roadmap has been translated and updated to reflect that Phase 1 is complete. Do you agree to proceed with Phase 2 (Improving the Rich Text Editor and Image Upload)? If yes, please type **"go"** to begin implementation.
