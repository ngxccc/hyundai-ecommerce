# 4. Use Cursor-based Pagination for Lists

Date: 2026-05-28

## Status

Accepted

## Context

When displaying lists of products and other items across the system (Admin & Storefront), we needed a pagination mechanism. Initially, there were two main options:

1. **Offset-based pagination**: Using `LIMIT` and `OFFSET` based on specific page numbers.
2. **Bidirectional Cursor-based pagination**: Using `LIMIT` and filtering conditions (e.g., `WHERE createdAt < after` or `WHERE createdAt > before`).

The default Shadcn UI `Pagination` component is designed around displaying exact page numbers (`1, 2, 3...`). This raised a discussion about whether we should switch our database queries to Offset-based pagination to match the UI component perfectly.

## Decision

We will **use Bidirectional Cursor-based pagination** as the standard across the platform.
We will employ a pattern heavily inspired by GraphQL/Relay connections, utilizing two distinct URL parameters: `after` (for moving forward) and `before` (for moving backward).

To accommodate this in the UI, we will use the `Icons Only` composition of the Shadcn `Pagination` component (which only includes "Previous" and "Next" buttons) instead of displaying exact page numbers. When a user clicks "Previous", the UI will append the `before` cursor to the URL, triggering a backward database query. When clicking "Next", it will use the `after` cursor.

## Consequences

- **Positive**: Query performance is strictly $O(1)$ regardless of how deep the user paginates. This avoids the severe performance penalty of `OFFSET N` on very large datasets where the database has to scan and discard rows.
- **Positive**: Data consistency is maintained. If new records are added or deleted while the user is paginating, cursor-based pagination guarantees they won't see duplicate records or miss items, unlike offset-based pagination.
- **Positive**: This structure is natively compatible with Infinite Scroll or "Load More" UI patterns which are standard for modern e-commerce storefronts.
- **Positive**: Backward pagination works flawlessly without needing to maintain a complex state history on the client side, as the server can dynamically calculate the previous dataset using `ASC` sorting and `gt` filters.
- **Negative**: Users cannot jump to an arbitrary page (e.g., "Jump to page 15").
