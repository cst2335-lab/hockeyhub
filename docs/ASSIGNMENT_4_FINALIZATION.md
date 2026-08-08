# Assignment 4 Finalization – GoGoHockey

**Course:** CST8319 Software Development Project  
**Stage:** Assignment 4 — final project submission  
**Updated:** 2026-08-08  
**Related:** [ASSIGNMENT_4_TESTING_EVIDENCE.md](./ASSIGNMENT_4_TESTING_EVIDENCE.md) · [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md) · [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)

---

## 1. Purpose

This document summarizes the **final feature status** for Assignment 4. It separates:

- implemented features;
- partially supported features;
- future enhancements;
- known limitations / non-claims.

Assignment 4 finalizes documentation and submission packaging for the existing GoGoHockey codebase. It does **not** invent unverified product capabilities.

---

## 2. Final feature status summary

| Area | Final A4 status | Notes |
|------|-----------------|-------|
| Next.js / TypeScript / Tailwind / next-intl | Implemented | `app/[locale]/`, `messages/` |
| Supabase Auth (login / register / logout) | Implemented | Auth clients + session cookies |
| Profile view / update | Implemented | Profile pages + `/api/profile/update` |
| Dashboard | Implemented | Metrics, posted games, bookings (env-dependent) |
| Games list / create / detail / interest | Implemented | Interest API notification trigger fix (SQL); capacity “Game Full” UI fix `3a8f969`; view-count + remove-interest notify demo-flow fixes |
| Rinks browse / search / filter / sort | Implemented | Supabase-backed list UI |
| Booking form + create-checkout | Partially supported | Form and API exist; **Stripe E2E not claimed**; upcoming booking metric excludes cancelled |
| Stripe webhooks | Partially supported | Handlers + idempotency helpers exist; dual path debt documented |
| Notifications UI | Implemented (UI) + partial auto-create | List / read / delete; interest create (DB trigger) + interest remove (API) notify creator; host accept / booking events incomplete |
| Clubs / rink manager | Partially supported | Code present; not primary final demo claim |
| Unit tests (Vitest) | Implemented | `__tests__/` |
| Docs + finalization evidence | Implemented | This file and related A4 docs |

---

## 3. Implemented features

Safe to present as working in a configured local environment:

1. Localized App Router UI (`/en`, `/fr`)
2. Authentication: register, login, logout
3. Profile view and update
4. Personal dashboard
5. Game invitations: browse, create, detail, express/remove interest
6. Rinks: browse with search, filter, and sort
7. Notifications page UI
8. Validated write APIs (`requireAuth` + Zod on main paths)
9. Unit test suite and project documentation

---

## 4. Partially supported features

Show carefully; use precise language:

### Booking and Stripe

- Booking UI and `POST /api/bookings/create-checkout` are implemented.
- Webhook routes exist (`/api/webhooks/stripe` recommended; `/api/stripe/webhook` legacy).
- **Do not claim** Checkout → webhook → booking `confirmed` as fully verified unless a recorded test-mode payment exists in evidence.

### Notifications

- Users can view and manage notifications in the UI.
- Game interest **create** notifies the creator via DB trigger (schema-aligned).
- Game interest **remove** notifies the creator via API (`interest_removed`); failure is non-blocking.
- Host accept-interest and booking-event auto notifications remain incomplete.

### Auth guarding

- Unauthenticated users are redirected from dashboard layout (client-side).
- Middleware does not fully enforce authentication for all protected pages.

### Clubs / rink management

- Clubs create and rink-manager style routes exist in code.
- Full role matrix enforcement is not claimed.

---

## 5. Future enhancements (post–Assignment 4)

1. Recorded Stripe test-mode E2E payment and cancel/refund demo  
2. Host accept-interest + contact-reveal product loop  
3. Broader auto-notification coverage on booking / match events  
4. Middleware / server-side route protection hardening  
5. Confirm and document live Supabase RLS on the remote project  
6. Collapse duplicate Stripe webhook paths  
7. Minimal browser E2E smoke tests  
8. Documented live deployment URL (if available)

---

## 6. Known limitations (do not overclaim)

- **No full production deployment URL claim** from this repository alone  
- **No full Stripe E2E payment claim** without recorded verification  
- **No direct messaging**  
- **No automatic game matching** via `game_matches`  
- **No complete host accept-interest workflow claim**  
- **No full RBAC claim**  
- **No live RLS fully-verified claim**  
- **No Playwright/Cypress E2E suite** in repo  
- Dedicated `payments` table writes are not implemented in application code  

Stripe technical boundary: [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md).

---

## 7. Finalization bug resolution

### 7.1 Game capacity (homepage cards)

During local final-demo verification, homepage cards showed **Players 0/** and **Game Full** when max_players was null/0. Cause: capacity math coerced null to 0. Fixed in commit **3a8f969** (lib/games/capacity.ts + card UI + unit tests). Verifiable test log: [evidence/assignment-4-game-capacity-fix-test-2026-08-08.log](./evidence/assignment-4-game-capacity-fix-test-2026-08-08.log) (**97/97**).

### 7.2 Demo-flow consistency (views, bookings metric, remove-interest notify)

| Fix | Summary |
|-----|---------|
| Game views | Persist views for non-owners via service client + game_views dedupe; UI updates iew_count |
| Upcoming bookings | Cancelled bookings excluded from dashboard upcoming count |
| Remove interest | Creator receives interest_removed notification (best-effort) |

Commit: **2a8cca5** (ix: align dashboard game and notification demo flows). Evidence: [evidence/assignment-4-demo-flow-fixes-test-2026-08-08.log](./evidence/assignment-4-demo-flow-fixes-test-2026-08-08.log) (**112/112**). These are concrete demo-flow bug fixes—not claims of Stripe E2E, messaging, matching, or production deployment.

---


### 7.3 Posted game metrics (views / interests)

Posted game metrics were corrected so creator-side cards and dashboard summaries use current view and active interest counts. Live counts come from game_views and active game_interests via GET /api/games/posted-metrics (lib/games/posted-metrics.ts). Commit message: **ix: correct posted game view and interest metrics**. Evidence: [evidence/assignment-4-posted-game-metrics-fix-test-2026-08-08.log](./evidence/assignment-4-posted-game-metrics-fix-test-2026-08-08.log).

## 8. Relationship to Assignment 3

Assignment 3 delivered the initial working prototype evidence (Demo 3 checklist, limitations, walkthrough). Assignment 4 keeps that evidence and adds finalization docs, `.env.example`, README reframing, Stripe boundary documentation, and recorded finalization bug fixes for submission.

---

*Use “implemented,” “partially supported,” and “not claimed” consistently in the final report and demo.*
