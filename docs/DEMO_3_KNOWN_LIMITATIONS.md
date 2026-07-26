# Demo 3 Known Limitations – GoGoHockey / HockeyHub

**Course:** CST8319 Assignment 3  
**Source of truth:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md)  
**Related:** [ASSIGNMENT_3_PROGRESS.md](./ASSIGNMENT_3_PROGRESS.md) · [DEMO_3_VIDEO_WALKTHROUGH.md](./DEMO_3_VIDEO_WALKTHROUGH.md)  
**Updated:** 2026-07-26

---

## Purpose

This list is for the Assignment 3 report and Demo 3 video. It states what the team **will not overclaim**. Limitations below are based on repository evidence unless a item is later verified and documented.

---

## Honest limitations (Assignment 3)

### Payment and booking

- **Stripe E2E payment is not claimed as complete** unless a live test-mode payment is verified (Checkout → webhook → booking `confirmed`) and recorded.
- Booking **form** and **create-checkout API** exist in code; that is **partial support**, not proof of a finished paid workflow.
- Writes to a dedicated **`payments` table** are not implemented in application code.
- Failed-payment handling is limited (logging / cancel URL toast); not a full recovery UX.

### Deployment and operations

- **Production / preview deployment URL is not claimed** unless a working URL is available and documented in the repo or report.
- `vercel.json` and deployment docs exist; that alone is not proof of a live deployment.

### User research

- **Formal user / stakeholder testing is not claimed** unless a real feedback artifact exists (notes, survey, interview summary). Informal team walkthroughs are not formal user testing.

### Missing or incomplete product features

- **Messaging** (user-to-user) is **not implemented** (no `messages` table usage in code).
- **Game matching** via `game_matches` is **not implemented**.
- **Host accept-interest loop is incomplete:** users can express interest; there is no verified host “accept” API that completes contact-sharing as a full product flow.
- **Auto notifications are incomplete:** notifications UI exists; production auto-create on business events is not verified (test insert route only).

### Security and roles

- **Full RBAC is not fully enforced.** Rink-manager style guarding exists for manage-rink; admin / club_admin / parent roles are documented more than enforced in app flows.
- **Live Supabase RLS is not verified** in this documentation pass. Policies exist in `scripts/sql/supabase-rls.sql`; applying them on the remote project must be confirmed separately.
- Page auth relies heavily on **client-side** dashboard layout redirects; middleware does not fully enforce authentication.

### Testing

- **E2E (browser) automated tests are not present** (no Playwright/Cypress suite in repo).
- Unit tests (Vitest) exist and should be re-run for Demo 3 evidence; unit tests are not a substitute for E2E or live payment verification.

### Documentation / process

- Original Assignment 1 report is **not stored** in this repository (`docs/CST8319/` empty); A1 claims must be cross-checked against the submitted course document.
- README remains minimal for Demo 3 setup narrative (update planned separately).
- Git history shows a mature project, but **do not invent** balanced multi-member weekly commit stories from author names alone.

---

## Safe wording for Demo 3

| Prefer saying | Avoid saying |
|---------------|--------------|
| “Implemented in code and demonstrated locally…” | “Fully production-ready payment system” |
| “Booking form and checkout route are in place; payment verification is Assignment 4…” | “Stripe payments are complete” |
| “Notifications UI is available; auto-create is planned for Assignment 4…” | “The system notifies users automatically for all events” |
| “Unit tests pass (see checklist)…” | “Fully tested end-to-end” |
| “Cannot be confirmed from the repository alone…” | “Deployed and used by real users” (unless proven) |

---

## Assignment 4 targets (to close key gaps)

1. Verify Stripe test payment E2E (or explicitly document payment as out of final scope with justification).  
2. Host accept-interest + auto notifications.  
3. Confirm RLS on Supabase; harden protected routes.  
4. Add minimal E2E smoke coverage; finalize README and deployment evidence.

---

*Keep this list visible during filming so the team does not overclaim.*
