# Assignment 4 Testing Evidence – GoGoHockey

**Course:** CST8319 Assignment 4 (final submission)  
**Updated:** 2026-08-08  
**Related:** [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md)

---

## Instructions

1. Fill **Result** only after actually running the step.  
2. Allowed values: `TODO` | `PASS` | `FAIL` | `BLOCKED` | `N/A`  
3. Do **not** invent PASS results.  
4. For automated commands (install / test / lint / build), a **PASS requires a committed, secret-free output artifact** under `docs/evidence/` (or an equivalent attached log). Counts and exit codes alone in this markdown file are not sufficient evidence.  
5. Do **not** mark Stripe E2E as PASS unless a real test-mode payment was completed and recorded.

**Environment notes**

| Item | Value |
|------|-------|
| Tester | Automated command capture (see artifact); human reviewer should confirm the log |
| Date | 2026-08-08 |
| Branch / commit | `main` @ `53b5ba2` (commit recorded in evidence log header; may advance after this doc is committed) |
| Node / npm | Node `v24.6.0` / npm `11.5.1` (from evidence log) |
| Supabase `.env.local` configured? | Not asserted by this automated capture |
| Stripe keys configured? | Not required for T1–T3 — **Stripe E2E not run** |

**Verifiable automated artifact:** [evidence/assignment-4-automated-commands-2026-08-08.log](./evidence/assignment-4-automated-commands-2026-08-08.log)

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
| T2 | `npm run test` | Vitest completes; record pass/fail counts | PASS | Same log: `Test Files  18 passed (18)`, `Tests  90 passed (90)`, `EXIT_CODE=0`. |
| T3 | `npm run lint` (optional) | No blocking lint errors, or document deprecation notices | PASS | Same log: `No ESLint warnings or errors`, `EXIT_CODE=0`. Includes Next.js notice that `next lint` is deprecated. |
| T4 | `npm run build` (optional) | Build succeeds, or document failure honestly | N/A | Not included in the 2026-08-08 automated artifact. Do not claim PASS without a captured build log. |

---

## Manual demo path checklist

| # | Area | Action | Expected | Result | Notes / Evidence |
|---|------|--------|----------|--------|------------------|
| 1 | Homepage | Open `/en` | Hero / CTAs load | TODO | Not re-verified in this automated capture. Historical Demo 3 checklist only — do not treat as A4 PASS. |
| 2 | Navigation | Use menu / bottom nav | Main links reachable | TODO | Not re-verified here |
| 3 | Login | `/en/login` | Signs in; toward dashboard | TODO | Not re-verified here |
| 4 | Dashboard | `/en/dashboard` | Loads metrics / sections | TODO | Not re-verified here |
| 5 | Profile | `/en/profile` | Profile view loads | TODO | Not re-verified here |
| 6 | Games list | `/en/games` | List or empty state | TODO | Not re-verified here |
| 7 | Game detail / interest | Open a game; interest if not creator | Detail loads; interest succeeds or clear error | TODO | Not re-verified here |
| 8 | Rinks | `/en/rinks` | Browse / search / filter usable | TODO | Not re-verified here |
| 9 | Booking form | `/en/book/[rinkId]` | Date/time/cost UI | TODO | Not re-verified here. **No Stripe E2E claim** |
| 10 | Notifications | `/en/notifications` | Page / empty state | TODO | Not re-verified here |
| 11 | Console | DevTools on main path | No blocking app crashes | TODO | Not re-verified here |

Manual rows remain **TODO**. Historical context only: [DEMO_3_TESTING_CHECKLIST.md](./DEMO_3_TESTING_CHECKLIST.md) (Assignment 3).

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
| Human reviewer (required for final claim of manual PASS) | TODO | TODO | TODO |

---

*T1–T3 PASS only with the linked evidence log. Manual UI and Stripe E2E remain non-PASS until separately verified with artifacts.*
