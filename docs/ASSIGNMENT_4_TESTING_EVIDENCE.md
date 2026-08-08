# Assignment 4 Testing Evidence – GoGoHockey

**Course:** CST8319 Assignment 4 (final submission)  
**Updated:** 2026-08-08  
**Related:** [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md)

---

## Evidence Policy

| Kind | Requirement to mark PASS |
|------|--------------------------|
| Automated (install / test / lint / build) | Committed, secret-free command-output log under `docs/evidence/` |
| Manual demo path | Screenshot under `docs/evidence/` **or** final demo video evidence (status: `PASS WITH SCREENSHOT` / `PASS WITH VIDEO EVIDENCE`) |
| Unsupported / unverified | Must remain `TODO` or `N/A` |

Do **not** invent PASS results. Do **not** claim Stripe E2E payment or a production deployment URL without real evidence.

---

## Instructions

1. Fill **Result** only after actually running the step.  
2. Allowed values for automated/manual tables in this file: `TODO` | `PASS` | `FAIL` | `BLOCKED` | `N/A`  
3. Manual demo checklist statuses also include `PASS WITH VIDEO EVIDENCE`, `PASS WITH SCREENSHOT`, and `PASS WITH COMMITTED LOG` (see linked evidence file).  
4. For automated commands, a **PASS requires** the committed log linked below.  
5. Do **not** mark Stripe E2E as PASS unless a real test-mode payment was completed and recorded.

**Environment notes**

| Item | Value |
|------|-------|
| Tester | Automated command capture (see artifact); human reviewer should confirm the log |
| Date | 2026-08-08 |
| Branch / commit | `main` @ `796db52` (evidence log header may show earlier hash from capture time) |
| Node / npm | Node `v24.6.0` / npm `11.5.1` (from evidence log) |
| Supabase `.env.local` configured? | Not asserted by the automated capture |
| `SUPABASE_SERVICE_KEY` | **Required for game view tracking** (`POST /api/games/view`). Also used for server/admin scripts. Name only — no secret value in repo (see `.env.example`). |
| Stripe keys configured? | Not required for T1–T3 — **Stripe E2E not run** |

**Verifiable automated artifact:** [evidence/assignment-4-automated-commands-2026-08-08.log](./evidence/assignment-4-automated-commands-2026-08-08.log)

Automated checks (T1–T3) are supported by that committed log. Manual demo-path checks are tracked **separately** in the manual checklist linked below.

---

## Local run steps

