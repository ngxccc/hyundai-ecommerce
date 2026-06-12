# ROADMAP: Hyundai E-Commerce (hyundai-ecommerce)

> **Mission:** Build a high-performance B2B e-commerce platform for Hyundai industrial generators in Vietnam, optimizing for SEO, ultra-fast page load speeds via Next.js 16 PPR (Partial Prerendering), and a robust Monorepo architecture.

---

## Active Milestone
*Focus on completing this section before looking further down.*

### Milestone 2: Product Catalog & Localization (Phase 2 Catalog)
- [x] Integrate storefront error boundaries (localized error.tsx and global-error.tsx)
- [x] Optimize Largest Contentful Paint (LCP) by compressing system icons and applying image loading priority
- [x] Standardize catalog sort query parameters from snake_case to camelCase
- [ ] Migrate raw database queries into storefront cached service layers (sitemap.xml and api/products/metadata)
- [ ] Refactor getStaticProductSlugs to fetch via Database productService.getAllActiveSlugs()
- [ ] Implement bilingual database schema (columns name_vi, name_en) and DTO mapping layer
- [ ] B2B Storefront Program — Program Goal Charter
- [ ] Phase 3: Cart Service & Storefront Integration — Plan
- [ ] Phase 4: Customer Quoting & Negotiation Portal — Plan
- [ ] Multilingual Database Content and DTO Mapping Architecture Plan
- [x] Admin Global Image Upload Configuration
- [x] Admin Grid View Transformation
- [x] Admin Header Search Refactor and Category Card Enhancement
- [x] Architectural Refactor & Principles Alignment Plan
- [x] Background Image Upload Architecture
- [x] PLAN: Categories & Brands Management
- [x] Admin Dashboard Dynamic Data - Plan
- [x] Database Services Directory Refactoring Plan
- [x] Database Indexing - Plan
- [x] Database Missing Services Tests Plan
- [x] Delete Button UI Refactor for Brands and Categories
- [x] Cloudinary Image Deletion Plan
- [x] Github Actions Paths Filter Migration Plan
- [x] Error Handling Refactor (Services & Actions)
- [x] Localize Cloudinary API Errors
- [x] PLAN: Neon DB Migration Workflow & Seed Schema Update
- [x] Product Image Upload Integration
- [x] PLAN: Product Query Optimization (Performance & Clean Code)
- [x] Product Feature Pre-Merge Audit
- [x] Product Filters Reset Plan
- [x] PLAN: Product Specs Filters
- [x] PLAN: RIPER-5 Antigravity Plugin
- [x] Security & Access Control Fix Plan
- [x] Security Remediation and Rate Limiting Implementation - Plan
- [x] Standardize Catalog Sort Query Parameters Plan
- [x] Storefront Error Boundaries Implementation Plan
- [x] Storefront Skeleton Components Implementation Plan
- [x] Strict Paths Rule Update Plan
- [x] PLAN: Warehouse & Inventory Management
- [x] Zustand Architecture Analysis
- [x] B2B CRM & Operations Dashboard Roadmap
- [x] Phase 2: Customer Directory & Dealer Tiers Management
- [x] Phase 3: Orders Management Dashboard & Invoice PDF Export
- [x] Phase 5: Logistics Carrier Bidding Panel
- [x] Phase 1: B2B Quotes Database Schema Extensions
- [x] Phase 4: Quote Negotiation Chat & Pricing Cockpit
- [x] Caching Migration Plan: Next.js 16 Cache Components
- [x] Storefront Hybrid Faceted Search Implementation Plan
- [x] Storefront Mobile Filter Bottom Sheet Implementation Plan
- [x] Phase 1: Storefront API Mock Migration — Plan
- [x] Phase 2: Storefront Product Catalog, Search & Filters — Plan
- [x] Plan: B2B Storefront Phase 2 - Static Category Routes

---

## Next 3 Actions
*Select up to 3 tasks from the Active Milestone to focus on immediately.*
1. **[In Progress]** Migrate raw database queries in sitemap.ts and metadata API to cached services
2. **[Next]** Refactor getStaticProductSlugs to resolve raw SQL operations in database package
3. **[Next]** Start bilingual schema migration per multilingual-db-and-dto-architecture plan

---

## Future Milestones
*Upcoming vertical slices of work.*

*   **Milestone 3: B2B Customer Directory & CRM Operations**
    *   Optimize B2B customer registration forms and validation schemas
    *   Integrate customer data into internal CRM dashboard
    *   Support dealer tier-based automatic pricing and roles
*   **Milestone 4: Doppler Secret Management & Security Audit**
    *   Migrate environment variables to Doppler for centralized management
    *   Perform comprehensive security audit (OWASP & CSP validation)
*   **Milestone 5: Checkout & Order Tracking Flow**
    *   Implement persistent database-backed cart sync
    *   Build checkout and integrate domestic payment gateways

---

## Idea Icebox / Backlog
*A storage area for new ideas. Do not implement immediately to prevent scope creep.*

- [ ] Implement AI generator sizing recommendation chatbot
- [ ] Add product side-by-side technical specification comparison
- [ ] Enable direct PDF catalog download from product detail pages
- [ ] Compute real-time delivery and installation costs based on geographical coordinates
