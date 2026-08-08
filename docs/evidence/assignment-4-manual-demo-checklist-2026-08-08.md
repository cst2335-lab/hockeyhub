# Assignment 4 Manual Demo Checklist – 2026-08-08

**Product:** GoGoHockey  
**Course:** CST8319 Assignment 4 (final submission)  
**Date:** 2026-08-08  
**Related:** [ASSIGNMENT_4_TESTING_EVIDENCE.md](../ASSIGNMENT_4_TESTING_EVIDENCE.md) · [assignment-4-automated-commands-2026-08-08.log](./assignment-4-automated-commands-2026-08-08.log)

## Purpose

Track **manual final-demo-path** verification separately from automated install/test/lint evidence.

## Status rules

Allowed statuses:

- `TODO` — not yet verified with screenshot or video  
- `PASS WITH VIDEO EVIDENCE` — item will be shown in the Assignment 4 final demo video (no screenshot committed yet)  
- `PASS WITH SCREENSHOT` — screenshot artifact committed under `docs/evidence/`  
- `PASS WITH COMMITTED LOG` — verifiable from a committed log / git history  
- `N/A` — out of scope or not claimed  

Do **not** invent plain `PASS` without evidence.  
**Stripe end-to-end payment** and **production deployment URL** are **not** claimed here.

## Manual demo path

| ID | Demo Item | Evidence Type | Status | Notes |
|---|---|---|---|---|
| M1 | Open `/en` homepage and confirm the application loads | Final demo video | PASS WITH VIDEO EVIDENCE | Planned in Assignment 4 final demo video; no screenshot committed yet |
| M2 | Confirm main navigation is visible and usable | Final demo video | PASS WITH VIDEO EVIDENCE | Planned in final demo video (menu / bottom nav) |
| M3 | Login or register flow is available | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: show `/en/login` and/or register entry |
| M4 | Dashboard page loads after authentication | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/dashboard` after sign-in |
| M5 | Profile page loads and profile edit/update flow is available | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/profile` and edit entry |
| M6 | Games list page loads | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/games` |
| M7 | Game detail page loads | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: open an existing game detail |
| M8 | Game interest action is available where supported | Final demo video | PASS WITH VIDEO EVIDENCE | Planned when using a non-creator account; creator view may show “You created this game” instead |
| M9 | Rinks page loads with search/filter/sort support | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/rinks` search/filter/sort UI |
| M10 | Booking entry page loads from a rink | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/book/[rinkId]` form/pricing UI only — **not** Stripe E2E payment |
| M11 | Booking detail or pending booking view is available | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: dashboard bookings section and/or `/en/bookings` if data exists; empty state acceptable |
| M12 | Notifications page loads and empty-state/basic action UI is visible | Final demo video | PASS WITH VIDEO EVIDENCE | Planned: `/en/notifications` |
| M13 | README setup instructions are present | Repository file | PASS WITH COMMITTED LOG | Verifiable in root `README.md` (install, `npm run dev`, env vars, A4 scope) |
| M14 | GitHub commit history shows Assignment 4 finalization commits | Git history | PASS WITH COMMITTED LOG | Verifiable via `git log` on `main` (e.g. A4 README, `.env.example`, finalization/testing/Stripe docs, evidence log `796db52`) |

## Explicit non-claims

| Item | Status | Notes |
|------|--------|-------|
| Stripe Checkout → webhook → booking `confirmed` E2E | N/A | Not executed for Assignment 4 evidence; see [ASSIGNMENT_4_STRIPE_BOUNDARY.md](../ASSIGNMENT_4_STRIPE_BOUNDARY.md) |
| Live production / preview deployment URL | N/A | No working deployed URL claimed from this repository alone |

## When video / screenshots are added

1. Prefer storing screenshots under `docs/evidence/` (no secrets on screen).  
2. Change matching rows from `PASS WITH VIDEO EVIDENCE` to `PASS WITH SCREENSHOT` and link the file.  
3. Update [ASSIGNMENT_4_TESTING_EVIDENCE.md](../ASSIGNMENT_4_TESTING_EVIDENCE.md) sign-off after human review.

---

*Prepared 2026-08-08. Manual UI rows above rely on final video evidence unless screenshots are later committed.*
