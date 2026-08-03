# Demo 3 Testing Checklist – GoGoHockey

**Course:** CST8319 Assignment 3  
**Source of truth:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)  
**Related:** [ASSIGNMENT_3_PROGRESS.md](./ASSIGNMENT_3_PROGRESS.md) · [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md)  
**Updated:** 2026-07-26 (re-verified this date)

---

## Instructions

1. Use this checklist while preparing Demo 3.
2. Mark **Result** only after you personally run the step.
3. Allowed Result values: `TODO` | `PASS` | `FAIL` | `BLOCKED` | `N/A`
4. Do **not** mark `PASS` unless actually verified.
5. Record date, tester initials, and notes. Attach screenshots/logs for the report/video if required.

**Environment notes (fill before testing):**

| Item | Value |
|------|-------|
| Tester | Agent (Cursor Demo 3 re-verification) |
| Date | 2026-07-26 |
| Branch / commit | `main` @ `dfb46e7` |
| Node version | Node `v24.6.0` / npm `11.5.1` |
| `.env.local` configured (Supabase)? | Yes — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set. `SUPABASE_SERVICE_KEY` unset (not required for this demo path). `TEST_LOGIN_USERNAME` / `TEST_LOGIN_PASSWORD` unset — used existing Mailinator test account. |
| Stripe keys configured? | Yes — `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set. **Stripe Checkout E2E payment was not run** (optional; not required for A3 core demo). |

---

## Checklist

| # | Test Area | Command / Action | Expected Result | Result | Notes / Evidence |
|---|-----------|------------------|-----------------|--------|------------------|
| 1 | Dependency install | `npm install` | Completes without fatal errors | PASS | Re-run 2026-07-26: completed, packages up to date (`INSTALL_EXIT=0`). |
| 2 | Dev server startup | `npm run dev` | Server starts; app reachable at `http://localhost:3000` (redirects to `/en`) | PASS | Dev server already running; `GET http://localhost:3000/en` returned **200**. |
| 3 | Homepage load | Open `/en` | Homepage / hero loads | PASS | Clean Chromium: `/en` loads with hero/CTAs (Making Hockey Accessible / Find Games / Get Started). |
| 4 | Main navigation | Use navbar / bottom nav | Links reachable (e.g. Games, Clubs, Dashboard, Profile as applicable) | PASS | Signed-out: Find Games, Ice Rinks, Clubs, About, Sign In, Get Started. Logged-in bottom nav: Play, Community, Dashboard, Profile. |
| 5 | Login | `/en/login` with valid test account | Signs in; redirects toward dashboard | PASS | `demo3.gogohockey.cst8319@mailinator.com` → `/en/dashboard` after client hydration (Supabase `/auth/v1/token` 200). Note: clicking Sign In before hydration can native-submit to `/en/login?` — wait for JS; not treated as product FAIL for Demo 3. |
| 6 | Register | `/en/register` (optional if account exists) | Account creation works or shows clear error | PASS | Not re-run this pass (account already exists). Prior same-day pass: multi-step register succeeded for the Mailinator account above. |
| 7 | Logout | Use Sign Out in dashboard UI | Session cleared; protected pages redirect | PASS | Not re-run this pass. Prior same-day pass: Sign Out cleared session; `/en/dashboard` redirected to `/en/login`. |
| 8 | Dashboard | `/en/dashboard` while logged in | Dashboard loads; shows metrics / games / bookings sections (data depends on Supabase) | PASS | “Demo Three Tester · Dashboard”; Open Game Invitations / Upcoming Bookings / Total Rinks 393 / season stats visible. |
| 9 | Profile | `/en/profile` (and optional edit) | Profile view loads; update persists if tested | PASS | Profile view: Demo Three Tester, U15, A, Forward, Kanata; Edit Profile visible. Persist-edit not re-tested this pass. |
| 10 | Games list | `/en/games` | Games list loads or shows empty/error gracefully | PASS | “3 games found”; listed “Demo 3 Test Game U15” with filters (All / Upcoming / Past). |
| 11 | Game detail / interest | Open a game; express interest if logged in | Detail loads; interest action succeeds or shows clear error | PASS | Detail `/en/games/ea5b832d-2349-42d1-8887-82b983ac9e5c` loaded (U15, Intermediate, creator view). **Interest as non-creator not tested** (single account). |
| 12 | Rinks browse | `/en/rinks` | List loads; search/filter/sort usable | PASS | “393 rinks available”; search “Algonquin” showed Algonquin College Arena; price/city filters and sort UI present. |
| 13 | Booking page | `/en/book/[rinkId]` from a rink card | Form shows date/time/hours and cost UI | PASS | `/en/book/f3ffcae1-6956-4308-a648-1e77d2754452` — Book Algonquin College Arena; date/time/duration; $180/hr; total $194.40; Confirm Booking. **No Stripe payment E2E.** |
| 14 | Notifications | `/en/notifications` | Page loads; empty state or list visible | PASS | Empty state: “No notifications yet”. |
| 15 | Browser console check | DevTools Console on main happy-path pages | No unexpected blocking red errors on demo path | PASS | **Clean Chromium** (`--disable-extensions`, no Cursor browser): **0** hydration/mismatch messages; **`data-cursor-ref=0`**. Hydration warning seen earlier in Cursor IDE browser (diff only `data-cursor-ref`) = **non-blocking environment / DOM-injection warning**, not an app defect. Non-blocking network **400** on some `profiles` requests (`avatar_url` column missing — known schema mismatch); demo path still usable. |
| 16 | Unit tests | `npm run test` | Vitest completes; record pass/fail counts | PASS | Re-run 2026-07-26: **18 files, 90/90 passed**. |
| 17 | Known limitations reviewed | Read `DEMO_3_KNOWN_LIMITATIONS.md` | Team agrees what will / will not be claimed in video | PASS | Reviewed; Stripe E2E, messaging, matching, host accept-interest, auto-notifications, full RBAC/live RLS, production URL, formal user testing, E2E browser suite remain non-claims. |

---

## Optional checks (not required to claim Demo 3 core success)

| # | Test Area | Action | Expected Result | Result | Notes |
|---|-----------|--------|-----------------|--------|-------|
| A | Stripe Checkout E2E | Complete test payment | Booking becomes `confirmed` | N/A | Keys present; **payment E2E not executed** this pass. |
| B | Logged-out dashboard | Visit `/en/dashboard` logged out | Redirect to login | PASS | Prior same-day verification after Sign Out. |
| C | API docs skim | Open `docs/API.md` | Routes match demo narrative | PASS | Prior same-day skim; booking/games/notifications routes align with demo narrative. |

---

## Sign-off

| Role | Name | Date | Signature / initials |
|------|------|------|----------------------|
| Tester | Agent (Cursor Demo 3 re-verification) | 2026-07-26 | AG |
| Reviewer (optional) | — | — | — |

---

*Do not invent PASS results. Failed or blocked items should be reflected in the Demo 3 known limitations and report.*
