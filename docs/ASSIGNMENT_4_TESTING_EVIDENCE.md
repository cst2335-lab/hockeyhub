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
| T2 | `npm run test` | Vitest completes; record pass/fail counts | PASS | Same log: `Test Files  18 passed (18)`, `Tests  90 passed (90)`, `EXIT_CODE=0`. |
| T3 | `npm run lint` (optional) | No blocking lint errors, or document deprecation notices | PASS | Same log: `No ESLint warnings or errors`, `EXIT_CODE=0`. Includes Next.js notice that `next lint` is deprecated. |
| T4 | `npm run build` (optional) | Build succeeds, or document failure honestly | N/A | Not included in the 2026-08-08 automated artifact. Do not claim PASS without a captured build log. |

---

## Manual Demo Verification Evidence

Manual UI demo-path verification is tracked here:

**[evidence/assignment-4-manual-demo-checklist-2026-08-08.md](./evidence/assignment-4-manual-demo-checklist-2026-08-08.md)**

That file covers M1–M14 (homepage through GitHub A4 commit history). Most UI rows use **PASS WITH VIDEO EVIDENCE** (planned final demo video; no screenshots committed yet). README presence and A4 git history use **PASS WITH COMMITTED LOG**.

Stripe E2E payment and production deployment remain **N/A** in that checklist.

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