```bash
npm install
cp .env.example .env.local   # then fill values (Windows: copy .env.example .env.local)
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

---

## Automated tests

```bash
npm run test
```

| # | Command | Expected | Result | Notes / Evidence |
|---|---------|----------|--------|------------------|
| T1 | `npm install` | Completes without fatal errors | PASS | Captured in [assignment-4-automated-commands-2026-08-08.log](./evidence/assignment-4-automated-commands-2026-08-08.log): `up to date, audited 958 packages`, `EXIT_CODE=0`. Audit vulnerability listing is informational. |
| T2 | `npm run test` | Vitest completes; record pass/fail counts | PASS | **Latest (past status display):** [evidence/assignment-4-game-past-status-fix-test-2026-08-08.log](./evidence/assignment-4-game-past-status-fix-test-2026-08-08.log) — `Test Files  25 passed (25)`, `Tests  138 passed (138)`. |
| T3 | `npm run lint` (optional) | No blocking lint errors, or document deprecation notices | PASS | Same log: `No ESLint warnings or errors`, `EXIT_CODE=0`. Includes Next.js notice that `next lint` is deprecated. |
| T4 | `npm run build` (optional) | Build succeeds, or document failure honestly | N/A | Not included in the 2026-08-08 automated artifact. Do not claim PASS without a captured build log. |

---

## Manual Demo Verification Evidence

Manual UI demo-path verification is tracked here:

**[evidence/assignment-4-manual-demo-checklist-2026-08-08.md](./evidence/assignment-4-manual-demo-checklist-2026-08-08.md)**

That file covers M1–M14 (homepage through GitHub A4 commit history). Most UI rows use **PASS WITH VIDEO EVIDENCE** (planned final demo video; no screenshots committed yet). README presence and A4 git history use **PASS WITH COMMITTED LOG**.

Stripe E2E payment and production deployment remain **N/A** in that checklist.

### Final Demo Bug Fix Evidence

During local Assignment 4 demo verification, homepage game cards showed **Players 0/** and **Game Full** when `max_players` was missing, null, or 0.

| Item | Detail |
|------|--------|
| Bug | `game-card-working.tsx` treated `null`/`0` max capacity as full (`null` coerces to `0`, so `spotsLeft <= 0`) |
| Fix commit | `3a8f969` — `fix: correct game capacity full-state logic` |
| Code | `lib/games/capacity.ts`; card uses `getGameCapacityState`; shows `0 / Open`, progress 0%, label Open, CTA Join Game when capacity unknown |
| Tests | `__tests__/lib/games/capacity.test.ts` |
| Verifiable log | [evidence/assignment-4-game-capacity-fix-test-2026-08-08.log](./evidence/assignment-4-game-capacity-fix-test-2026-08-08.log) — **19 files, 97/97 passed** |

No screenshots invented. Stripe E2E remains **N/A**.

### Final Demo Flow Fixes

Local Assignment 4 demo found three consistency bugs. Fixed in commit **`2a8cca5`** (`fix: align dashboard game and notification demo flows`).

| Issue | Root cause | Fix | Status |
|-------|------------|-----|--------|
| Game views stuck at 0 | RLS allows only creators to `UPDATE game_invitations`, so `/api/games/view` never persisted `view_count` for other viewers | Service-role write + `game_views` per-user dedupe; detail page applies returned `viewCount` | Fixed |
| Dashboard "Upcoming Bookings" stayed at 1 after cancel | Metrics query counted all future-dated bookings including `cancelled` | Exclude cancelled; count only `pending` / `confirmed` / `paid` on/after today (`lib/booking/upcoming.ts`); UI prefers same list as My Bookings | Fixed |
| No notification when interest removed | Remove-interest APIs deleted the row only | Best-effort `interest_removed` notification to creator (skip if remover is creator); insert failure does not fail remove | Fixed |

| Item | Detail |
|------|--------|
| Code | `app/api/games/view/route.ts`, `lib/games/record-view.ts`, `lib/booking/upcoming.ts`, `lib/notifications/interest-removed.ts`, interest remove routes, `dashboard/page.tsx`, game detail page |
| Tests | `__tests__/lib/games/record-view.test.ts`, `__tests__/lib/booking/upcoming.test.ts`, `__tests__/lib/notifications/interest-removed.test.ts` |
| Verifiable log | [evidence/assignment-4-demo-flow-fixes-test-2026-08-08.log](./evidence/assignment-4-demo-flow-fixes-test-2026-08-08.log) — **22 files, 112/112 passed** |
| Optional SQL | `scripts/sql/game-views-unique-index.sql` (unique `(game_id, viewer_id)`; app already dedupes via SELECT) |
| Lint | `npm run lint` — no ESLint warnings/errors (Next deprecation notice only) |
| Non-claims | Stripe E2E, production URL, messaging, automatic matching — unchanged |

Anonymous / unauthenticated game views are **not** counted (auth required for `/api/games/view`); this matches the detail page guard. **`SUPABASE_SERVICE_KEY` is required** in `.env.local` for view counts to persist (service-role write bypasses creator-only RLS). The key name is listed in `.env.example` / README with an empty value — **no real secret is stored in the repository**.


### Posted Game Metrics Fix

Posted game metrics were corrected so creator-side cards and dashboard summaries use current view and active interest counts.

| Item | Detail |
|------|--------|
| Bug | My Posted Games showed `0 views` / `0 interested` while `game_views` / `game_interests` (and interest notifications) already had rows; denormalized `view_count` / `interested_count` were stale because non-owners cannot UPDATE `game_invitations` under RLS |
| Fix | Live metrics via `GET /api/games/posted-metrics` + `lib/games/posted-metrics.ts`; dashboard / my-games enrich cards from `game_views` and active `game_interests`; `syncInterestedCount` uses service role |
| Commit | `0246bde` (`fix: correct posted game view and interest metrics`) |
| Tests | `__tests__/lib/games/posted-metrics.test.ts` |
| Verifiable log | [evidence/assignment-4-posted-game-metrics-fix-test-2026-08-08.log](./evidence/assignment-4-posted-game-metrics-fix-test-2026-08-08.log) — **23 files, 120/120 passed** |
| Lint | `npm run lint` — no ESLint warnings/errors (Next deprecation notice only) |
| Non-claims | Stripe E2E, production URL, messaging, automatic matching — unchanged |


### Game Date Classification Fix

Game date classification was corrected so yesterday/past games are not shown in Upcoming.

| Item | Detail |
|------|--------|
| Bug | Find Games Upcoming tab included yesterday games (date-only / UTC-drift `isExpired`) |
| Fix | `lib/games/schedule.ts` compares local `game_date` + `game_time` to now; `fetchGamesListQuery` sets `isExpired` from that |
| Commit message | `fix: correct game upcoming and past date classification` |
| Tests | `__tests__/lib/games/schedule.test.ts`, updated `__tests__/lib/queries/games.test.ts` |
| Verifiable log | [evidence/assignment-4-game-date-classification-fix-test-2026-08-08.log](./evidence/assignment-4-game-date-classification-fix-test-2026-08-08.log) — **24 files, 131/131 passed** |
| Lint | `npm run lint` — no ESLint warnings/errors |
| Non-claims | Stripe E2E, production URL, messaging, automatic matching — unchanged |


### Past Game Status Display Fix

Past games with status=open are now displayed as past/closed and are excluded from active open/upcoming counts.

| Item | Detail |
|------|--------|
| Bug | Cards still showed DB badge `open` + Join/Interest after kickoff (e.g. Aug 8 10:00 shown as active open) |
| Fix | `lib/games/display-status.ts` overrides `open` → `past` when scheduled datetime < now; wired into Find Games, homepage card, detail, dashboard, My Games |
| Commit message | `fix: display past games as inactive instead of open` |
| Tests | `__tests__/lib/games/display-status.test.ts` (+ posted-metrics open count) |
| Verifiable log | [evidence/assignment-4-game-past-status-fix-test-2026-08-08.log](./evidence/assignment-4-game-past-status-fix-test-2026-08-08.log) — **25 files, 138/138 passed** |
| Non-claims | Stripe E2E, production URL, messaging, automatic matching — unchanged |

### Summary mirror (do not invent PASS)

| Area | Status in manual checklist | Notes |
|------|----------------------------|-------|
| Core UI demo path (M1–M12) | PASS WITH VIDEO EVIDENCE | Pending final Assignment 4 demo video |
| README setup (M13) | PASS WITH COMMITTED LOG | Root `README.md` |
| A4 git history (M14) | PASS WITH COMMITTED LOG | `git log` on `main` |
| Stripe E2E | N/A | Not executed |
| Production URL | N/A | Not claimed |

Historical Assignment 3 UI notes only: [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md).

---

## Stripe payment evidence (optional)

| # | Step | Result | Notes |
|---|------|--------|-------|
| S1 | Confirm booking → Stripe Checkout redirect (test mode) | N/A | Not executed |
| S2 | Complete test payment | N/A | Not executed |
| S3 | Webhook updates booking to `confirmed` | N/A | Not executed |
| S4 | Screenshot / log attached (no secrets) | N/A | — |

Booking form and checkout/webhook **routes are partially supported**. Do not claim full Stripe E2E.

See [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md).

---

## Prior Assignment 3 evidence (carry-forward)

Demo 3 checklist (2026-07-26) is historical UI evidence only. Assignment 4 automated PASS rows above are tied to the committed log under `docs/evidence/`, not to chat history alone.

---

## Sign-off

| Role | Name | Date | Initials |
|------|------|------|----------|
| Automated capture | See `docs/evidence/assignment-4-automated-commands-2026-08-08.log` | 2026-08-08 | — |
| Manual demo checklist | See `docs/evidence/assignment-4-manual-demo-checklist-2026-08-08.md` | 2026-08-08 | — |
| Human reviewer (confirm video / screenshots) | TODO | TODO | TODO |

---

*Automated PASS requires the linked command log. Manual demo PASS requires video or screenshot evidence as stated in the manual checklist.*
