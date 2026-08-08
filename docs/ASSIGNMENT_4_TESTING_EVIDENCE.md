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
| Tester | TODO |
| Date | TODO |
| Branch / commit | TODO |
| Node / npm | TODO |
| Supabase `.env.local` configured? | TODO (Yes/No) |
| Stripe keys configured? | TODO (Yes/No — E2E optional / not required to claim core A4 docs) |

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
| T1 | `npm install` | Completes without fatal errors | TODO | |
| T2 | `npm run test` | Vitest completes; record pass/fail counts | TODO | Prior A3 evidence: 90/90 — **re-verify** for A4 |
| T3 | `npm run lint` (optional) | No blocking lint errors, or document deprecation notices | TODO | |
| T4 | `npm run build` (optional) | Build succeeds, or document failure honestly | TODO | |

---

## Manual demo path checklist

| # | Area | Action | Expected | Result | Notes / Evidence |
|---|------|--------|----------|--------|------------------|
| 1 | Homepage | Open `/en` | Hero / CTAs load | TODO | |
| 2 | Navigation | Use menu / bottom nav | Main links reachable | TODO | |
| 3 | Login | `/en/login` | Signs in; toward dashboard | TODO | |
| 4 | Dashboard | `/en/dashboard` | Loads metrics / sections | TODO | |
| 5 | Profile | `/en/profile` | Profile view loads | TODO | |
| 6 | Games list | `/en/games` | List or empty state | TODO | |
| 7 | Game detail / interest | Open a game; interest if not creator | Detail loads; interest succeeds or clear error | TODO | |
| 8 | Rinks | `/en/rinks` | Browse / search / filter usable | TODO | |
| 9 | Booking form | `/en/book/[rinkId]` | Date/time/cost UI | TODO | **No Stripe E2E claim** |
| 10 | Notifications | `/en/notifications` | Page / empty state | TODO | |
| 11 | Console | DevTools on main path | No blocking app crashes | TODO | Note Cursor `data-cursor-ref` hydration noise separately |

---

## Stripe payment evidence (optional)

| # | Step | Result | Notes |
|---|------|--------|-------|
| S1 | Confirm booking → Stripe Checkout redirect (test mode) | TODO / N/A | |
| S2 | Complete test payment | TODO / N/A | |
| S3 | Webhook updates booking to `confirmed` | TODO / N/A | |
| S4 | Screenshot / log attached (no secrets) | TODO / N/A | |

If not completed, mark **N/A** and keep wording: booking form and checkout route are **partially supported**.

See [ASSIGNMENT_4_STRIPE_BOUNDARY.md](./ASSIGNMENT_4_STRIPE_BOUNDARY.md).

---

## Prior Assignment 3 evidence (carry-forward)

Demo 3 checklist (2026-07-26) recorded PASS on core local path and **90/90** unit tests. Treat that as historical evidence; **re-run** T1–T2 and key manual paths for Assignment 4 sign-off when possible.

Source: [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md).

---

## Sign-off

| Role | Name | Date | Initials |
|------|------|------|----------|
| Tester | TODO | TODO | TODO |
| Reviewer (optional) | TODO | TODO | TODO |

---

*Placeholders above must be filled with real results before claiming final testing complete.*
