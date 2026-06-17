# B2B Read-Only Profile Fields Design Spec

* **Date**: 2026-06-17
* **Status**: Approved
* **Feature**: storefront

## Background
During registration, B2B Dealer accounts undergo administrative verification of their legal entity data (Company Name, Tax ID, Business Type, and Province) before being approved to trade on credit terms. Allowing these users to freely edit these fields in their portal profile page introduces severe business risks:
1. **Invoice & VAT misalignment**: Invoices could be issued to modified or incorrect legal entities.
2. **Fraud & identity shifts**: B2B users could change their corporate identity to masquerade as other businesses or evade credit liabilities.

## Goals
1. Make all corporate fields (`companyName`, `taxId`, `businessType`, and `province`) strictly **Read-Only** in the user portal profile page.
2. Ensure B2B fields cannot be updated via the Server Action payload for users with Dealer roles.
3. Allow regular B2C retail users (who do not have dealer roles and do not display B2B fields) to edit their personal fields normally.

## Detailed Design

### 1. UI Constraints (`profile-form.tsx`)
In `apps/storefront/src/features/portal/components/profile-form.tsx`:
- When rendering B2B fields (enabled via `isDealer` check), we will pass `disabled={true}` to the inputs for `companyName`, `taxId`, `province`, and the Select component for `businessType`.
- This renders the values clearly for reference while preventing user interaction/editing.

### 2. Server Action Guard (`profile.action.ts`)
In `apps/storefront/src/features/portal/actions/profile.action.ts`:
- Retrieve the user's role from the session.
- Determine if the user is a B2B dealer: `const isDealer = session.user.role === "DEALER_APPROVER" || session.user.role === "DEALER_PURCHASER"`.
- If `isDealer` is true, explicitly construct the database update payload containing only `name` and `phone`. Ignore any B2B field updates from the incoming request payload.

```typescript
const updatePayload = {
  name: parsed.data.name,
  phone: parsed.data.phone,
};

if (!isDealer) {
  // B2C / Retail users might not have B2B fields anyway, but we defensively guard the B2B fields update
  // currently retail users do not edit B2B details
}
```

## Affected Files
* `apps/storefront/src/features/portal/components/profile-form.tsx` (Disable inputs)
* `apps/storefront/src/features/portal/actions/profile.action.ts` (Sanitize server update payload)

## Verification Plan
1. **Inputs Read-Only**: Inspect form component rendering to confirm B2B fields are disabled for dealer accounts.
2. **Compilation & Tests**: Run `bun run check-types` and `bun run test` to verify zero regression.
