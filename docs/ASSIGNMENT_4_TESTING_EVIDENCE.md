# Assignment 4 Testing Evidence – GoGoHockey

**Course:** CST8319 Assignment 4 (final submission)  
**Updated:** 2026-08-08  
**Related:** [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md)

---

## Instructions

1. Fill **Result** only after actually running the step.  
2. Allowed values: `TODO` | `PASS` | `FAIL` | `BLOCKED` | `N/A`  
3. Do **not** invent PASS results.  
4. Do **not** mark Stripe E2E as PASS unless a real test-mode payment was completed and recorded.

**Environment notes**

| Item | Value |
|------|-------|
| Tester | Agent (Assignment 4 readiness pass) |
| Date | 2026-08-08 |
| Branch / commit | `main` @ readiness pass (see git log at packaging time) |
| Node / npm | Node `v24.6.0` / npm `11.5.1` |
| Supabase `.env.local` configured? | Yes for prior Demo 3 path (local); not re-verified end-to-end in this automated pass |
| Stripe keys configured? | Optional locally — **Stripe E2E not run** this pass |

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
| T1 | `npm install` | Completes without fatal errors | PASS | 2026-08-08: up to date (`INSTALL_EXIT=0`). `npm audit` reports dependency vulnerabilities; not treated as install failure. |
| T2 | `npm run test` | Vitest completes; record pass/fail counts | PASS | 2026-08-08: **18 files, 90/90 passed** (`TEST_EXIT=0`). |
| T3 | `npm run lint` (optional) | No blocking lint errors, or document deprecation notices | PASS | 2026-08-08: no ESLint warnings/errors (`LINT_EXIT=0`). Note: `next lint` deprecation warning for Next.js 16. |
| T4 | `npm run build` (optional) | Build succeeds, or document failure honestly | N/A | Not re-run in this readiness pass (prior packaging session had build Pass). |

---

## Manual demo path checklist

| # | Area | Action | Expected | Result | Notes / Evidence |
|---|------|--------|----------|--------|------------------|
| 1 | Homepage | Open `/en` | Hero / CTAs load | TODO | Carry-forward: Demo 3 checklist PASS (2026-07-26). Re-run before demo if required. |
| 2 | Navigation | Use menu / bottom nav | Main links reachable | TODO | Prior Demo 3 PASS |
| 3 | Login | `/en/login` | Signs in; toward dashboard | TODO | Prior Demo 3 PASS |
| 4 | Dashboard | `/en/dashboard` | Loads metrics / sections | TODO | Prior Demo 3 PASS |
| 5 | Profile | `/en/profile` | Profile view loads | TODO | Prior Demo 3 PASS |
| 6 | Games list | `/en/games` | List or empty state | TODO | Prior Demo 3 PASS |
| 7 | Game detail / interest | Open a game; interest if not creator | Detail loads; interest succeeds or clear error | TODO | Prior Demo 3 PASS for detail; interest DB trigger later fixed (2026-08-03). Re-verify with non-creator account. |
| 8 | Rinks | `/en/rinks` | Browse / search / filter usable | TODO | Prior Demo 3 PASS |
| 9 | Booking form | `/en/book/[rinkId]` | Date/time/cost UI | TODO | Prior Demo 3 PASS for form UI. **No Stripe E2E claim** |
| 10 | Notifications | `/en/notifications` | Page / empty state | TODO | Prior Demo 3 PASS |
| 11 | Console | DevTools on main path | No blocking app crashes | TODO | Prior note: Cursor `data-cursor-ref` hydration is non-blocking tooling noise |

Manual rows left as **TODO** (not invented PASS). Historical Demo 3 results: [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md).

---

## Stripe payment evidence (optional)

| # | Step | Result | Notes |
|---|------|--------|-------|
| S1 | Confirm booking → Stripe Checkout redirect (test mode) | N/A | Not executed this pass |
| S2 | Complete test payment | N/A | Not executed |
| S3 | Webhook updates booking to `confirmed` | N/A | Not executed |
| S4 | Screenshot / log attached (no secrets) | N/A | — |

Booking form and checkout/webhook **routes are partially supported**. Do not claim full Stripe E2E.

See [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md).

---

## Prior Assignment 3 evidence (carry-forward)

Demo 3 checklist (2026-07-26) recorded PASS on the core local UI path and **90/90** unit tests. Used as historical context only; Assignment 4 automated suite was **re-run** on 2026-08-08 (T1–T3 PASS above).

Source: [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md).

---

## Sign-off

| Role | Name | Date | Initials |
|------|------|------|----------|
| Tester | Agent (Assignment 4 readiness pass) | 2026-08-08 | AG |
| Reviewer (optional) | — | — | — |

---

*Automated results above are real. Manual UI rows remain TODO unless re-verified in a browser session.*
