# Demo 3 Video Walkthrough – GoGoHockey / HockeyHub

**Course:** CST8319 Assignment 3  
**Target length:** 10–15 minutes  
**Source of truth:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)  
**Related:** [ASSIGNMENT_3_PROGRESS.md](./ASSIGNMENT_3_PROGRESS.md) · [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md) · [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md)  
**Updated:** 2026-07-26

---

## Before recording

- [ ] `.env.local` has working Supabase URL + anon key (and service key if needed for data).
- [ ] Test account ready (login works).
- [ ] `npm run test` re-run; keep terminal output available.
- [ ] Read [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md) — do not claim Stripe/payment, messaging, matching, deployment, formal user testing, or full RBAC unless verified.
- [ ] Browser zoom readable; hide secrets (API keys) on screen.

---

## Suggested timing

| Segment | Approx. time |
|---------|----------------|
| 1–3 Overview, A2 response, local run | 2–3 min |
| 4–11 Core UI walkthrough | 6–8 min |
| 12–13 Backend + tests | 2–3 min |
| 14–15 Limitations + A4 next steps | 1–2 min |

---

## Walkthrough sequence

### 1. Project overview (~1 min)

**Show:** GitHub repo page (`cst2335-lab/hockeyhub`) and/or homepage title.

**Speaker notes:**  
“GoGoHockey, also in the GitHub repo as HockeyHub, is an Ottawa youth ice hockey community platform. Users can sign in, manage a profile, find and post games, browse rinks, and start a booking. This is Assignment 3: an initial working prototype from a long-running codebase, not a brand-new project.”

---

### 2. Response to Assignment 2 feedback (~1 min)

**Show:** Briefly `docs/ARCHITECTURE.md` and folder tree (`app/[locale]/`, `app/api/`, `scripts/sql/`).

**Speaker notes:**  
“After Assignment 2 design work, we aligned the implementation around a locale-based App Router, validated API routes, and clearer docs and SQL scripts. We still have gaps—especially payment verification and matching—which we will call out as Assignment 4.”

---

### 3. Local run (~1 min)

**Show:** Terminal: `npm install` (if needed) → `npm run dev` → browser `http://localhost:3000` → redirect to `/en`.

**Speaker notes:**  
“Setup uses npm. With environment variables configured as documented in AGENTS and DEPLOYMENT, the Next.js app starts locally and defaults to English locale.”

---

### 4. Homepage (~30–45 sec)

**Show:** `/en` homepage / hero and main navigation.

**Speaker notes:**  
“The homepage presents the product and entry points into the app. Navigation supports the main prototype areas we will demo next.”

---

### 5. Login / register (~1–1.5 min)

**Show:** `/en/login` (preferred) or short register flow; then successful sign-in.

**Speaker notes:**  
“Authentication uses Supabase Auth. Users can register and log in; invalid credentials show an error. After login we land on the dashboard.”

---

### 6. Dashboard (~1 min)

**Show:** `/en/dashboard` — metrics, posted games, bookings sections as available.

**Speaker notes:**  
“The dashboard is the authenticated hub. It loads real data from Supabase when configured—open games, bookings, and the user’s posted or interested games.”

---

### 7. Profile (~45–60 sec)

**Show:** `/en/profile`; optionally edit one field and save.

**Speaker notes:**  
“Users can view and update their hockey profile. Updates go through a validated profile API.”

---

### 8. Games (~1.5–2 min)

**Show:** `/en/games` list → open a detail → express interest (if appropriate). Optionally mention create game without a long form fill.

**Speaker notes:**  
“Game invitations can be browsed, opened, and created. Logged-in users can express interest. Host accept-interest and formal matching are not claimed as complete for Assignment 3.”

---

### 9. Rinks (~1 min)

**Show:** `/en/rinks` — search and one filter/sort change.

**Speaker notes:**  
“Rinks are loaded from Supabase. Users can search and filter. From a card we can open the booking page.”

---

### 10. Booking form (~1–1.5 min)

**Show:** `/en/book/[rinkId]` — date, start time, hours, cost UI.

**Speaker notes:**  
“The booking form collects date and duration and calculates costs. The create-checkout API can redirect to Stripe when keys are configured. For Assignment 3 we demonstrate the form and route as partially supported. We do not claim a completed paid payment unless we have verified a test payment.”

---

### 11. Notifications (~30–45 sec)

**Show:** `/en/notifications`.

**Speaker notes:**  
“The notifications UI lets users view and manage notifications. Automatic creation from every business event is still incomplete and is planned for Assignment 4.”

---

### 12. Backend / API / docs evidence (~1–1.5 min)

**Show:** IDE or GitHub: `app/api/` tree, `docs/API.md`, optionally `scripts/sql/supabase-rls.sql` (no secrets).

**Speaker notes:**  
“Writes go through Route Handlers with authentication and Zod validation. API documentation and SQL/RLS scripts are in the repository. Live RLS on the remote database still needs explicit verification for Assignment 4.”

---

### 13. Test output (~45–60 sec)

**Show:** Terminal running `npm run test` and the summary line.

**Speaker notes:**  
“We use Vitest for unit tests covering validations, booking helpers, security helpers, and related modules. This is unit-level evidence, not end-to-end browser testing.”

---

### 14. Known limitations (~45–60 sec)

**Show:** [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md) or a slide listing the same points.

**Speaker notes:**  
“We are not claiming Stripe payment completion, production deployment, formal user testing, messaging, game matching, full RBAC, live RLS verification, or E2E tests unless separately verified. Host accept-interest and auto notifications remain incomplete.”

---

### 15. Assignment 4 next steps (~30–45 sec)

**Show:** Short slide or `ASSIGNMENT_3_PROGRESS.md` §7.

**Speaker notes:**  
“Assignment 4 will focus on verifying payment end-to-end if in scope, completing the interest-accept and notification loop, hardening auth and confirming RLS, adding basic E2E coverage, and final documentation and deployment evidence.”

---

## After recording

- [ ] Confirm no secrets leaked on screen.
- [ ] Confirm claims match [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md).
- [ ] Update [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md) with real PASS/FAIL results.
- [ ] Store video link / file per course submission instructions.

---

*Keep the demo honest: show what works; name what does not.*
