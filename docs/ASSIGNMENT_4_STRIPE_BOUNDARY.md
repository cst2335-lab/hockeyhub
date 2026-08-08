# Assignment 4 — Stripe Webhook Boundary and Technical Debt

**Course:** CST8319 Assignment 4  
**Product:** GoGoHockey  
**Updated:** 2026-08-08  
**Related:** [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md) · [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [API.md](./API.md)

---

## Purpose

This note documents the **honest payment boundary** for final submission. Booking and Stripe-related code exist; **end-to-end test-mode payment confirmation is not claimed** unless separately verified and recorded in [ASSIGNMENT_4_TESTING_EVIDENCE.md](./ASSIGNMENT_4_TESTING_EVIDENCE.md).

---

## What is implemented (code evidence)

| Piece | Location | Status |
|-------|----------|--------|
| Booking form / pricing UI | `app/[locale]/(dashboard)/book/[rinkId]/page.tsx` | Implemented |
| Create Checkout session API | `app/api/bookings/create-checkout/route.ts` | Implemented |
| Recommended webhook path | `app/api/webhooks/stripe/route.ts` | Implemented in code |
| Legacy / compatible webhook path | `app/api/stripe/webhook/route.ts` | Implemented in code |
| Webhook idempotency helpers | `lib/stripe/webhook-idempotency.ts` + unit tests | Implemented |
| Setup docs | `docs/STRIPE_BOOKING_SETUP.md` | Documented |

Safe wording: “Booking form and Stripe Checkout / webhook **routes are implemented**; payment completion depends on keys, webhook endpoint configuration, and live verification.”

---

## What is not claimed

- Full **Checkout → webhook → booking `confirmed`** E2E without recorded test evidence  
- Production payment readiness  
- Dedicated `payments` table sync from application code  
- Complete failed-payment recovery UX  

---

## Webhook boundary (technical debt)

### Duplicate webhook routes

Two paths exist:

1. **Recommended:** `POST /api/webhooks/stripe`  
2. **Legacy / compatible:** `POST /api/stripe/webhook`  

Both are documented in `docs/API.md` and `docs/STRIPE_BOOKING_SETUP.md`. Keeping both avoids breaking older Stripe Dashboard configurations, but creates **maintenance debt** (behavior can drift between handlers).

**Assignment 4 position:** Document the dual path; prefer the recommended route for new setup; defer full consolidation unless verified safe.

### Operational requirements for a real E2E claim

To claim E2E later, all of the following must be true and evidenced:

1. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` configured  
2. Stripe Dashboard (or Stripe CLI) forwarding to the webhook URL  
3. Test-mode Checkout completed  
4. Booking row updated to `confirmed` (and idempotent event handling observed)  
5. Screenshots/logs attached **without secrets**

Until then, keep Stripe marked **partially supported**.

### Related debt (out of final “complete” claims)

- Failed payment handling is limited (logging / cancel toast)  
- No application writes to a dedicated `payments` table  
- Cancel/refund rules exist in API docs; full refund demo is not required for this boundary note  

---

## Safe wording for report / demo

| Prefer | Avoid |
|--------|--------|
| “Checkout create route and webhook handlers are in the codebase.” | “Stripe payments are fully complete.” |
| “E2E confirmation was not recorded for Assignment 4; remaining verification is future work.” | “Production-ready billing.” |
| “Dual webhook paths are technical debt we documented.” | “Payment system is finished and consolidated.” |

---

## Setup pointer

For how to configure keys and webhook URLs, see [STRIPE_BOOKING_SETUP.md](./STRIPE_BOOKING_SETUP.md). Do not paste secret values into this repository or screenshots.
