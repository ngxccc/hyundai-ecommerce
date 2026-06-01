# Duma Neobrutalist Redesign - Plan

**Date:** 26-11-25  
**Complexity:** Simple  
**Status:** ⏳ PLANNED

## Overview

Rebuild the Duma social activity discovery app with identical features and mock data, but redesigned with a neobrutalist + Gumroad minimalist aesthetic (rounded, easy on the eyes, modern, friendly, creative, cool). Update tech stack to pnpm, Next.js App Router, Tailwind CSS 4, and latest React Router + React Query patterns.

## Quick Links

- [Goals and Success Metrics](#goals-and-success-metrics)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Assumptions and Constraints](#assumptions-and-constraints)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)
- [Risks and Mitigations](#risks-and-mitigations)
- [Integration Notes](#integration-notes)
- [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

## Goals and Success Metrics

**Goals:**
- Replicate all features from original Duma app (SwipeFeed, Activity Cards, Drawers, My Activities, Hosted Activities, Profile, Chat, Bottom Nav)
- Implement neobrutalist + Gumroad minimalist design: rounded corners, bold colors, friendly typography, creative layouts
- Migrate to modern tech stack: pnpm, Next.js App Router, Tailwind CSS 4, latest React Router/Query
- Deliver fully functional prototype with all mock data working

**Success Metrics:**
- All 9 core features work identically to original
- Design matches neobrutalist aesthetic (bold borders, rounded elements, playful colors)
- App runs on `localhost:3000` without errors
- All mock data (30 users, 57 activities, conversations) displays correctly
- Navigation and state management function properly

---

## Execution Brief

**IMPORTANT:** This is a SIMPLE (one-session) plan - implement continuously without approval gates. The phases below are logical groupings for understanding flow, NOT stop points.

### Phase 1: Project Setup
**What happens:** Initialize Next.js with pnpm, upgrade to Tailwind CSS 4, install dependencies (React Query, shadcn/ui, lucide-react).

### Phase 2: Design System
**What happens:** Create neobrutalist color palette, CSS variables, typography scale in `globals.css`.

### Phase 3: Data Layer
**What happens:** Create `lib/mockData.ts` with all interfaces and mock data, set up React Query provider.

### Phase 4: Core Components
**What happens:** Build neobrutalist-styled UI components (Button, Card, Badge, Avatar, Drawer), Bottom Navigation, tab routing.

### Phase 5: Feature Implementation
**What happens:** Build SwipeFeed, ActivityCard, Drawers, MyActivities, HostedActivities, Profile, Chat components.

### Post-Implementation Testing

After completing all implementation steps, verify the following:

1. **Smoke Test:** Run `pnpm dev` - app loads without errors
2. **Navigation Test:** Click through all tabs (Profile, Create, Discover, Activities, Chat) - all routes work
3. **Data Test:** Check that all mock data displays (30 users, 57 activities, 5 conversations)
4. **Interaction Test:** Test swipe animations, drawer open/close, chat input
5. **Visual Test:** Verify neobrutalist styling (rounded corners, bold borders, playful colors)
6. **Console Test:** Check browser console - no errors or warnings

### Expected Outcome
- Fully functional Duma clone with neobrutalist design
- All mock data rendering correctly
- Smooth navigation and animations
- No console errors

---

## Scope

**In-Scope:**
- All original features: SwipeFeed, ActivityCard, ActivityDetailDrawer, UserProfileDrawer, MyActivities, HostedActivities, Profile, Chat, BottomNav
- Complete mock data migration (users, activities, conversations, join requests)
- Neobrutalist design system (rounded buttons, bold borders, playful colors, friendly typography)
- Tech stack migration (pnpm, Next.js App Router, Tailwind CSS 4, React Router latest, React Query latest)
- Responsive mobile-first layout

**Out-of-Scope:**
- Backend integration or real API calls
- Authentication system
- Real-time features
- Production deployment
- Performance optimization beyond basic requirements

## Assumptions and Constraints

**Assumptions:**
- Original app structure and data are well-understood from context file
- Neobrutalist design principles are: bold borders (2-4px), rounded corners (8-16px), playful colors, friendly typography, generous spacing
- Next.js App Router can handle client-side routing needs
- React Query latest version works with Next.js App Router patterns
- Tailwind CSS 4 configuration is compatible with Next.js

**Constraints:**
- Must use pnpm (not npm/yarn)
- Must use Next.js App Router (not Pages Router)
- Must use Tailwind CSS 4 (not v3)
- Must maintain all original functionality
- Single-session implementation (8-15 steps)

## Functional Requirements

1. **SwipeFeed Component**
   - Tinder-style card stack with drag/swipe animations
   - Like/Dislike buttons with smooth transitions
   - Next card preview behind current card
   - Empty state when no activities remain
   - Neobrutalist styling: rounded cards, bold borders, playful colors

2. **ActivityCard Component**
   - Cover photo with activity type badge
   - Host info with avatar
   - Participant count progress bar
   - Participant avatars (clickable)
   - Activity details (location, date/time, description)
   - Host bio section
   - Previous activity photos grid
   - Past events list
   - Interests badges
   - Click to open detail drawer

3. **ActivityDetailDrawer**
   - Full-screen drawer (75vh height)
   - Complete activity information
   - Host profile preview
   - All participants with avatars
   - Location, date/time with icons
   - Notes from host
   - Clickable participant avatars

4. **UserProfileDrawer**
   - Full-screen drawer (75vh height)
   - Profile photo, name, age
   - Profession and location
   - Bio section
   - Interests badges
   - Past events list
   - Activity photos grid (3-column)

5. **MyActivities Tab**
   - Upcoming activities section
   - Past activities section
   - Activity cards with cover photo, title, type, date, location
   - Participant avatars
   - Click to view details

6. **HostedActivities Tab**
   - List of user's created activities
   - Same card layout as My Activities
   - Shows activities user is hosting

7. **Profile Tab**
   - User profile information
   - Stats and preferences
   - Settings access

8. **Chat Tab**
   - Conversation list with avatars
   - Unread message badges
   - Last message preview
   - Timestamp formatting
   - Conversation drawer with message history
   - Message bubbles (left/right alignment)
   - Input field with send button

9. **Bottom Navigation**
   - Fixed bottom nav with 5 tabs
   - Icons: Profile, Create, Discover (Home), Activities, Chat
   - Active state highlighting
   - Smooth transitions

## Non-Functional Requirements

- **Design:** Neobrutalist aesthetic with rounded corners (8-16px), bold borders (2-4px), playful color palette, friendly typography, generous spacing
- **Performance:** Smooth animations, fast page loads, responsive interactions
- **Accessibility:** Semantic HTML, keyboard navigation, screen reader support
- **Code Quality:** Clean, maintainable, well-organized component structure
- **Type Safety:** Full TypeScript coverage with proper types

## Acceptance Criteria

1. ✅ App runs on `localhost:3000` with `pnpm dev`
2. ✅ All 9 core features work identically to original
3. ✅ Design matches neobrutalist aesthetic (rounded, bold borders, playful colors)
4. ✅ All mock data displays correctly (30 users, 57 activities, 5 conversations)
5. ✅ Navigation between tabs works smoothly
6. ✅ SwipeFeed card animations work correctly
7. ✅ Drawers open/close with proper animations
8. ✅ Chat messages display correctly with timestamps
9. ✅ Activity cards show all information correctly
10. ✅ Profile pages display user data correctly
11. ✅ Responsive design works on mobile and desktop
12. ✅ No console errors or warnings
13. ✅ TypeScript compiles without errors

## Implementation Checklist

1. **Initialize Next.js Project with pnpm**
   - Create new Next.js project: `pnpm create next-app@latest duma-redesign --typescript --tailwind --app --no-src-dir`
   - Verify pnpm is installed and working
   - Confirm App Router structure exists (`app/` directory)

2. **Upgrade to Tailwind CSS 4**
   - Install Tailwind CSS 4: `pnpm add -D tailwindcss@next @tailwindcss/postcss@next`
   - Update `tailwind.config.ts` for v4 syntax (CSS-based config with `@import` and `@config`)
   - Configure `postcss.config.js` to use `@tailwindcss/postcss`
   - Set up global styles in `app/globals.css` with Tailwind imports

3. **Install and Configure Dependencies**
   - Install React Query latest: `pnpm add @tanstack/react-query@latest`
   - Install React Router latest: `pnpm add react-router-dom@latest` (for client-side routing within Next.js)
   - Install shadcn/ui: `pnpm dlx shadcn@latest init` (for UI components)
   - Install required Radix UI components: accordion, avatar, badge, button, card, dialog, drawer, progress, scroll-area, separator, tabs, toast
   - Install lucide-react for icons: `pnpm add lucide-react`
   - Install date-fns for date formatting: `pnpm add date-fns`

4. **Set Up Neobrutalist Design System**
   - Create `app/globals.css` with neobrutalist color palette (bold, playful colors)
   - Define CSS variables for neobrutalist theme (border widths, border radius, colors)
   - Configure Tailwind theme with custom colors, border radius (8-16px), border widths (2-4px)
   - Create typography scale (friendly, rounded fonts)
   - Set up spacing scale (generous padding/margins)

5. **Create Mock Data Structure**
   - Create `lib/mockData.ts` with all interfaces (User, ActivityPost, Conversation, Message, JoinRequest)
   - Port all mock data from original: `currentUser`, `mockUsers` (30 users), `mockActivities` (57 activities), `mockConversations` (5 conversations), `mockJoinRequests`
   - Ensure all data matches original structure exactly

6. **Set Up React Query Provider**
   - Create `app/providers.tsx` with QueryClient and QueryClientProvider
   - Wrap app layout with providers
   - Create custom hooks for data fetching (useActivities, useUsers, useConversations)

7. **Create Core UI Components (Neobrutalist Style)**
   - Create `components/ui/` directory with shadcn components
   - Customize Button component: rounded corners (12px), bold borders (3px), playful colors
   - Customize Card component: rounded corners (16px), bold borders (4px), shadow effects
   - Customize Badge component: rounded pill shape, bold borders
   - Customize Avatar component: rounded-full with border
   - Customize Drawer component: rounded top corners, bold borders
   - Ensure all components follow neobrutalist design principles

8. **Implement Bottom Navigation**
   - Create `components/BottomNav.tsx` with 5 tabs (Profile, Create, Discover, Activities, Chat)
   - Use Lucide icons for each tab
   - Implement active state styling (bold, colorful)
   - Add smooth transitions
   - Make it fixed at bottom with proper padding

9. **Implement Tab-Based Routing**
   - Create `app/page.tsx` as main layout with header and bottom nav
   - Use client-side state for tab switching (useState)
   - Create separate page components for each tab: SwipeFeed, MyActivities, HostedActivities, Profile, Chat
   - Implement tab content rendering based on current tab state

10. **Implement SwipeFeed Component**
    - Create `components/SwipeFeed.tsx` with card stack logic
    - Implement drag/swipe animations with transform and rotation
    - Add Like/Dislike button handlers
    - Show next card preview behind current card
    - Handle empty state
    - Apply neobrutalist styling (rounded cards, bold borders)

11. **Implement ActivityCard Component**
    - Create `components/ActivityCard.tsx` with all activity information
    - Display cover photo, activity type badge, host info, participant count
    - Show participant avatars (clickable)
    - Display activity details (location, date/time, description)
    - Show host bio, previous photos grid, past events, interests
    - Add click handler to open ActivityDetailDrawer
    - Apply neobrutalist styling

12. **Implement Drawer Components**
    - Create `components/ActivityDetailDrawer.tsx` with full activity details
    - Create `components/UserProfileDrawer.tsx` with full user profile
    - Implement open/close animations
    - Add backdrop overlay
    - Make drawers scrollable (max-h-[75vh])
    - Apply neobrutalist styling (rounded top corners, bold borders)

13. **Implement MyActivities and HostedActivities Components**
    - Create `components/MyActivities.tsx` with upcoming/past sections
    - Create `components/HostedActivities.tsx` with hosted activities list
    - Display activity cards in list format
    - Filter activities by date (upcoming vs past)
    - Add click handlers to open detail drawers
    - Apply neobrutalist styling

14. **Implement Profile Component**
    - Create `components/Profile.tsx` with user profile display
    - Show profile photo, name, age, profession, location
    - Display bio, interests, past events, activity photos
    - Apply neobrutalist styling

15. **Implement Chat Component**
    - Create `components/Chat.tsx` with conversation list
    - Display conversation items with avatars, last message, timestamps
    - Show unread badges
    - Create conversation drawer with message history
    - Implement message bubbles (left/right alignment based on sender)
    - Add input field with send button
    - Format timestamps using date-fns
    - Apply neobrutalist styling

16. **Add Header Component**
    - Create header in main layout with logo and app name
    - Make it sticky with backdrop blur
    - Apply neobrutalist styling

17. **Test and Polish**
    - Test all navigation flows
    - Verify all mock data displays correctly
    - Check animations and transitions
    - Verify responsive design on mobile/desktop
    - Fix any TypeScript errors
    - Ensure no console errors
    - Polish neobrutalist design details (spacing, colors, borders)

## Risks and Mitigations

**Risk 1:** Tailwind CSS 4 compatibility issues with Next.js
- **Mitigation:** Use official Next.js + Tailwind CSS 4 documentation, test configuration early

**Risk 2:** React Router conflicts with Next.js App Router
- **Mitigation:** Use client-side state for tab navigation instead of React Router, or use Next.js built-in routing for pages if needed

**Risk 3:** React Query setup with Next.js App Router
- **Mitigation:** Follow latest React Query + Next.js App Router patterns from official docs, use proper provider setup

**Risk 4:** Neobrutalist design not matching vision
- **Mitigation:** Create design tokens early, test components incrementally, reference Gumroad/neobrutalist examples

**Risk 5:** Data migration errors
- **Mitigation:** Copy mock data carefully, verify all interfaces match, test data access early

## Integration Notes

- **Next.js App Router:** Use `app/` directory structure, server/client components appropriately
- **React Query:** Set up QueryClientProvider in root layout, use hooks for data fetching
- **Tab Navigation:** Use client-side state (useState) for tab switching, not React Router (since it's a single-page app with tabs)
- **Tailwind CSS 4:** Use CSS-based configuration with `@import` and `@config` directives
- **shadcn/ui:** Install components as needed, customize for neobrutalist style
- **Mock Data:** Keep all data in `lib/mockData.ts`, import where needed
- **TypeScript:** Maintain strict typing throughout, use interfaces from mockData

## Cursor + RIPER-5 Guidance

**Cursor Plan Mode:**
- Import this checklist into Cursor Plan mode
- Execute all steps continuously (1-17) in one session
- No approval gates between steps - maintain momentum
- Check off items as completed
- Run Post-Implementation Testing (Section 3) after all steps complete

**RIPER-5 Mode (SIMPLE - Fast Track):**
- **RESEARCH:** ✅ Complete - Reviewed original app structure, data, and tech stack
- **INNOVATE:** ✅ Complete - Decided on neobrutalist design approach and tech stack migration
- **PLAN:** ✅ Current - This plan document
- **EXECUTE:** Next - Implement all 17 steps continuously without pausing for approval
- **REVIEW:** After execution - Run Post-Implementation Testing, validate against acceptance criteria

**Key Difference from COMPLEX Plans:**
- SIMPLE plans = continuous one-session implementation
- COMPLEX plans = phase-by-phase with approval gates
- For this SIMPLE plan: implement all steps → test at end → done

**Next Step:** Begin implementation with Step 1: Initialize Next.js Project with pnpm

