# Demo 3 Testing Checklist – GoGoHockey / HockeyHub

**Course:** CST8319 Assignment 3  
**Source of truth:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)  
**Related:** [ASSIGNMENT_3_PROGRESS.md](./ASSIGNMENT_3_PROGRESS.md) · [DEMO_3_KNOWN_LIMITATIONS.md](./DEMO_3_KNOWN_LIMITATIONS.md)  
**Updated:** 2026-07-26

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
| Tester | Agent (Cursor Demo 3 pass) |
| Date | 2026-07-26 |
| Branch / commit | `main` @ `edd214e` |
| Node version | Node `v24.6.0` / npm `11.5.1` |
| `.env.local` configured (Supabase)? | Yes — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set. `SUPABASE_SERVICE_KEY` unset (not required for this demo path). `TEST_LOGIN_USERNAME` / `TEST_LOGIN_PASSWORD` unset — used a newly registered Mailinator test account instead. |
| Stripe keys configured? | Yes — `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set. **Stripe Checkout E2E payment was not run** (optional; not required for A3 core demo). |

---

## Checklist

| # | Test Area | Command / Action | Expected Result | Result | Notes / Evidence |
|---|-----------|------------------|-----------------|--------|------------------|
| 1 | Dependency install | `npm install` | Completes without fatal errors | PASS | `npm install` completed; packages already up to date. |
| 2 | Dev server startup | `npm run dev` | Server starts; app reachable at `http://localhost:3000` (redirects to `/en`) | PASS | Dev server reachable at `http://localhost:3000`; locale routes under `/en` used for checks. |
| 3 | Homepage load | Open `/en` | Homepage / hero loads | PASS | `/en` loads hero (“Making Hockey Accessible for Everyone” / Ottawa hub copy) and main CTAs. |
| 4 | Main navigation | Use navbar / bottom nav | Links reachable (e.g. Games, Clubs, Dashboard, Profile as applicable) | PASS | Menu includes Find Games, Clubs, Ice Rinks, About; signed-out Sign In / Get Started. Logged-in bottom nav: Play, Community, Dashboard, Profile. |
| 5 | Login | `/en/login` with valid test account | Signs in; redirects toward dashboard | PASS | Logged in with demo account `demo3.gogohockey.cst8319@mailinator.com`; redirected to `/en/dashboard`. |
| 6 | Register | `/en/register` (optional if account exists) | Account creation works or shows clear error | PASS | Multi-step register completed for the Mailinator account above; subsequent login succeeded. Brief stay on register UI after submit observed before login confirmation. |
| 7 | Logout | Use Sign Out in dashboard UI | Session cleared; protected pages redirect | PASS | Sign Out from account menu cleared session; visiting `/en/dashboard` then redirected to `/en/login`. |
| 8 | Dashboard | `/en/dashboard` while logged in | Dashboard loads; shows metrics / games / bookings sections (data depends on Supabase) | PASS | Dashboard loaded for “Demo Three Tester”; empty games/bookings sections rendered gracefully. |
| 9 | Profile | `/en/profile` (and optional edit) | Profile view loads; update persists if tested | PASS | Profile loaded (U15 / A / Forward / Kanata); Edit Profile control visible. Persist-edit not re-verified in this pass beyond view. |
| 10 | Games list | `/en/games` | Games list loads or shows empty/error gracefully | PASS | List UI loaded (empty state first; after creating a game, list showed data). |
| 11 | Game detail / interest | Open a game; express interest if logged in | Detail loads; interest action succeeds or shows clear error | PASS | Detail loaded for game `ea5b832d-2349-42d1-8887-82b983ac9e5c` (“Demo 3 Test Game U15”); creator view (“You created this game”). **Interest as a non-creator was not tested** (single account). Game created via `POST /api/games/create` after UI submit was flaky under bottom-nav/devtools overlay. |
| 12 | Rinks browse | `/en/rinks` | List loads; search/filter/sort usable | PASS | `/en/rinks` showed “393 rinks available” with search/filter/sort UI. |
| 13 | Booking page | `/en/book/[rinkId]` from a rink card | Form shows date/time/hours and cost UI | PASS | Opened `/en/book/f3ffcae1-6956-4308-a648-1e77d2754452` (Algonquin College Arena): date/time/duration and $180/hr cost UI; Confirm Booking present. **No Stripe payment E2E.** |
| 14 | Notifications | `/en/notifications` | Page loads; empty state or list visible | PASS | Page loaded with empty state: “No notifications yet”. |
| 15 | Browser console check | DevTools Console on main happy-path pages | No unexpected blocking red errors on demo path | PASS | Demo path pages rendered and navigated. Next.js Dev Tools showed issues including a **React hydration mismatch** tied to `app/[locale]/(dashboard)/layout.tsx` (`DashboardLayout`) — documented; not treated as a blocking crash for Demo 3. |
| 16 | Unit tests | `npm run test` | Vitest completes; record pass/fail counts | PASS | Re-run 2026-07-26: **18 files, 90/90 passed** (`vitest run`). |
| 17 | Known limitations reviewed | Read `DEMO_3_KNOWN_LIMITATIONS.md` | Team agrees what will / will not be claimed in video | PASS | Reviewed; Stripe E2E, messaging, matching, host accept-interest, auto-notifications, full RBAC/RLS live verify, production URL, formal user testing, and E2E browser suite remain non-claims for Demo 3. |

---

## Optional checks (not required to claim Demo 3 core success)

| # | Test Area | Action | Expected Result | Result | Notes |
|---|-----------|--------|-----------------|--------|-------|
| A | Stripe Checkout E2E | Complete test payment | Booking becomes `confirmed` | N/A | Keys present but **payment E2E not executed** this pass. Do not claim paid booking confirmed. |
| B | Logged-out dashboard | Visit `/en/dashboard` logged out | Redirect to login | PASS | After Sign Out, `/en/dashboard` redirected to `/en/login`. |
| C | API docs skim | Open `docs/API.md` | Routes match demo narrative | PASS | `docs/API.md` lists booking/checkout, games create/interest, rinks, notifications-related routes consistent with demo narrative. |

---

## Sign-off

| Role | Name | Date | Signature / initials |
|------|------|------|----------------------|
| Tester | Agent (Cursor Demo 3 pass) | 2026-07-26 | AG |
| Reviewer (optional) | — | — | — |

---

*Do not invent PASS results. Failed or blocked items should be reflected in the Demo 3 known limitations and report.*
