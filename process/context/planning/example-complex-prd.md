# LinkedIn Achievements Dashboard: Shareable Analytics PRD

**Date**: January 25, 2026
**Complexity**: COMPLEX (Multi-phase)
**Implementation Approach**: Hybrid (Approach 3 - Grouped Queries + Zustand Store)
**Execution Model**: Phase-by-Phase with Pre-Research and Post-Testing

## Overview

Build a visually impressive, shareable achievements section within the existing Next.js account dashboard that showcases LinkedIn engagement metrics. The dashboard displays verified/assisted comment statistics, activity streaks, network visualization via treemap, contribution heat map, and best friends rankings. Designed with a bento box layout using the neobrutalist theme, optimized for social media sharing.

**Status**: ⏳ PLANNED

---

## Quick Links

- [Context and Goals](#1-context-and-goals)
- [Execution Brief](#15-execution-brief)
- [Architecture Decisions](#3-architecture-decisions-final)
- [Component Details](#8-component-details)
- [Database Schema](#11-database-schema-prisma-style)
- [API Surface](#12-api-surface-trpc)
- [Phased Delivery Plan](#14-phased-delivery-plan)
- [RFCs](#16-rfcs)
- [Implementation Checklist](#implementation-checklist)

---

## 1. Context and Goals

EngageKit users manage multiple LinkedIn accounts and post AI-assisted comments. The achievements dashboard serves as a growth hack mechanism - users can proudly showcase their engagement statistics on social media, driving organic visibility and user acquisition.

**In-scope**:
- Achievements section integrated into existing account dashboard (`/[orgSlug]/[accountSlug]/page.tsx`)
- Three grouped tRPC queries (profile metrics, network data, activity data)
- Zustand store for achievements state management (consistent with existing `useAccountStore` pattern)
- Bento box layout with merged hero header + metrics
- Network treemap visualization (Recharts)
- GitHub-style contribution heat map (365 days)
- Top 5 best friends ranking
- Verified/Assisted comment counts (based on `peakTouchScore`)
- Global percentile ranking ("Top X% Engage Warrior")
- Current and longest streak tracking
- Fully responsive (mobile stacks vertically)
- Neobrutalist theme adherence (black borders, hard shadows)

**Out-of-scope (V1)**:
- Screenshot/share button (users can screenshot manually)
- Real-time data refresh (loads on page visit only)
- Per-organization ranking (global only)
- Social media direct-share integration
- Animations and micro-interactions
- Export as image functionality
- Historical trend charts
- Achievement badges/milestones

---

## 1.5 Execution Brief

### Phase 1-3: Foundation (Database Indexes, tRPC Routers, Zustand Store Setup)
**What happens:** Add database indexes for performance, create three new tRPC procedures for achievements data, create Zustand store for achievements state following existing `useAccountStore` pattern.

**Test:** Indexes visible in Prisma schema, tRPC procedures compile and return mock data, Zustand store initializes without errors.

### Phase 4-5: Component Architecture (Bento Layout + Individual Cards)
**What happens:** Build AchievementsSection parent component with CSS Grid bento layout, create individual card components (ProfileMetricsCard, NetworkTreemapCard, ActivityHeatMapCard, BestFriendsCard, StreakCard).

**Test:** Layout renders correctly on desktop/tablet/mobile, cards accept props and display skeleton states, no visual regressions.

### Phase 6-7: Data Integration (Connect tRPC + Populate UI)
**What happens:** Wire Zustand store to tRPC queries, connect all card components to Zustand store selectors, implement loading/error states throughout.

**Test:** Real data populates all cards, loading skeletons appear during fetch, error boundaries catch failures gracefully, Zustand DevTools shows state updates.

### Phase 8-10: Visualizations (Treemap, Heat Map, Rankings)
**What happens:** Implement Recharts treemap with profile pictures, build custom heat map grid component with color intensity, create ranking list with progress bars and avatars.

**Test:** Treemap renders with correct box sizes, heat map shows 365 days with accurate counts, rankings display top 5 with proper sorting.

### Phase 11-12: Polish (Responsive Design, Performance, Accessibility)
**What happens:** Finalize mobile responsive behavior, optimize query performance with memoization, add ARIA labels and keyboard navigation, conduct comprehensive testing.

**Test:** All breakpoints work correctly, Lighthouse performance score >90, screen readers announce content properly, manual QA passes.

### Expected Outcome
- Achievements section prominently displays on account dashboard
- Users see verified/assisted comment counts, top % ranking, streaks
- Network treemap visualizes interaction frequency
- Heat map shows daily activity for 365 days
- Top 5 best friends listed with engagement metrics
- Entire section is screenshot-worthy for social media
- All data loads in <2 seconds on slow 3G

---

## 1.75 Phased Execution Workflow

**IMPORTANT**: This plan uses a phase-by-phase execution model with built-in approval gates. Each RFC follows this workflow:

### Phase Workflow Pattern

**Step 1: Pre-Phase Research**
- Read existing code patterns in codebase
- Analyze similar implementations
- Identify potential blockers or unknowns
- Present findings to user for review

**Step 2: Detailed Planning**
- Based on research, create detailed implementation steps
- Specify exact files to create/modify
- Define success criteria
- Get user approval before proceeding

**Step 3: Implementation**
- Execute approved plan exactly as specified
- No deviations from approved approach
- Mid-phase check-in if phase is long (>2 hours)

**Step 4: Testing**
- Execute specific test scenarios (provided in RFC)
- Verify all acceptance criteria met
- Document any issues or deviations
- Show results to user

**Step 5: Phase Approval**
- User reviews implementation and test results
- User approves to proceed to next phase
- OR user requests changes (loop back to Step 2)

### Example Phase Execution

```
User: "Begin RFC-001: Database Indexes"

Assistant (Pre-Phase Research):
- Reading existing Comment model indexes...
- Analyzing query patterns in tRPC routers...
- Findings: Current indexes only on [accountId], [status], [commentedAt]
- Recommended: Add composite indexes for achievements queries
- Do you approve proceeding with this approach?

User: "Yes, proceed"

Assistant (Detailed Planning):
- Will add 3 composite indexes to Comment model
- Files to modify: packages/db/prisma/models/comment.prisma
- Migration command: pnpm db:migrate dev
- Expected migration time: <1 minute
- Ready to implement?

User: "Go ahead"

Assistant (Implementation):
[Adds indexes, generates migration, applies to database]

Assistant (Testing):
Running post-phase tests:
✓ Migration applied successfully
✓ Indexes visible in schema
✓ Query with WHERE accountId + status + peakTouchScore: 12ms (was 340ms)
✓ No errors in database logs

Phase RFC-001 complete. Proceed to RFC-002?
```

### Benefits of This Approach

- **User control**: Approve each phase before implementation
- **Early feedback**: Catch issues before significant work done
- **Visibility**: Clear understanding of what's being built
- **Quality**: Testing after each phase ensures incremental quality
- **Flexibility**: Easy to adjust approach based on discoveries

---

## 2. Non-Goals and Constraints

**Non-Goals**:
- Admin dashboard or aggregate organization metrics
- Gamification features (levels, XP, rewards)
- Social comparison features (leaderboards across users)
- Email notifications for achievements
- PDF export or print-friendly layouts
- Third-party analytics integrations

**Constraints**:
- Must use existing Prisma schema (`Comment`, `LinkedInAccount`, `User`)
- Must follow neobrutalist theme from `@sassy/ui`
- Mobile viewport minimum: 375px width
- Browser support: Last 2 versions of Chrome, Firefox, Safari, Edge
- Accessibility: WCAG 2.1 AA compliance
- Performance: <3s page load on 3G, <100ms interaction latency

---

## 3. Architecture Decisions (Final)

### AD-001: Hybrid Data Fetching (3 Grouped Queries)

**Decision**: Use three grouped tRPC queries instead of single mega-query or granular per-component queries.

**Rationale**:
- **Performance**: 3 parallel queries vs 1 sequential reduces latency vs single blocking query
- **Maintainability**: Logical grouping by data domain (profile, network, activity) keeps code organized
- **Flexibility**: Can invalidate individual query groups without refetching everything
- **Type Safety**: Smaller response types are easier to reason about than massive union types

**Grouped Queries**:
1. `achievements.getProfileMetrics` → verified count, assisted count, percentile, current streak, longest streak
2. `achievements.getNetworkData` → top 50 profiles (for treemap + best friends)
3. `achievements.getActivityData` → 365-day activity buckets (for heat map)

**Implications**:
- Zustand store receives results from 3 separate `useQuery` hooks
- Loading states must handle partial data (some queries succeed, others pending)
- Cache invalidation requires coordination across 3 keys
- Store reset needed when switching accounts (via AccountLayout)

### AD-002: Zustand Store for State Management

**Decision**: Use Zustand store for achievements state management instead of React Context.

**Rationale**:
- **Consistent with existing patterns**: Codebase already uses `useAccountStore` for similar global state
- **Better performance**: Fine-grained subscriptions prevent unnecessary re-renders
- **Easier debugging**: Zustand DevTools integration out of the box
- **No provider nesting**: Components can access store anywhere without wrapping
- **Simpler testing**: Mock store state directly, no provider setup needed
- **TypeScript-first**: Excellent type inference and safety

**Existing Pattern** (from `apps/nextjs/src/stores/zustand-store/account-store.ts`):
```tsx
interface AccountState {
  accountId: string | null;
  accountSlug: string | null;
}

interface AccountActions {
  setAccount: (accountId: string | null, accountSlug: string | null) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accountId: cookies.account_id,
  accountSlug: cookies.account_slug,
  setAccount: (accountId, accountSlug) => {
    set({ accountId, accountSlug });
    saveCookie("account_id", accountId ?? "", { ... });
  },
  clearAccount: () => set({ accountId: null, accountSlug: null }),
}));
```

**New Pattern** (for achievements):
```tsx
interface AchievementsState {
  profileMetrics: ProfileMetrics | null;
  networkData: NetworkProfile[] | null;
  activityData: ActivityBucket[] | null;
  isLoading: boolean;
  error: string | null;
}

interface AchievementsActions {
  setProfileMetrics: (data: ProfileMetrics) => void;
  setNetworkData: (data: NetworkProfile[]) => void;
  setActivityData: (data: ActivityBucket[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAchievementsStore = create<AchievementsStore>((set) => ({
  profileMetrics: null,
  networkData: null,
  activityData: null,
  isLoading: false,
  error: null,
  setProfileMetrics: (data) => set({ profileMetrics: data }),
  setNetworkData: (data) => set({ networkData: data }),
  setActivityData: (data) => set({ activityData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    profileMetrics: null,
    networkData: null,
    activityData: null,
    isLoading: false,
    error: null
  }),
}));
```

**Usage in Components**:
```tsx
// In data-fetching component (AccountDashboardPage)
const setProfileMetrics = useAchievementsStore((s) => s.setProfileMetrics);
const { data } = useQuery(
  trpc.achievements.getProfileMetrics.queryOptions(),
  {
    onSuccess: (data) => setProfileMetrics(data)
  }
);

// In display component (ProfileMetricsCard)
const profileMetrics = useAchievementsStore((s) => s.profileMetrics);
const isLoading = useAchievementsStore((s) => s.isLoading);
```

**Implications**:
- Store updates trigger re-renders only for components subscribing to changed slices
- No provider setup required (cleaner component tree)
- DevTools available for debugging state changes
- Account switching handled via `reset()` action in AccountLayout

### AD-003: Server-Side Aggregations in tRPC

**Decision**: Perform all metric calculations (verified count, percentile, streaks) in tRPC procedures, not client-side.

**Rationale**:
- Database-level aggregations are faster than client-side processing
- Reduces payload size (send counts, not raw comment arrays)
- Percentile ranking requires cross-account data unavailable to client
- Streak calculation benefits from SQL window functions (future optimization)

**Example**:
```typescript
// Server-side (tRPC procedure)
const verifiedCount = await db.comment.count({
  where: { accountId, peakTouchScore: { gte: 80 }, status: 'POSTED' }
});

// vs Client-side (inefficient)
const comments = await fetchAll(); // Large payload
const verified = comments.filter(c => c.peakTouchScore >= 80).length;
```

**Implications**:
- More complex tRPC procedures (business logic on backend)
- Better performance and scalability
- Easier to cache at database layer

### AD-004: Recharts for Treemap, Custom Grid for Heat Map

**Decision**: Use Recharts `<Treemap>` for network visualization, build custom SVG/div grid for heat map.

**Rationale**:
- **Treemap**: Recharts already installed, supports custom content rendering (profile pics), handles layout algorithm automatically
- **Heat Map**: Recharts doesn't have native heat map component; custom grid gives full control over neobrutalist styling (black borders, hard shadows)

**Implications**:
- Recharts adds ~400KB to bundle (already included, no additional cost)
- Custom heat map requires manual tooltip implementation
- Heat map data structure must be pre-bucketed by day (server-side)

### AD-005: Bento Layout with CSS Grid

**Decision**: Use CSS Grid with `grid-template-areas` for bento layout instead of Flexbox.

**Rationale**:
- CSS Grid excels at 2D layouts with named areas
- Easier responsive breakpoints (redefine template-areas at each breakpoint)
- Explicit control over card placement and sizing
- Industry standard for dashboard layouts

**Layout Structure**:
```css
grid-template-areas:
  "profile verified assisted"
  "profile warrior streak"
  "treemap treemap heatmap"
  "friends friends friends";
```

**Implications**:
- Requires CSS Grid knowledge for maintenance
- Named areas make responsive changes clear and explicit
- Card components must declare their grid-area class

### AD-006: Mobile-First Responsive Strategy

**Decision**: Stack all cards vertically on mobile (<768px), 2-column on tablet (768px-1024px), full bento grid on desktop (>1024px).

**Rationale**:
- Mobile users comprise 60%+ of LinkedIn traffic
- Vertical stacking is simplest and most accessible on narrow viewports
- Tablet users get partial bento experience (treemap + heatmap side-by-side)
- Desktop users get full visual impact

**Breakpoints**:
- `< 768px`: Single column (mobile)
- `768px - 1024px`: 2 columns (tablet)
- `> 1024px`: Full bento grid (desktop)

**Implications**:
- Tailwind responsive utilities required (`md:`, `lg:`)
- Components must look good in all aspect ratios
- Heat map may need to truncate on mobile (show last 180 days instead of 365)

---

## 4. Architecture Clarification: Achievements Section in Account Dashboard

### Why Add to Existing Account Dashboard?

**Current State**:
- Account dashboard (`/[orgSlug]/[accountSlug]/page.tsx`) has minimal content (2 cards: Account Info + Quick Actions)
- Large empty space below existing cards
- Dashboard is the default landing page when selecting an account

**Benefits of Integration**:
- ✅ No additional navigation required (visible immediately)
- ✅ Prominent placement encourages social sharing
- ✅ Contextually relevant (achievements per LinkedIn account, not global)
- ✅ Reuses existing layout/auth infrastructure

### Alternative Approaches Considered

**Option 1**: Separate `/achievements` route
- ❌ Requires additional click to reach
- ❌ Less prominent placement
- ✅ Cleaner separation of concerns
- **Rejected**: Reduces visibility and shareability

**Option 2**: Modal/Dialog overlay
- ❌ Harder to screenshot (requires opening modal)
- ❌ Poor mobile UX (full-screen modals on small screens)
- ✅ Doesn't clutter dashboard
- **Rejected**: Screenshot functionality is core requirement

**Option 3**: Dedicated sidebar tab
- ❌ Competes with existing tabs (History, Personas, Target List)
- ❌ Still requires navigation
- ✅ Familiar pattern
- **Rejected**: Account dashboard is better default location

**Selected**: Integrate into account dashboard page
- ✅ Zero-click visibility
- ✅ Encourages organic discovery
- ✅ Prominent placement for screenshots
- ✅ Contextually appropriate

---

## 5. High-level Data Flow

```
User navigates to /[orgSlug]/[accountSlug]
          ↓
AccountDashboardPage component renders
          ↓
Page fires 3 parallel tRPC queries via useQuery hooks:
  1. trpc.achievements.getProfileMetrics.useQuery()
  2. trpc.achievements.getNetworkData.useQuery()
  3. trpc.achievements.getActivityData.useQuery()
          ↓
tRPC procedures execute on server:
  - Query Prisma for Comment data (filtered by accountId, status=POSTED)
  - Aggregate metrics (verified count, assisted count, streaks)
  - Calculate global percentile (compare to all accounts)
  - Group network data by authorProfileUrl (top 50)
  - Bucket activity data by day (365 days)
          ↓
Query onSuccess callbacks update Zustand store:
  - setProfileMetrics(data)
  - setNetworkData(data)
  - setActivityData(data)
          ↓
Child components subscribe to Zustand store slices:
  - ProfileMetricsCard: useAchievementsStore((s) => s.profileMetrics)
  - NetworkTreemapCard: useAchievementsStore((s) => s.networkData)
  - ActivityHeatMapCard: useAchievementsStore((s) => s.activityData)
  - BestFriendsCard: useAchievementsStore((s) => s.networkData?.slice(0, 5))
          ↓
Components re-render when subscribed store slices change
          ↓
User sees fully populated achievements dashboard
```

---

## 6. Security Posture

**Authentication**:
- All tRPC procedures use `accountProcedure` (requires Clerk auth + account ownership)
- Validates user has access to requested LinkedIn account
- Prevents cross-account data leakage

**Data Privacy**:
- Only shows data for comments posted by current account (filtered by `accountId`)
- Profile pictures from `owner.imageUrl` (Clerk-managed, already public)
- Network data shows LinkedIn profile URLs (already public information)
- No sensitive metadata exposed (touch scores are internal metrics)

**Rate Limiting**:
- tRPC procedures inherit Next.js rate limiting (Vercel default: 100 req/10s per IP)
- Client-side caching via React Query (5-minute staleTime)
- No infinite scroll or polling (data loads once on page visit)

**SQL Injection**:
- All queries use Prisma ORM (parameterized queries, no raw SQL)
- User input limited to `accountSlug` (validated via Prisma relation lookup)

**XSS Prevention**:
- React auto-escapes all text content
- Profile names and URLs from database are sanitized by Prisma
- No `dangerouslySetInnerHTML` used anywhere

---

## 7. Component Details

### useAchievementsStore (Zustand Store)

**Location**: `apps/nextjs/src/stores/zustand-store/achievements-store.ts`

**Responsibilities**:
- Hold achievements data (profile metrics, network data, activity data)
- Track loading and error states
- Provide actions to update state
- Reset state when account changes

**Store Shape**:
```typescript
interface ProfileMetrics {
  verifiedCount: number;
  assistedCount: number;
  percentile: number;
  currentStreak: number;
  longestStreak: number;
  profileSlug: string;
  profileImageUrl: string | null;
}

interface NetworkProfile {
  authorProfileUrl: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  interactionCount: number;
}

interface ActivityBucket {
  date: string; // ISO date (YYYY-MM-DD)
  count: number;
}

interface AchievementsState {
  profileMetrics: ProfileMetrics | null;
  networkData: NetworkProfile[] | null;
  activityData: ActivityBucket[] | null;
  isLoading: boolean;
  error: string | null;
}

interface AchievementsActions {
  setProfileMetrics: (data: ProfileMetrics) => void;
  setNetworkData: (data: NetworkProfile[]) => void;
  setActivityData: (data: ActivityBucket[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void; // Called when switching accounts
}

type AchievementsStore = AchievementsState & AchievementsActions;
```

**Usage Pattern**:
```tsx
// In AccountDashboardPage (data fetching)
const setProfileMetrics = useAchievementsStore((s) => s.setProfileMetrics);
const setLoading = useAchievementsStore((s) => s.setLoading);
const setError = useAchievementsStore((s) => s.setError);

const { data, isLoading, error } = useQuery(
  trpc.achievements.getProfileMetrics.queryOptions(),
  {
    onSuccess: (data) => setProfileMetrics(data),
    onError: (err) => setError(err.message)
  }
);

useEffect(() => {
  setLoading(isLoading);
}, [isLoading, setLoading]);

// In ProfileMetricsCard (data display)
const profileMetrics = useAchievementsStore((s) => s.profileMetrics);
const isLoading = useAchievementsStore((s) => s.isLoading);
```

**Account Switching**:
```tsx
// In AccountLayout (when account changes)
const resetAchievements = useAchievementsStore((s) => s.reset);

useEffect(() => {
  if (prevAccountSlugRef.current !== accountSlug) {
    resetAchievements();
  }
}, [accountSlug, resetAchievements]);
```

### AchievementsSection

**Responsibilities**:
- Render bento box layout container
- Define CSS Grid structure with named areas
- Handle responsive breakpoints
- Compose child card components

**Layout Structure** (desktop):
```
┌─────────────┬─────────┬─────────┐
│  Profile    │ Verified│ Assisted│
│  (2 rows)   │         │         │
├─────────────┼─────────┼─────────┤
│  Profile    │ Warrior │ Streak  │
│  (cont.)    │         │         │
├─────────────┴─────────┴─────────┤
│  Treemap (60%)    │  HeatMap   │
│                   │  (40%)     │
├───────────────────┴────────────┤
│  Best Friends (full width)     │
└────────────────────────────────┘
```

**Responsive Behavior**:
- Mobile: All cards stack vertically
- Tablet: Treemap + HeatMap side-by-side, rest stack
- Desktop: Full bento grid as shown above

### ProfileMetricsCard

**Responsibilities**:
- Display merged hero header (profile pic + accountSlug + title)
- Show verified count, assisted count, percentile
- Display current streak and longest streak
- Use user's profile picture from Clerk (`owner.imageUrl`)

**Data Source**: `useAchievementsStore((s) => s.profileMetrics)`

**Layout** (merged hero + metrics):
```
┌──────────────────────────────────┐
│  [Avatar]  @account-slug         │
│            LinkedIn Engagement   │
│            2026                  │
├──────────────────────────────────┤
│  🎯 234      🤝 156      🏆 TOP  │
│  Verified   Assisted     5%      │
│  Comments   Comments   Warrior   │
│  >80% touch 50-80% touch         │
├──────────────────────────────────┤
│  🔥 12 days   🏅 45 days          │
│  Current      Longest            │
│  Streak       Streak             │
└──────────────────────────────────┘
```

**Fallback**:
- If no `owner.imageUrl`, show `<Avatar fallback={accountSlug[0].toUpperCase()} />`
- If no streaks (0 comments), show "—" instead of 0

### NetworkTreemapCard

**Responsibilities**:
- Visualize interaction frequency via box size
- Render profile pictures inside boxes
- Show names and interaction counts on hover
- Handle click to open LinkedIn profile in new tab

**Data Source**: `useAchievementsStore((s) => s.networkData)` (top 50 profiles)

**Visualization**:
- Use Recharts `<Treemap>` component
- `dataKey="interactionCount"` for box sizing
- Custom `content` renderer for profile pics + names
- Color scheme: `chart-1` through `chart-5` (rotate by index)
- Aspect ratio: 4:3 (wider boxes for readability)

**Interaction**:
- Hover: Show tooltip with full name + exact count
- Click: Navigate to `authorProfileUrl` in new tab

**Empty State**:
- If `networkData` is empty, show "No interactions yet" message

### ActivityHeatMapCard

**Responsibilities**:
- Display 365-day contribution grid (GitHub-style)
- Color intensity based on comment count (0 = cream, 10+ = dark green)
- Show tooltip on hover with date + count
- Responsive: Show last 180 days on mobile, 365 on desktop

**Data Source**: `useAchievementsStore((s) => s.activityData)` (365 daily buckets)

**Visualization**:
- Custom grid component (7 rows x 52 columns = 364 cells + 1)
- Each cell represents one day
- Color bins:
  - 0 comments: `#fbf6e5` (card background)
  - 1-2 comments: `#1b9aaa` (chart-1, 20% opacity)
  - 3-5 comments: `#1b9aaa` (chart-1, 40% opacity)
  - 6-9 comments: `#1b9aaa` (chart-1, 70% opacity)
  - 10+ comments: `#1b9aaa` (chart-1, 100% opacity)
- Borders: 1px solid black (neobrutalist)
- Cell size: 12px x 12px (desktop), 8px x 8px (mobile)

**Tooltip**:
- Radix UI `<Tooltip>` on cell hover
- Content: "March 15, 2026 - 4 comments"
- Delay: 300ms

**Mobile Optimization**:
- Show last 180 days (26 weeks) instead of 365
- Reduce cell size to 8px
- Maintain readable spacing

### BestFriendsCard

**Responsibilities**:
- Display top 5 most-engaged profiles
- Show rank (gold/silver/bronze medals for top 3)
- Render profile pictures, names, interaction counts
- Include horizontal progress bars for visual comparison

**Data Source**: `useAchievementsStore((s) => s.networkData?.slice(0, 5))`

**Layout**:
```
┌────────────────────────────────────┐
│  TOP 5 BEST FRIENDS 🏆             │
├────────────────────────────────────┤
│  🥇 1. [Avatar] Jane Smith         │
│        ████████████████ 45         │
│  🥈 2. [Avatar] Bob Jones          │
│        ████████████ 32             │
│  🥉 3. [Avatar] Sue Lee            │
│        ███████████ 28              │
│  4. [Avatar] Tim Brown - 15        │
│  5. [Avatar] Alex Wilson - 12     │
└────────────────────────────────────┘
```

**Progress Bar**:
- Width proportional to `interactionCount`
- Max width = highest count in top 5
- Color: `chart-2` (green #308169)
- Height: 8px
- Show count number at end

**Empty State**:
- If fewer than 5 profiles, show available (e.g., "Top 3 Best Friends")
- If no profiles, show "No interactions yet" message

---

## 8. Backend Endpoints and Workers

Not applicable - all data fetched via tRPC (no dedicated backend service).

---

## 9. Infrastructure Deployment

No infrastructure changes required - deploys with existing Next.js app on Vercel.

---

## 10. Database Schema (Prisma-style)

**Existing Models** (No changes required):

```prisma
model LinkedInAccount {
  id               String   @id @default(uuid())
  profileSlug      String?  @unique
  ownerId          String?
  owner            User?    @relation(fields: [ownerId], references: [id])
  comments         Comment[]
  // ... other fields
}

model User {
  id                  String   @id  // Clerk user ID
  imageUrl            String?       // Profile picture
  linkedInAccounts    LinkedInAccount[]
  // ... other fields
}

model Comment {
  id                String    @id
  accountId         String
  peakTouchScore    Int?       // 0-100, for verified/assisted
  status            CommentStatus
  commentedAt       DateTime?
  authorName        String?
  authorProfileUrl  String?
  authorAvatarUrl   String?
  account           LinkedInAccount? @relation(fields: [accountId], references: [id])

  @@index([accountId])
  @@index([status])
  @@index([commentedAt])
}

enum CommentStatus {
  DRAFT
  SCHEDULED
  QUEUED
  POSTING
  POSTED  // Only count these for metrics
  FAILED
  CANCELLED
}
```

**Suggested Indexes** (Add for performance):

```prisma
model Comment {
  // ... existing fields

  @@index([accountId, status, peakTouchScore])  // For verified/assisted counts
  @@index([accountId, status, commentedAt])     // For streak calculation
  @@index([accountId, status, authorProfileUrl]) // For network groupBy
}
```

---

## 11. API Surface (tRPC)

**New Router**: `packages/api/src/router/achievements.ts`

### Queries

#### `getProfileMetrics`

**Auth**: `accountProcedure` (validates account ownership)

**Input**:
```typescript
{
  accountId: string; // Passed via accountProcedure context
}
```

**Output**:
```typescript
{
  verifiedCount: number;        // peakTouchScore >= 80
  assistedCount: number;         // peakTouchScore >= 50 AND < 80
  percentile: number;            // Global ranking (0-100)
  currentStreak: number;         // Consecutive days with comments
  longestStreak: number;         // Max consecutive days ever
  profileSlug: string;
  profileImageUrl: string | null; // From owner.imageUrl
}
```

**Implementation**:
```typescript
getProfileMetrics: accountProcedure
  .query(async ({ ctx }) => {
    const accountId = ctx.activeAccount.id;

    // Verified comments
    const verifiedCount = await ctx.db.comment.count({
      where: {
        accountId,
        status: 'POSTED',
        peakTouchScore: { gte: 80 }
      }
    });

    // Assisted comments
    const assistedCount = await ctx.db.comment.count({
      where: {
        accountId,
        status: 'POSTED',
        peakTouchScore: { gte: 50, lt: 80 }
      }
    });

    // Global percentile
    const totalComments = await ctx.db.comment.count({
      where: { accountId, status: 'POSTED' }
    });

    const allAccountsComments = await ctx.db.comment.groupBy({
      by: ['accountId'],
      where: { status: 'POSTED' },
      _count: { id: true }
    });

    const accountsWithFewer = allAccountsComments.filter(
      acc => acc._count.id < totalComments
    ).length;

    const percentile = Math.round(
      (accountsWithFewer / allAccountsComments.length) * 100
    );

    // Streaks (calculate from commentedAt dates)
    const comments = await ctx.db.comment.findMany({
      where: {
        accountId,
        status: 'POSTED',
        commentedAt: { not: null }
      },
      select: { commentedAt: true },
      orderBy: { commentedAt: 'desc' }
    });

    const { currentStreak, longestStreak } = calculateStreaks(comments);

    // Profile info
    const account = await ctx.db.linkedInAccount.findUnique({
      where: { id: accountId },
      include: { owner: { select: { imageUrl: true } } }
    });

    return {
      verifiedCount,
      assistedCount,
      percentile,
      currentStreak,
      longestStreak,
      profileSlug: account.profileSlug ?? '',
      profileImageUrl: account.owner?.imageUrl ?? null
    };
  })
```

#### `getNetworkData`

**Auth**: `accountProcedure`

**Input**:
```typescript
{
  accountId: string; // From context
  limit?: number;    // Default: 50
}
```

**Output**:
```typescript
{
  authorProfileUrl: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  interactionCount: number;
}[]
```

**Implementation**:
```typescript
getNetworkData: accountProcedure
  .input(z.object({
    limit: z.number().optional().default(50)
  }))
  .query(async ({ ctx, input }) => {
    const accountId = ctx.activeAccount.id;

    // Group by author, count interactions
    const grouped = await ctx.db.comment.groupBy({
      by: ['authorProfileUrl'],
      where: {
        accountId,
        status: 'POSTED',
        authorProfileUrl: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: input.limit
    });

    // Fetch author details for each unique URL
    const authorUrls = grouped.map(g => g.authorProfileUrl!);

    const authors = await ctx.db.comment.findMany({
      where: {
        accountId,
        authorProfileUrl: { in: authorUrls }
      },
      select: {
        authorProfileUrl: true,
        authorName: true,
        authorAvatarUrl: true
      },
      distinct: ['authorProfileUrl']
    });

    // Combine counts with author info
    return grouped.map(g => {
      const author = authors.find(a => a.authorProfileUrl === g.authorProfileUrl);
      return {
        authorProfileUrl: g.authorProfileUrl!,
        authorName: author?.authorName ?? null,
        authorAvatarUrl: author?.authorAvatarUrl ?? null,
        interactionCount: g._count.id
      };
    });
  })
```

#### `getActivityData`

**Auth**: `accountProcedure`

**Input**:
```typescript
{
  accountId: string; // From context
  days?: number;     // Default: 365
}
```

**Output**:
```typescript
{
  date: string;  // ISO date (YYYY-MM-DD)
  count: number; // Comments on that day
}[]
```

**Implementation**:
```typescript
getActivityData: accountProcedure
  .input(z.object({
    days: z.number().optional().default(365)
  }))
  .query(async ({ ctx, input }) => {
    const accountId = ctx.activeAccount.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);

    // Fetch all comments in date range
    const comments = await ctx.db.comment.findMany({
      where: {
        accountId,
        status: 'POSTED',
        commentedAt: { gte: startDate, not: null }
      },
      select: { commentedAt: true }
    });

    // Bucket by day
    const buckets = new Map<string, number>();

    for (let i = 0; i < input.days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      buckets.set(dateKey, 0);
    }

    comments.forEach(comment => {
      const dateKey = comment.commentedAt!.toISOString().split('T')[0];
      buckets.set(dateKey, (buckets.get(dateKey) ?? 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })
```

**Helper Function** (streak calculation):

```typescript
function calculateStreaks(comments: { commentedAt: Date | null }[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (comments.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Get unique dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      comments
        .filter(c => c.commentedAt !== null)
        .map(c => c.commentedAt!.toISOString().split('T')[0])
    )
  ).sort().reverse(); // Newest first

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  // Calculate current streak (from today backward)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Current streak must include today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    currentStreak = 0;
  } else {
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i]);
      const previous = new Date(uniqueDates[i - 1]);
      const diffDays = Math.floor(
        (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak (scan entire history)
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i - 1]);
    const diffDays = Math.floor(
      (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
}
```

---

## 12. Real-time Event Model

Not applicable - no WebSocket or real-time updates. Data loads on page visit only.

---

## 13. Phased Delivery Plan

### Current Status

⏳ **Phase 1**: Database Indexes and Schema Validation (PLANNED)
⏳ **Phase 2**: tRPC Router Setup (PLANNED)
⏳ **Phase 3**: Zustand Store Implementation (PLANNED)
⏳ **Phase 4**: Bento Layout Component Structure (PLANNED)
⏳ **Phase 5**: Profile Metrics Card (PLANNED)
⏳ **Phase 6**: Network Treemap Card (PLANNED)
⏳ **Phase 7**: Activity Heat Map Card (PLANNED)
⏳ **Phase 8**: Best Friends Card (PLANNED)
⏳ **Phase 9**: Responsive Design & Polish (PLANNED)
⏳ **Phase 10**: Testing & Performance Optimization (PLANNED)

**Immediate Next Steps**: Phase 1 - Database Indexes

---

## 14. Features List (MoSCoW)

### Must-Have (M)

- [M-001] Display verified comment count (peakTouchScore >= 80)
- [M-002] Display assisted comment count (peakTouchScore 50-80)
- [M-003] Show global percentile ranking ("Top X%")
- [M-004] Current streak calculation and display
- [M-005] Longest streak calculation and display
- [M-006] Network treemap visualization (top 50 profiles)
- [M-007] 365-day activity heat map
- [M-008] Top 5 best friends ranking with progress bars
- [M-009] Bento box layout on desktop
- [M-010] Vertical stacking on mobile
- [M-011] Loading skeletons during data fetch
- [M-012] Error boundaries and retry functionality
- [M-013] Neobrutalist theme adherence (black borders, hard shadows)
- [M-014] Profile picture from user.imageUrl (with fallback)

### Should-Have (S)

- [S-001] Hover tooltips on heat map cells
- [S-002] Click-to-LinkedIn on network treemap boxes
- [S-003] Medal icons for top 3 in best friends ranking
- [S-004] Smooth transitions between loading/success states
- [S-005] Empty states when no data available
- [S-006] Accessibility labels (ARIA) on all interactive elements
- [S-007] Keyboard navigation for treemap

### Could-Have (C)

- [C-001] "Last updated" timestamp
- [C-002] Manual refresh button
- [C-003] Animated number counters (count-up effect)
- [C-004] Expandable heat map (show full year on mobile via toggle)
- [C-005] Download as PNG button
- [C-006] Dark mode optimizations

### Won't-Have (W)

- [W-001] Real-time data updates (polling/WebSocket)
- [W-002] Historical trend charts (year-over-year)
- [W-003] Achievement badges/milestones
- [W-004] Social media direct-share buttons
- [W-005] Email notifications for achievements
- [W-006] Organization-level comparisons
- [W-007] Leaderboard across all users

---

## 15. RFCs

### RFC-001: Database Indexes for Performance

**Summary**: Add composite indexes to `Comment` model for efficient querying of achievements metrics.

**Dependencies**: None

**Stages**:

**Stage 1: Schema Analysis**
1. Review existing indexes in `Comment` model
2. Identify slow queries via Prisma query logs (if available)
3. Determine optimal index combinations for:
   - Verified/assisted counts (`accountId + status + peakTouchScore`)
   - Streak calculations (`accountId + status + commentedAt`)
   - Network grouping (`accountId + status + authorProfileUrl`)

**Stage 2: Index Implementation**
1. Add indexes to `packages/db/prisma/models/comment.prisma`:
   ```prisma
   @@index([accountId, status, peakTouchScore])
   @@index([accountId, status, commentedAt])
   @@index([accountId, status, authorProfileUrl])
   ```
2. Generate Prisma migration: `pnpm db:migrate dev`
3. Review migration SQL for correctness
4. Test migration on local database

**Stage 3: Production Deployment**
1. Run migration on staging database
2. Verify index creation via PostgreSQL `\d+ Comment` command
3. Measure query performance improvements (before/after)
4. Deploy migration to production during low-traffic window

**Acceptance Criteria**:
- [ ] Three new indexes visible in Prisma schema
- [ ] Migration successfully applied to local/staging/production
- [ ] Query execution time reduced by >50% for achievements queries
- [ ] No database errors or locking issues during migration

**What's Functional Now**: Database optimized for fast achievements data retrieval

**Ready For**: RFC-002 (tRPC Router Implementation)

---

### RFC-002: tRPC Achievements Router

**Summary**: Create new tRPC router with three procedures for fetching achievements data.

**Dependencies**: RFC-001 (Database Indexes)

**Stages**:

**Stage 1: Router Scaffolding**
1. Create `packages/api/src/router/achievements.ts`
2. Set up router exports and type definitions
3. Define input/output Zod schemas for each procedure
4. Register router in `packages/api/src/router/root.ts`

**Stage 2: getProfileMetrics Implementation**
1. Write `getProfileMetrics` procedure using `accountProcedure`
2. Implement verified count query (`peakTouchScore >= 80`)
3. Implement assisted count query (`peakTouchScore 50-80`)
4. Implement global percentile calculation (cross-account aggregation)
5. Implement streak calculation logic (helper function)
6. Fetch profile slug and image URL via LinkedInAccount → User relation
7. Add error handling and logging
8. Write unit tests for streak calculation function

**Stage 3: getNetworkData Implementation**
1. Write `getNetworkData` procedure with optional limit parameter
2. Implement groupBy query on `authorProfileUrl` with count
3. Fetch distinct author details (name, avatar) for each URL
4. Combine grouped counts with author metadata
5. Sort by interaction count descending
6. Add error handling for missing author data

**Stage 4: getActivityData Implementation**
1. Write `getActivityData` procedure with optional days parameter
2. Calculate start date (today - N days)
3. Fetch all comments in date range
4. Bucket comments by day (create Map with all dates, count per day)
5. Return sorted array of {date, count} objects
6. Add validation to prevent excessive date ranges (max 730 days)

**Stage 5: Testing & Integration**
1. Test all procedures via tRPC playground/Postman
2. Verify accountProcedure authorization works correctly
3. Test with accounts having 0 comments (empty states)
4. Test with accounts having 1000+ comments (performance)
5. Verify type safety end-to-end (tRPC client types generated correctly)

**Acceptance Criteria**:
- [ ] Three procedures callable via tRPC client
- [ ] All procedures return correct data for test accounts
- [ ] Authorization prevents cross-account data access
- [ ] Query execution time <500ms for accounts with <10k comments
- [ ] TypeScript types inferred correctly in Next.js client
- [ ] Empty state handling (accounts with 0 comments)

**API Contracts**:
See [API Surface](#11-api-surface-trpc) section above for full contracts.

**What's Functional Now**: Backend API ready to serve achievements data

**Ready For**: RFC-003 (Zustand Store)

---

### RFC-003: Achievements Zustand Store Setup

**Summary**: Create Zustand store for achievements state management following existing `useAccountStore` pattern.

**Dependencies**: RFC-002 (tRPC Router)

**Stages**:

**Stage 0: Pre-Phase Research**
1. Read existing `useAccountStore` implementation
2. Understand pattern for State/Actions interfaces
3. Identify where to place store file (follow existing pattern)
4. Review Zustand DevTools setup (if any)
5. Present findings and proposed store structure to user

**Stage 1: Store Structure & Types**
1. Create `apps/nextjs/src/stores/zustand-store/achievements-store.ts`
2. Define TypeScript interfaces:
   - `ProfileMetrics` (verified count, assisted count, percentile, streaks, profile info)
   - `NetworkProfile` (author URL, name, avatar, interaction count)
   - `ActivityBucket` (date, count)
   - `AchievementsState` (data + loading + error)
   - `AchievementsActions` (setters + reset)
   - `AchievementsStore` (combined type)
3. Add JSDoc comments for all interfaces

**Stage 2: Store Implementation**
1. Create store with `create<AchievementsStore>()` from zustand
2. Implement initial state (all null, loading false, error null)
3. Implement setter actions:
   - `setProfileMetrics(data)` → `set({ profileMetrics: data })`
   - `setNetworkData(data)` → `set({ networkData: data })`
   - `setActivityData(data)` → `set({ activityData: data })`
   - `setLoading(loading)` → `set({ isLoading: loading })`
   - `setError(error)` → `set({ error })`
   - `reset()` → reset all to initial state
4. Export `useAchievementsStore` hook

**Stage 3: Store Registration**
1. Add to `apps/nextjs/src/stores/zustand-store/index.ts` exports
2. Verify store can be imported elsewhere
3. Test store in isolation (create test file with basic set/get)

**Stage 4: AccountLayout Integration**
1. Import `useAchievementsStore` in AccountLayout
2. Call `reset()` when account changes (in useEffect)
3. Test account switching resets achievements state

**Stage 5: Testing**
1. Create `achievements-store.test.ts`
2. Test initial state (all null)
3. Test each setter action updates correct slice
4. Test reset() clears all state
5. Test store doesn't trigger re-renders when unrelated state changes
6. Verify TypeScript types inferred correctly

**Post-Phase Testing**:
1. Import store in a test component: `const metrics = useAchievementsStore((s) => s.profileMetrics)`
2. Call setter: `useAchievementsStore.getState().setProfileMetrics({ ... })`
3. Verify state updates correctly
4. Check Zustand DevTools shows state changes (if installed)
5. Test account switching triggers reset
6. No console errors or TypeScript errors

**Acceptance Criteria**:
- [ ] Store file created following existing pattern
- [ ] All TypeScript interfaces defined with proper types
- [ ] Store exports `useAchievementsStore` hook
- [ ] Account switching resets achievements state
- [ ] Unit tests pass for all store actions
- [ ] Type safety enforced throughout (no `any` types)
- [ ] Store can be imported and used in components

**What's Functional Now**: Zustand store ready to receive and distribute achievements data

**Ready For**: RFC-004 (Bento Layout & Profile Metrics Card)

---

### RFC-004: Bento Layout & Profile Metrics Card

**Summary**: Build parent bento grid layout and first card component (merged hero + metrics).

**Dependencies**: RFC-003 (Zustand Store)

**Stages**:

**Stage 0: Pre-Phase Research**
1. Review existing bento grid implementations in codebase
2. Analyze CSS Grid vs Tailwind grid utilities
3. Review neobrutalist theme card examples
4. Present proposed layout structure to user

**Stage 1: AchievementsSection Parent Component**
1. Create `apps/nextjs/src/app/(new-dashboard)/[orgSlug]/[accountSlug]/_components/achievements/AchievementsSection.tsx`
2. Define CSS Grid layout with `grid-template-areas`
3. Implement responsive breakpoints:
   - Mobile (<768px): `grid-template-columns: 1fr`
   - Tablet (768-1024px): `grid-template-columns: repeat(2, 1fr)`
   - Desktop (>1024px): `grid-template-areas` bento layout
4. Add Tailwind classes for neobrutalist styling (borders, shadows)
5. Render placeholder divs for each grid area (to visualize layout)

**Stage 2: ProfileMetricsCard Component**
1. Create `ProfileMetricsCard.tsx` in `_components/achievements/cards/`
2. Use `useAchievementsStore((s) => s.profileMetrics)` to get data from Zustand
3. Use `useAchievementsStore((s) => s.isLoading)` for loading state
4. Implement merged hero header section:
   - Avatar component with `profileImageUrl` or fallback
   - Display `@{profileSlug}`
   - Title: "LinkedIn Engagement 2026"
4. Implement metrics grid (3 columns):
   - Verified count with icon (🎯) and label
   - Assisted count with icon (🤝) and label
   - Percentile badge ("TOP X%") with icon (🏆)
5. Implement streaks row (2 columns):
   - Current streak with fire icon (🔥)
   - Longest streak with trophy icon (🏅)
6. Add neobrutalist styling (black borders, hard shadows, card background)
7. Handle loading state (Skeleton components)
8. Handle error state (show "—" for missing data)

**Stage 3: Integration**
1. Import ProfileMetricsCard in AchievementsSection
2. Place in grid-area "profile"
3. Test on different screen sizes (mobile/tablet/desktop)
4. Verify data flows from Context → Card correctly
5. Test with real account data (via tRPC)

**Stage 4: Styling Refinements**
1. Adjust spacing between sections (use Tailwind gap utilities)
2. Ensure black borders on all cards (2px solid)
3. Apply hard shadows (`shadow-md` from theme)
4. Verify color scheme matches neobrutalist palette
5. Add hover states where appropriate
6. Test dark mode compatibility

**Acceptance Criteria**:
- [ ] Bento grid layout visible on desktop (named areas working)
- [ ] Mobile layout stacks all cards vertically
- [ ] ProfileMetricsCard displays all 5 metrics correctly
- [ ] Avatar shows profile picture or fallback initial
- [ ] Loading skeletons appear during query pending
- [ ] Empty state shows "—" when no data available
- [ ] Neobrutalist theme applied (black borders, hard shadows)
- [ ] No visual regressions in existing dashboard cards

**What's Functional Now**: Bento layout renders with first card (profile + metrics)

**Ready For**: RFC-005 (Network Treemap Card)

---

### RFC-005: Network Treemap Visualization

**Summary**: Implement interactive treemap showing engagement network with profile pictures.

**Dependencies**: RFC-004 (Bento Layout)

**Stages**:

**Stage 1: Data Transformation**
1. Create `transformNetworkDataForTreemap()` helper function
2. Map `networkData` to Recharts treemap format:
   ```typescript
   {
     name: string;          // authorName
     size: number;          // interactionCount
     imageUrl: string | null; // authorAvatarUrl
     profileUrl: string;    // authorProfileUrl
   }[]
   ```
3. Handle missing author names (use "Unknown" fallback)
4. Sort by size descending (largest boxes first)
5. Add unit tests for transformation function

**Stage 2: Custom Treemap Content Renderer**
1. Create `TreemapCell.tsx` component
2. Accept props: `x`, `y`, `width`, `height`, `name`, `size`, `imageUrl`, `profileUrl`
3. Render rectangle with neobrutalist border (black 2px)
4. Conditionally render avatar inside box (if width/height > 80px)
5. Render name text (truncate if box too small)
6. Render interaction count in corner
7. Apply color from chart palette (rotate by index)
8. Add hover effect (slightly darken on hover)

**Stage 3: NetworkTreemapCard Component**
1. Create `NetworkTreemapCard.tsx` in `cards/` folder
2. Use `useNetworkData()` hook to get data from Context
3. Transform data with helper function
4. Render Recharts `<Treemap>` component:
   ```tsx
   <Treemap
     data={transformedData}
     dataKey="size"
     aspectRatio={4/3}
     stroke="#000000"
     content={<TreemapCell />}
   />
   ```
5. Wrap in ResponsiveContainer for fluid sizing
6. Add Radix Tooltip for hover details
7. Implement click handler (navigate to LinkedIn profile in new tab)
8. Handle loading state (Skeleton)
9. Handle empty state ("No interactions yet" message)

**Stage 4: Integration & Styling**
1. Import NetworkTreemapCard in AchievementsSection
2. Place in grid-area "treemap" (60% width on desktop)
3. Test responsiveness (treemap scales correctly)
4. Verify click-to-LinkedIn works (opens in new tab)
5. Test hover tooltips (shows full name + exact count)
6. Verify neobrutalist borders on treemap cells
7. Test with various data sizes (5 profiles, 50 profiles)

**Stage 5: Performance Optimization**
1. Memoize transformed data with `useMemo()`
2. Debounce hover tooltips (300ms delay)
3. Lazy-load profile images (use `loading="lazy"`)
4. Test render performance with 50+ boxes

**Acceptance Criteria**:
- [ ] Treemap renders with correct box sizes (proportional to interaction count)
- [ ] Profile pictures appear inside boxes (when box large enough)
- [ ] Author names and counts visible
- [ ] Hover shows tooltip with full details
- [ ] Click navigates to LinkedIn profile in new tab
- [ ] Empty state shows when no network data
- [ ] Loading skeleton appears during query pending
- [ ] Neobrutalist theme applied (black borders, chart colors)
- [ ] Responsive on mobile/tablet/desktop

**What's Functional Now**: Network treemap visualizes top 50 engaged profiles

**Ready For**: RFC-006 (Activity Heat Map Card)

---

### RFC-006: Activity Heat Map Visualization

**Summary**: Build GitHub-style contribution grid showing 365 days of commenting activity.

**Dependencies**: RFC-005 (Network Treemap)

**Stages**:

**Stage 1: Heat Map Grid Component**
1. Create `HeatMapGrid.tsx` component
2. Accept props: `data: { date: string, count: number }[]`, `days: number`
3. Calculate grid dimensions:
   - 7 rows (days of week)
   - N columns (weeks, e.g., 52 for 365 days)
4. Render grid using nested divs or SVG
5. Map each cell to a date
6. Apply color based on count (5-level bins)
7. Add black 1px borders (neobrutalist)

**Stage 2: Color Scheme Implementation**
1. Define color bins:
   ```typescript
   function getHeatMapColor(count: number): string {
     if (count === 0) return '#fbf6e5';  // card bg
     if (count <= 2) return 'rgba(27, 154, 170, 0.2)';  // 20%
     if (count <= 5) return 'rgba(27, 154, 170, 0.4)';  // 40%
     if (count <= 9) return 'rgba(27, 154, 170, 0.7)';  // 70%
     return '#1b9aaa';  // 100% (chart-1)
   }
   ```
2. Apply colors to grid cells
3. Add legend showing color scale (0, 1-2, 3-5, 6-9, 10+)

**Stage 3: Tooltip Implementation**
1. Wrap each cell with Radix `<Tooltip>`
2. Tooltip content: "March 15, 2026 - 4 comments"
3. Format date using `Intl.DateTimeFormat`
4. Add 300ms delay before showing tooltip
5. Test tooltip performance (no lag with 365 cells)

**Stage 4: ActivityHeatMapCard Component**
1. Create `ActivityHeatMapCard.tsx` in `cards/` folder
2. Use `useActivityData()` hook to get data from Context
3. Render HeatMapGrid with activity data
4. Add card header with title: "Activity Heat Map"
5. Add month labels above grid (Jan, Feb, Mar, ...)
6. Add day labels on left (Mon, Tue, Wed, ...)
7. Handle loading state (Skeleton grid)
8. Handle empty state ("No activity yet" message)

**Stage 5: Responsive Optimization**
1. Desktop (>1024px): Show full 365 days (52 weeks)
2. Tablet (768-1024px): Show 365 days with smaller cells (8px)
3. Mobile (<768px): Show last 180 days (26 weeks) to fit width
4. Adjust cell size via CSS variables
5. Test on various screen sizes

**Stage 6: Integration**
1. Import ActivityHeatMapCard in AchievementsSection
2. Place in grid-area "heatmap" (40% width on desktop)
3. Verify layout looks balanced next to treemap (60/40 split)
4. Test month/day labels alignment
5. Test tooltip interactions on mobile (tap vs hover)

**Acceptance Criteria**:
- [ ] Heat map displays 365 days in 7x52 grid
- [ ] Color intensity matches comment count bins
- [ ] Hover tooltip shows date + count
- [ ] Month and day labels aligned correctly
- [ ] Mobile shows last 180 days (readable on narrow screens)
- [ ] Loading skeleton appears during query pending
- [ ] Empty state shows when no activity data
- [ ] Neobrutalist borders applied (1px black between cells)
- [ ] No performance issues with 365 tooltips

**What's Functional Now**: Activity heat map visualizes daily engagement for past year

**Ready For**: RFC-007 (Best Friends Ranking Card)

---

### RFC-007: Best Friends Ranking Card

**Summary**: Display top 5 most-engaged profiles with rankings, avatars, and progress bars.

**Dependencies**: RFC-006 (Activity Heat Map)

**Stages**:

**Stage 1: BestFriendsCard Component**
1. Create `BestFriendsCard.tsx` in `cards/` folder
2. Use `useNetworkData()` hook to get data from Context
3. Slice first 5 profiles: `networkData.slice(0, 5)`
4. Calculate max interaction count for progress bar scaling
5. Render card header: "Top 5 Best Friends 🏆"
6. Handle loading state (Skeleton list)
7. Handle empty state ("No interactions yet")

**Stage 2: Ranking List Item Component**
1. Create `BestFriendItem.tsx` sub-component
2. Accept props: `rank: number`, `name: string`, `avatarUrl: string | null`, `count: number`, `maxCount: number`, `profileUrl: string`
3. Render rank indicator:
   - Rank 1: 🥇 gold medal
   - Rank 2: 🥈 silver medal
   - Rank 3: 🥉 bronze medal
   - Rank 4-5: Plain number
4. Render Avatar component (with fallback initial)
5. Render name (truncate if too long)
6. Render interaction count at end
7. Add hover state (slight background color change)

**Stage 3: Progress Bar Implementation**
1. Create `ProgressBar.tsx` component
2. Accept props: `value: number`, `max: number`, `color: string`
3. Calculate percentage: `(value / max) * 100`
4. Render outer container (gray background)
5. Render inner bar (green background, chart-2 color)
6. Add neobrutalist border (1px black)
7. Apply hard shadow if needed
8. Animate width on mount (CSS transition)

**Stage 4: Layout & Styling**
1. Arrange items vertically in list
2. Add spacing between items (gap-3)
3. Apply neobrutalist card styling (black border, hard shadow)
4. Show progress bars for top 3 ranks only (ranks 4-5 show count inline)
5. Ensure consistent height for all items
6. Test with varying name lengths (truncation)

**Stage 5: Interactions**
1. Make entire item clickable (navigate to LinkedIn profile)
2. Add accessible link with aria-label: "View {name} on LinkedIn"
3. Open in new tab (`target="_blank" rel="noopener noreferrer"`)
4. Add hover cursor pointer
5. Test keyboard navigation (tab, enter)

**Stage 6: Integration**
1. Import BestFriendsCard in AchievementsSection
2. Place in grid-area "friends" (full width)
3. Test responsive layout (stacks on mobile, full width on all sizes)
4. Verify data flows correctly from Context
5. Test with accounts having <5 profiles (shows available only)

**Acceptance Criteria**:
- [ ] Top 5 profiles displayed in descending order
- [ ] Medal icons for top 3 ranks
- [ ] Progress bars proportional to interaction count
- [ ] Avatars show profile pictures or fallback initials
- [ ] Click navigates to LinkedIn profile in new tab
- [ ] Loading skeleton appears during query pending
- [ ] Empty state shows when no network data
- [ ] Neobrutalist theme applied (borders, shadows)
- [ ] Keyboard accessible (tab, enter)

**What's Functional Now**: Best friends ranking displays top 5 engaged profiles

**Ready For**: RFC-008 (Responsive Design & Polish)

---

### RFC-008: Responsive Design & Polish

**Summary**: Finalize responsive behavior, accessibility, and visual polish.

**Dependencies**: RFC-007 (Best Friends Card)

**Stages**:

**Stage 1: Mobile Responsive Audit**
1. Test on iPhone SE (375px width)
2. Test on iPhone 12 (390px width)
3. Test on iPad Mini (768px width)
4. Test on iPad Pro (1024px width)
5. Identify layout issues (overflow, cramped spacing, unreadable text)
6. Fix bento grid stacking on mobile (<768px)
7. Ensure all cards fill width on mobile
8. Test horizontal scrolling (should be none)

**Stage 2: Tailwind Responsive Utilities**
1. Audit all components for responsive classes
2. Add `md:` and `lg:` prefixes where needed
3. Ensure text sizes scale appropriately:
   - Mobile: smaller text (text-sm, text-base)
   - Desktop: larger text (text-lg, text-xl)
4. Adjust spacing/padding for mobile (reduce gap, padding)
5. Hide/show elements conditionally (e.g., hide heat map legend on mobile)

**Stage 3: Accessibility (A11y)**
1. Add ARIA labels to all interactive elements
2. Ensure keyboard navigation works:
   - Tab through cards
   - Enter to click links
   - Escape to close tooltips
3. Add focus visible states (outline for keyboard users)
4. Test with screen reader (VoiceOver on Mac)
5. Verify color contrast meets WCAG AA (4.5:1 for text)
6. Add skip links if needed
7. Ensure all images have alt text

**Stage 4: Performance Optimization**
1. Memoize expensive computations (streak calculation, treemap transformation)
2. Use React.memo for card components
3. Optimize image loading (lazy load avatars)
4. Reduce re-renders (check React DevTools Profiler)
5. Run Lighthouse audit (target score >90)
6. Optimize bundle size (check for unnecessary imports)

**Stage 5: Visual Polish**
1. Verify neobrutalist theme consistency across all cards
2. Ensure black borders are 2px solid everywhere
3. Apply hard shadows uniformly (shadow-md)
4. Check color palette usage (chart-1 through chart-5)
5. Ensure spacing is consistent (use theme spacing variables)
6. Add subtle transitions for hover states (transition-colors)
7. Test dark mode compatibility (if applicable)

**Stage 6: Loading & Error States**
1. Audit all loading skeletons (correct size, shape)
2. Ensure skeletons match final component layout
3. Test error states (simulate query failures)
4. Verify error messages are user-friendly
5. Test retry functionality (refetchAll button)
6. Ensure empty states have clear messaging

**Stage 7: Cross-Browser Testing**
1. Test on Chrome (latest)
2. Test on Firefox (latest)
3. Test on Safari (latest)
4. Test on Edge (latest)
5. Identify and fix browser-specific issues
6. Verify CSS Grid works on all browsers
7. Check Recharts rendering on all browsers

**Acceptance Criteria**:
- [ ] All breakpoints work correctly (mobile/tablet/desktop)
- [ ] No horizontal scrolling on any screen size
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces content properly
- [ ] Lighthouse performance score >90
- [ ] Color contrast meets WCAG AA
- [ ] Loading skeletons match final layout
- [ ] Error states are user-friendly
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Dark mode compatible (if applicable)

**What's Functional Now**: Achievements dashboard fully responsive, accessible, and polished

**Ready For**: RFC-009 (Testing & QA)

---

### RFC-009: Testing & Quality Assurance

**Summary**: Comprehensive testing coverage for achievements dashboard.

**Dependencies**: RFC-008 (Responsive Design & Polish)

**Stages**:

**Stage 1: Unit Tests**
1. Write tests for streak calculation helper function
2. Write tests for data transformation functions (treemap, heat map)
3. Write tests for color bin functions (heat map colors)
4. Write tests for date formatting utilities
5. Ensure 100% coverage for helper functions

**Stage 2: Component Tests (React Testing Library)**
1. Test AchievementsProvider with mock tRPC
2. Test ProfileMetricsCard with mock data
3. Test NetworkTreemapCard with mock data
4. Test ActivityHeatMapCard with mock data
5. Test BestFriendsCard with mock data
6. Test loading states (query pending)
7. Test error states (query failed)
8. Test empty states (no data)

**Stage 3: Integration Tests**
1. Test full achievements section with real tRPC calls (against test database)
2. Test account switching (different accountIds)
3. Test refetch functionality
4. Test error recovery (retry after failure)
5. Test data flow from tRPC → Context → Components

**Stage 4: End-to-End Tests (Playwright)**
1. Test page load and initial render
2. Test interactions (hover tooltips, click links)
3. Test responsive behavior (resize viewport)
4. Test keyboard navigation
5. Test error scenarios (simulate network failure)
6. Test with real production-like data

**Stage 5: Performance Testing**
1. Test query performance (measure execution time)
2. Test with large datasets (10,000+ comments)
3. Test render performance (measure React render time)
4. Profile with React DevTools
5. Run Lighthouse audits
6. Test on slow 3G network (throttle in DevTools)

**Stage 6: Manual QA**
1. Test on real LinkedIn accounts with varying data:
   - Account with 0 comments
   - Account with 1-10 comments
   - Account with 100+ comments
   - Account with 1000+ comments
2. Test all user interactions manually
3. Test on different devices (iPhone, iPad, Android)
4. Test on different browsers
5. Verify no console errors
6. Verify no visual glitches
7. Verify data accuracy (manual calculation vs dashboard)

**Stage 7: Bug Fixing**
1. Document all bugs found in Stages 1-6
2. Prioritize bugs (critical, major, minor)
3. Fix critical bugs immediately
4. Fix major bugs before launch
5. Create tickets for minor bugs (post-launch)

**Acceptance Criteria**:
- [ ] Unit tests pass with 100% coverage for helpers
- [ ] Component tests cover all major scenarios
- [ ] Integration tests pass against test database
- [ ] E2E tests pass on all supported browsers
- [ ] Performance meets targets (<3s load, <100ms interactions)
- [ ] Manual QA finds no critical bugs
- [ ] No console errors in production
- [ ] Data accuracy verified manually

**What's Functional Now**: Achievements dashboard fully tested and production-ready

**Ready For**: Production Deployment

---

## 16. Rules (for this project)

### Tech Stack

- **Frontend**: React 18, Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (neobrutalist theme)
- **Data Fetching**: tRPC, React Query
- **Visualization**: Recharts (treemap), custom SVG/div grid (heat map)
- **Database**: Prisma ORM, PostgreSQL (Supabase)
- **Authentication**: Clerk (existing)

### Code Standards

- Follow existing codebase conventions
- Use TypeScript strict mode
- No `any` types (use `unknown` if necessary)
- Prefer functional components with hooks
- Use `const` over `let`, avoid `var`
- Destructure props in component signature
- Use named exports (no default exports except page.tsx)

### Architecture Patterns

- **Data Fetching**: tRPC procedures return plain objects (no Prisma models directly)
- **Context**: Use React Context for cross-component data sharing
- **Components**: Co-locate related components in `_components/` folder
- **Styling**: Tailwind utilities first, CSS modules only if absolutely necessary
- **Performance**: Memoize expensive computations, use React.memo judiciously

### Performance

- Query execution: <500ms for <10k comments
- Page load: <3s on slow 3G
- Interaction latency: <100ms
- Lighthouse score: >90

### Security

- All tRPC procedures require authentication (`accountProcedure`)
- Validate account ownership before returning data
- No raw SQL (use Prisma only)
- Sanitize user input (accountSlug validation)

### Documentation

- JSDoc comments for all public functions/components
- README updates for new features
- Inline comments for complex logic only
- Type definitions serve as documentation

---

## 17. Verification (Comprehensive Review)

### Gap Analysis

**Missing Specifications**:
- Screenshot dimensions (if manual screenshot, what aspect ratio to encourage?)
  - **Resolution**: Document recommended viewport width (1200px) for best social media screenshots
- Heat map cell interactivity on mobile (tap vs hover)
  - **Resolution**: Use touch-friendly tooltips (tap to show, tap outside to hide)
- Percentile calculation accuracy (what if tie in comment counts?)
  - **Resolution**: Use `accountId` as tiebreaker (alphabetical order)

**Ambiguities Resolved**:
- Profile picture source: Confirmed `User.imageUrl` from Clerk
- Mobile heat map: Show last 180 days instead of 365
- Empty states: Show user-friendly messages, not blank cards

### Quality Assessment

| Criteria | Score | Reason |
|----------|-------|--------|
| **Completeness** | 95/100 | All must-have features specified; minor details (exact tooltip text) left to implementation |
| **Clarity** | 90/100 | Clear architecture decisions and component responsibilities; some implementation details require developer judgment |
| **Feasibility** | 100/100 | All features implementable with existing tech stack; no blockers identified |
| **Performance** | 85/100 | Database queries optimized with indexes; some concern about percentile calculation at scale (10k+ accounts) |
| **Maintainability** | 90/100 | Modular architecture with clear separation of concerns; Context pattern may require refactoring if achievements expand |
| **Accessibility** | 80/100 | Basic a11y covered; advanced features (screen reader announcements for live data) not fully specified |
| **Security** | 95/100 | Strong authentication and authorization; minor concern about revealing global user count via percentile |

---

## 18. Change Management (for updates mid-flight)

**Change Request Process**:
1. Classify change (New feature, Modify existing, Remove, Scope change, Technical debt, Timeline)
2. Analyze impact (Components affected, Timeline impact, Dependencies, UX impact)
3. Determine strategy (Immediate, Schedule for next phase, Defer to post-launch)
4. Update plan sections (Component Details, RFCs, Acceptance Criteria)
5. Communicate to stakeholders (document decision and rationale)
6. Track risks (add to Risks section)

**Example Change Scenarios**:
- User requests "Export as PNG" button mid-implementation → Defer to post-launch (out of scope for V1)
- Performance testing reveals percentile query too slow → Immediate fix (cache percentile calculations, regenerate hourly)
- Designer requests different color palette → Schedule for next phase (after core functionality complete)

---

## 19. Ops Runbook

### Deployment

**Pre-Deployment Checklist**:
- [ ] All RFCs completed
- [ ] Tests passing (unit, integration, E2E)
- [ ] Database migration applied to staging
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Manual QA signed off

**Deployment Steps**:
1. Create feature branch: `feature/linkedin-achievements-dashboard`
2. Implement RFCs 1-9 in order
3. Submit PR with screenshots and test results
4. Code review (2 approvals required)
5. Merge to main
6. Deploy to staging (Vercel preview)
7. Run smoke tests on staging
8. Deploy to production (Vercel production)
9. Monitor error logs for 24 hours

**Rollback Plan**:
- Revert PR if critical bug discovered
- Database migrations are additive (indexes), safe to keep
- No data loss risk (read-only feature)

### Monitoring

**Metrics to Track**:
- Query execution time (tRPC procedures)
- Page load time (account dashboard)
- Error rate (tRPC failures)
- User engagement (how many users visit achievements section)

**Alerts**:
- tRPC query timeout (>5s)
- Error rate >1%
- Database CPU usage >80%

### Maintenance

**Monthly Tasks**:
- Review query performance (check for slow queries)
- Update dependencies (Recharts, React Query, Prisma)
- Audit database indexes (ensure still optimal)

**Quarterly Tasks**:
- Accessibility audit
- Performance benchmarking
- User feedback review (gather feature requests)

---

## 20. Acceptance Criteria (Versioned)

### V1.0 (MVP Launch)

**Functional Requirements**:
- [ ] Verified comment count displayed (peakTouchScore >= 80)
- [ ] Assisted comment count displayed (peakTouchScore 50-80)
- [ ] Global percentile ranking displayed ("Top X% Engage Warrior")
- [ ] Current streak displayed (consecutive days)
- [ ] Longest streak displayed (max consecutive days)
- [ ] Network treemap renders with top 50 profiles
- [ ] Heat map shows 365 days of activity (180 on mobile)
- [ ] Best friends top 5 list with progress bars
- [ ] Profile picture from user.imageUrl (or fallback initial)
- [ ] Bento box layout on desktop
- [ ] Vertical stacking on mobile

**Non-Functional Requirements**:
- [ ] Page load <3s on slow 3G
- [ ] Query execution <500ms for accounts with <10k comments
- [ ] Lighthouse performance score >90
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Works on Chrome, Firefox, Safari, Edge (last 2 versions)
- [ ] No console errors in production
- [ ] No horizontal scrolling on any screen size

**User Experience**:
- [ ] Loading skeletons appear during data fetch
- [ ] Error boundaries catch failures with retry option
- [ ] Empty states show user-friendly messages
- [ ] Tooltips provide additional context on hover
- [ ] Links open LinkedIn profiles in new tab
- [ ] Keyboard navigation works throughout

---

## 21. Future Work

### Post-V1 Enhancements

**Phase 2 (Q2 2026)**:
- Screenshot/share button (export as PNG)
- Manual refresh button
- Animated number counters (count-up effect)
- Achievement badges (milestones: 100 comments, 30-day streak)
- Organization-level ranking (compare within org)

**Phase 3 (Q3 2026)**:
- Historical trends (monthly/yearly comparison)
- Real-time updates (WebSocket for live metrics)
- Email notifications for achievements
- Dark mode optimizations
- Downloadable achievement report (PDF)

**Phase 4 (Q4 2026)**:
- Gamification features (levels, XP, leaderboards)
- Social comparison (opt-in, compare with peers)
- Third-party integrations (share to Twitter/LinkedIn directly)
- Analytics dashboard (track achievements over time)

### Technical Debt

- Consider migrating Context to Zustand if state management becomes complex
- Optimize percentile calculation (cache globally, regenerate hourly)
- Extract heat map component to `@sassy/ui` for reusability
- Add E2E tests for all user flows
- Implement lazy loading for treemap images

---

## Implementation Checklist (Complete Workflow)

**Phase 1: Database Indexes** (30 min)
- [ ] Add indexes to `Comment` model in Prisma schema
- [ ] Generate migration: `pnpm db:migrate dev`
- [ ] Apply migration to staging database
- [ ] Verify indexes created: `psql` → `\d+ Comment`
- [ ] Deploy migration to production

**Phase 2: tRPC Router** (3 hours)
- [ ] Create `achievements.ts` router file
- [ ] Implement `getProfileMetrics` procedure
- [ ] Implement `getNetworkData` procedure
- [ ] Implement `getActivityData` procedure
- [ ] Write streak calculation helper function
- [ ] Register router in root.ts
- [ ] Test procedures via tRPC playground
- [ ] Write unit tests for streak helper

**Phase 3: Context Provider** (2 hours)
- [ ] Create `AchievementsContext.tsx` file
- [ ] Define TypeScript types for Context value
- [ ] Implement `AchievementsProvider` component
- [ ] Set up 3 `useQuery` hooks
- [ ] Memoize Context value
- [ ] Create `useAchievements()` hook
- [ ] Create helper hooks (useProfileMetrics, etc.)
- [ ] Write integration tests for provider

**Phase 4: Bento Layout** (2 hours)
- [ ] Create `AchievementsSection.tsx` component
- [ ] Define CSS Grid with `grid-template-areas`
- [ ] Implement responsive breakpoints
- [ ] Apply neobrutalist styling
- [ ] Test layout on mobile/tablet/desktop
- [ ] Integrate into account dashboard page

**Phase 5: Profile Metrics Card** (3 hours)
- [ ] Create `ProfileMetricsCard.tsx` component
- [ ] Implement hero header (avatar + title)
- [ ] Implement metrics grid (verified/assisted/percentile)
- [ ] Implement streaks row (current/longest)
- [ ] Add loading skeleton
- [ ] Add error handling
- [ ] Apply neobrutalist styling
- [ ] Test with real data

**Phase 6: Network Treemap Card** (4 hours)
- [ ] Create data transformation helper
- [ ] Create `TreemapCell.tsx` custom renderer
- [ ] Create `NetworkTreemapCard.tsx` component
- [ ] Integrate Recharts `<Treemap>`
- [ ] Add hover tooltips
- [ ] Implement click-to-LinkedIn
- [ ] Add loading/error/empty states
- [ ] Test with varying data sizes

**Phase 7: Activity Heat Map Card** (4 hours)
- [ ] Create `HeatMapGrid.tsx` component
- [ ] Implement color bin function
- [ ] Create `ActivityHeatMapCard.tsx` component
- [ ] Add month and day labels
- [ ] Implement Radix tooltips
- [ ] Optimize for mobile (180 days)
- [ ] Add loading/error/empty states
- [ ] Test tooltip performance

**Phase 8: Best Friends Card** (3 hours)
- [ ] Create `BestFriendItem.tsx` component
- [ ] Create `ProgressBar.tsx` component
- [ ] Create `BestFriendsCard.tsx` component
- [ ] Implement ranking list
- [ ] Add medal icons
- [ ] Add progress bars
- [ ] Implement click-to-LinkedIn
- [ ] Add loading/error/empty states

**Phase 9: Responsive Design** (3 hours)
- [ ] Audit mobile responsiveness
- [ ] Add Tailwind responsive utilities
- [ ] Fix layout issues on small screens
- [ ] Test on iPhone/iPad/Android
- [ ] Verify no horizontal scrolling
- [ ] Test on all browsers

**Phase 10: Accessibility** (2 hours)
- [ ] Add ARIA labels to interactive elements
- [ ] Implement keyboard navigation
- [ ] Add focus visible states
- [ ] Test with screen reader
- [ ] Verify color contrast (WCAG AA)
- [ ] Run Lighthouse accessibility audit

**Phase 11: Performance Optimization** (2 hours)
- [ ] Memoize expensive computations
- [ ] Use React.memo for components
- [ ] Optimize image loading (lazy load)
- [ ] Run React DevTools Profiler
- [ ] Run Lighthouse performance audit
- [ ] Optimize bundle size

**Phase 12: Testing** (4 hours)
- [ ] Write unit tests for helpers
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Write E2E tests (Playwright)
- [ ] Run performance tests
- [ ] Manual QA on real accounts
- [ ] Fix all critical bugs

**Total Estimated Time**: 32-36 hours (4-5 days)

---

## Cursor + RIPER-5 Guidance

### Cursor Plan Mode

**Import Checklist**: Copy RFC implementation checklists directly into Cursor Plan mode for step-by-step execution.

**Workflow**:
1. Start with RFC-001 (Database Indexes)
2. Execute each checklist item sequentially
3. After each RFC, update status strip in this plan file
4. Reattach this plan to future sessions for context
5. If scope changes mid-flight, pause and run Change Management section

### RIPER-5 Mode

**Mode Sequence**:
1. **RESEARCH**: ✅ Already complete (extensive codebase analysis, schema review, existing patterns identified)
2. **INNOVATE**: ✅ Already complete (3 approaches explored, Approach 3 selected with rationale)
3. **PLAN**: 🚧 **YOU ARE HERE** - This plan document is the output of PLAN mode
4. **EXECUTE**: Request user approval of this plan, then enter EXECUTE mode
5. **REVIEW**: After implementation, validate against this plan and flag deviations

**EXECUTE Mode Instructions**:
- Implement EXACTLY as planned in RFCs
- Do not add features not specified (no scope creep)
- If deviation needed, STOP and return to PLAN mode (update this file)
- Mid-implementation check-in at ~50% (after RFC-005 Network Treemap)
- Use this plan as single source of truth

**Scope Change Protocol**:
- If user requests new feature mid-execution: Pause, classify change (see Change Management section), update plan, resume
- If technical blocker discovered: Document in Known Issues, propose solution, get approval before proceeding

---

**Next Step**: Review this plan, approve for execution, then enter EXECUTE mode with `ENTER EXECUTE MODE` command.
