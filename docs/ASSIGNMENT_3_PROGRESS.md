# Assignment 3 Progress – GoGoHockey / HockeyHub

**Course:** CST8319 Software Development Project  
**Stage:** Assignment 3 — initial working prototype demonstration  
**Source of truth:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)  
**Related:** [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md) · [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md) · [DEMO_3_VIDEO_WALKTHROUGH.md](./DEMO_3_VIDEO_WALKTHROUGH.md)  
**Repository:** `https://github.com/cst2335-lab/hockeyhub`  
**Updated:** 2026-07-26

---

## 1. Purpose of Assignment 3

Assignment 3 is an **initial working prototype** stage. The goal is to demonstrate that the team has:

- a runnable project structure;
- selected core features implemented with code evidence;
- documentation and basic testing/debugging evidence;
- an honest response to Assignment 2 design feedback;
- a clear plan for Assignment 4 finalization.

Assignment 3 is **not** a claim that the full product vision is complete.

---

## 2. Project context

GoGoHockey / HockeyHub is a **long-running prototype**, not a brand-new repository created for Demo 3.

Evidence of continued development includes:

- Next.js 15 App Router under `app/[locale]/`;
- multiple feature branches and historical commits on `main`;
- consolidated docs (`docs/ARCHITECTURE.md`, `docs/API.md`, `docs/TASKS.md`, etc.);
- SQL scripts under `scripts/sql/`;
- Vitest suite under `__tests__/`.

Demo 3 therefore shows a **subset** of the existing codebase that is evidence-backed and safe to demonstrate. Advanced or unverified features are deferred to Assignment 4 or explicitly listed as limitations.

---

## 3. Demo 3 features (evidence-backed only)

| Feature | Status for A3 | Evidence |
|---------|---------------|----------|
| Next.js / TypeScript / Tailwind / next-intl structure | Implemented | `package.json`, `app/[locale]/`, `messages/en.json`, `messages/fr.json` |
| Supabase Auth login / register / logout | Implemented | `LoginClient.tsx`, `RegisterClient.tsx`, dashboard layout `signOut`, `lib/supabase/*` |
| Profile view / update | Implemented | `profile/page.tsx`, `profile/edit/page.tsx`, `/api/profile/update` |
| Dashboard | Implemented | `dashboard/page.tsx` (metrics, posted games, bookings) |
| Rinks browse / search / filter | Implemented | `rinks/page.tsx`, `lib/queries/rinks.ts` |
| Games browse / create / detail / interest | Implemented | `games/*`, `/api/games/create`, `/api/games/interest` |
| Booking form / checkout route | Partially supported | `book/[rinkId]/page.tsx`, `/api/bookings/create-checkout` — form and route exist; **paid Stripe E2E not claimed** |
| Notifications UI | Implemented (UI) | `notifications/page.tsx`, `useNotifications.ts` — list/read/delete; **auto-create not claimed** |
| API routes and Zod validation | Implemented | `app/api/*`, `lib/validations/*`, `docs/API.md` |
| Documentation and unit tests | Implemented | `docs/*`, `__tests__/` (Vitest) |

---

## 4. Status separation (do not blur these)

### Implemented (safe to demo as working prototype features)

- App structure with locale routes (`/en`, `/fr`)
- Login, register, logout
- Profile view and update
- Dashboard with live Supabase-backed sections (when env is configured)
- Rinks list with client search / filter / sort
- Games list, create, detail, express/remove interest
- Notifications page UI
- Server API routes with `requireAuth` + Zod on main write paths
- Project documentation and Vitest unit tests

### Partially supported (show carefully; do not overclaim)

- **Booking → Stripe Checkout:** booking form and create-checkout API exist; success depends on Stripe env + webhook. Demo the form and pricing UI. Do **not** claim full payment completion unless a live test payment is verified and filmed.
- **Notifications:** users can view/manage notifications in UI; automatic creation from business events is incomplete.
- **Page protection:** unauthenticated users are redirected from dashboard layout (client-side). Middleware does not enforce auth for all pages.
- **Clubs / rink manager:** code exists; not required as a primary Demo 3 highlight unless a verified demo account is prepared.

### Planned for Assignment 4

- Stripe E2E payment verification (test mode) and cancel/refund demo
- Host accept-interest / contact reveal loop
- Auto-created notifications on interest / booking events
- Auth hardening (middleware or server-side page protection)
- Live Supabase RLS verification
- Duplicate Stripe webhook path cleanup
- E2E smoke tests
- Final README polish and deployment URL (if available)
- Final optimization and lessons-learned narrative

### Not claimed in Assignment 3

- Full Stripe payment workflow as “complete”
- Production / preview deployment URL (unless separately verified and documented)
- Formal user / stakeholder testing (unless a real feedback artifact exists)
- Messaging
- Game matching / `game_matches`
- Full RBAC (admin / club_admin / parent enforcement)
- Live RLS confirmed on remote Supabase
- End-to-end (browser) automated tests

See [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md).

---

## 5. Response to Assignment 2 feedback (summary)

The codebase already reflects design evolution after Assignment 2-style architecture work:

- Canonical UI under `app/[locale]/` with legacy path redirects in `next.config.mjs`
- Write operations routed through validated APIs (`requireAuth` + Zod + sanitize)
- SQL and RLS scripts centralized in `scripts/sql/`
- Architecture, API, roles, Stripe, and deployment docs under `docs/`

Demo 3 should acknowledge this evolution honestly and note remaining gaps (payment verification, matching loop, security verification) as Assignment 4 work.

---

## 6. Testing and demo evidence for Assignment 3

| Artifact | Location | Notes |
|----------|----------|-------|
| Scope analysis | `docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md` | Source of truth for A3/A4 split |
| Testing checklist | `docs/DEMO_3_TESTING_CHECKLIST.md` | Fill results before submission |
| Known limitations | `docs/DEMO_3_KNOWN_LIMITATIONS.md` | Use in report and video |
| Video script | `docs/DEMO_3_VIDEO_WALKTHROUGH.md` | 10–15 minute sequence |
| Unit tests | `npm run test` | Capture output when re-run |
| Run / env docs | `README.md`, `AGENTS.md`, `docs/DEPLOYMENT.md` | README still needs A3-oriented update (separate task) |

---

## 7. Assignment 4 handoff (brief)

After Demo 3, prioritize:

1. Verify Stripe test payment end-to-end (or explicitly keep payment as partial with justification).
2. Complete host accept-interest + auto notifications.
3. Verify RLS on Supabase; harden protected routes.
4. Add minimal E2E coverage and final documentation / deployment evidence.

---

*This document describes Assignment 3 progress for submission evidence. It does not invent completed features.*
