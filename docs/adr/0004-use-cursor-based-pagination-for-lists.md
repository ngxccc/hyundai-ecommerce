# 4. Use Cursor-based Pagination for Lists

Date: 2026-05-28

## Status

Accepted

## Context

When displaying lists of products and other items across the system (Admin & Storefront), we needed a pagination mechanism. Initially, there were two main options:
1. **Offset-based pagination**: Using `LIMIT` and `OFFSET` based on specific page numbers.
2. **Cursor-based pagination**: Using `LIMIT` and filtering conditions (e.g., `WHERE id < cursorId` or `WHERE createdAt < cursorDate`).

The default Shadcn UI `Pagination` component is designed around displaying exact page numbers (`1, 2, 3...`). This raised a discussion about whether we should switch our database queries to Offset-based pagination to match the UI component perfectly.

## Decision

We will **use Cursor-based pagination** as the standard across the platform. 
To accommodate this in the UI, we will use the `Icons Only` composition of the Shadcn `Pagination` component (which only includes "Previous" and "Next" buttons) instead of displaying exact page numbers.

## Consequences

- **Positive**: Query performance is strictly $O(1)$ regardless of how deep the user paginates. This avoids the severe performance penalty of `OFFSET N` on very large datasets where the database has to scan and discard rows.
- **Positive**: Data consistency is maintained. If new records are added or deleted while the user is paginating, cursor-based pagination guarantees they won't see duplicate records or miss items, unlike offset-based pagination.
- **Positive**: This structure is natively compatible with Infinite Scroll or "Load More" UI patterns which are standard for modern e-commerce storefronts.
- **Negative**: Users cannot jump to an arbitrary page (e.g., "Jump to page 15").
- **Negative**: Backward pagination ("Previous") is more complex to implement and often requires maintaining a cursor history stack in the client state or URL.
