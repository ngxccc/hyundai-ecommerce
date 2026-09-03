# 2. Single Field User Full Name Format Design

Date: 2026-07-05  
Deciders: Team / Core Architecture

### Metadata

- **ID**: `ADR-0002`
- **Status**: `Accepted`
- **Date**: `2026-07-05`
- **Feature**: `auth`
- **Topic**: `Single Field User Full Name Format Design`
- **Target Module**: `src/modules/auth/` & Database Schema (`users` table)
- **Spec Reference**: `docs/design/user-registration-workflow.md`

---

## Status

Accepted

---

## Context

During database schema and registration DTO design for the Ticket Booking app, a structural decision was required regarding user name storage:

1. **Store full name in a single field (`fullName` / `name`)**.
2. **Split name into separate fields (`firstName` and `lastName`)**.

System design considerations:

- **Multicultural Naming (i18n & UX)**: Vietnamese users encounter friction when forced to separate names (e.g., "Nguyễn Văn Nam") into `firstName` and `lastName` fields. Multiple international cultures feature complex naming structures (e.g., dual surnames in Spanish, family names first in East Asia).
- **Registration Conversion (UX)**: Additional form fields increase registration drop-off rates.
- **Email Personalization**: The application requires personalized email greetings (e.g., "Hello Nam," rather than "Hello Nguyễn Văn Nam,").

---

## Considered Options

- **Option A (Chosen)**: Single field (`fullName` / `name`) + Application Helper — _Chosen for optimal sign-up UX and zero DB schema migration debt_
- **Option B**: Split columns (`firstName` + `lastName`) in DB — _Rejected because it causes UX friction for Vietnamese users and requires DB migration_

---

## Decision

**Y-Statement Summary**: In the context of user sign-up schema design, facing multicultural name complexity and sign-up UX friction, we decided for a single name field with an application helper to achieve optimal sign-up conversion and simple DB schema, accepting minor string parsing overhead for email personalization.

We decided to **maintain a single `name` (or `fullName`) string field representing the user's full name in the Database and DTO schemas.**

Personalization is handled via a **lightweight application helper function (`extractFirstName`)** at the application layer when generating emails or notifications:

```typescript
export function extractFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] ?? "";
}
```

---

## Evaluated Architectural Options & Comparison

### Option A: Single Field (`fullName` / `name`) + Application Helper (CHOSEN)

- **Characteristics**: Stores one string `name` column in PostgreSQL. Extracts the given name from the final word of the string when personalizing emails.
- **Pros**:
  - Optimal sign-up experience (single input field).
  - Compatible with global naming conventions.
  - Requires zero DB migration debt.
- **Cons**: Requires lightweight string extraction when generating personalized messages.

### Option B: Split Columns (`firstName` + `lastName`) in DB (REJECTED)

- **Characteristics**: Defines separate `first_name` and `last_name` columns in the `users` table.
- **Pros**: Direct field access for personalized greetings.
- **Cons**:
  - Adds registration friction for Vietnamese users.
  - Requires string concatenation whenever rendering full names in UI.
  - Increases SQL migration and DTO validation complexity.

---

## Decision Comparison Matrix

| Evaluation Criteria              | Option A: Single Field (`fullName`) (CHOSEN) | Option B: Split (`firstName` + `lastName`) |
| :------------------------------- | :------------------------------------------- | :----------------------------------------- |
| **Sign-up Experience (UX)**      | ⚡⚡⚡ Best (Single input field)             | ⚡ Lower (Forced 2 inputs)                 |
| **Multicultural Support (i18n)** | 🌍 Full compatibility across all regions     | ⚠️ High friction for Vietnamese names      |
| **Database Migration**           | 🟢 Zero schema changes required              | 🔴 Requires altering `users` table         |
| **API Code Complexity**          | 🟢 Simple (Single property payload)          | 🔴 Requires string concatenation           |
| **Personalization**              | 🟡 Handled via application helper            | 🟢 Direct column access                    |

---

## Consequences

### Positive Outcomes

1. **Optimized Conversion Rate**: Users complete registration via a single input field.
2. **Zero Schema Migration Debt**: Maintains a clean `users` schema without Drizzle migrations.
3. **Global Compatibility**: 100% compatible with both Vietnamese and international naming conventions.

### Explicit Tradeoffs

- **Parsing Assumptions**: Given name extraction relies on the last word in the string (valid for 95%+ of Vietnamese and English names).

---

## Status & Approval

- **Status**: Accepted & Implemented.
- **Target Location**: `docs/adr/0002-user-name-format-design-decision.md`
