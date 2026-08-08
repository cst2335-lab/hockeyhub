# Assignment 4 Feature Traceability – GoGoHockey

**Course:** CST8319 Software Development Project — Assignment 4  
**Updated:** 2026-08-08  
**Sources:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md) · [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [ROLES_AND_ROUTE_GUARDS.md](./ROLES_AND_ROUTE_GUARDS.md)

**Note:** The original Assignment 1 / Assignment 2 submission PDFs are not stored in this repository. Rows below map **expected course intent** (from product docs and prior scope analysis) to **code evidence** and **Assignment 4 final status**. Cross-check against the team’s submitted A1/A2 documents.

---

## Status legend

| Status | Meaning |
|--------|---------|
| Implemented | Demonstrable with code + local run (when env configured) |
| Partially supported | Code exists; live/end-to-end verification incomplete or limited |
| Not implemented | No credible product implementation to claim |
| Documented only | Described in docs/SQL; not enforced or not wired in app flows |

---

## Traceability matrix

| Assignment 1 requirement (intent) | Assignment 2 design element | Code / doc evidence | Final A4 status |
|-----------------------------------|-----------------------------|---------------------|-----------------|
| Ottawa youth hockey community platform (find/post games, book ice, clubs) | System architecture / product positioning | `README.md`, `docs/ARCHITECTURE.md`, `app/[locale]/` | Implemented |
| Modern web stack + cloud backend | Tech stack / services architecture | Next.js 15, TypeScript, Tailwind, Supabase, Stripe configs, `package.json` | Implemented |
| User accounts: register / sign in | AuthN flows | `LoginClient.tsx`, `RegisterClient.tsx`, `lib/supabase/*` | Implemented |
| Hockey profile | Profile UI / entity | `profile/page.tsx`, `profile/edit/page.tsx`, `/api/profile/update` | Implemented |
| Personal dashboard / hub | Dashboard use case | `dashboard/page.tsx` | Implemented |
| Browse Ottawa ice rinks | Rinks list / data model | `rinks/page.tsx`, `lib/queries/rinks.ts` | Implemented |
| Reserve ice time (booking) | Booking flow | `book/[rinkId]/page.tsx`, bookings APIs | Partially supported (form + create-checkout; **Stripe E2E not claimed**) |
| Online payment | Payment design (Checkout + webhook) | `/api/bookings/create-checkout`, `/api/webhooks/stripe`, `/api/stripe/webhook`, `docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md` | Partially supported (**no full E2E claim**) |
| Game invitations: post / browse / interest | Games use cases | `games/*`, `/api/games/create`, `/api/games/interest`; capacity helper `lib/games/capacity.ts` (fix `3a8f969`: full only when `maxPlayers > 0` and `currentPlayers >= maxPlayers`; tests in `__tests__/lib/games/capacity.test.ts`) | Implemented (host accept incomplete; capacity full-state corrected and unit-tested) |
| Confirm / match games | Matching design | No `game_matches` usage in app code | Not implemented (**do not claim automatic matching**) |
| User-to-user messaging | Messaging module | No messages module / table usage | Not implemented (**do not claim direct messaging**) |
| Notifications / alerts | Notifications design | `notifications/page.tsx`, `useNotifications.ts`; some DB triggers | Partially supported (UI yes; full auto-create incomplete) |
| Clubs / roles | AuthZ / RBAC design | Clubs pages + API; `manage-rink` guard; `docs/ROLES_AND_ROUTE_GUARDS.md` | Partially supported (**full RBAC not claimed**) |
| Data security / RLS | Security design / ERD policies | `scripts/sql/supabase-rls.sql` | Documented only / partially applied (**live RLS not claimed as fully verified**) |
| i18n (en/fr) | Localization | `next-intl`, `messages/en.json`, `messages/fr.json` | Implemented |
| External dependencies documented | Deployment / env design | `.env.example`, `AGENTS.md`, `docs/DEPLOYMENT.md` | Implemented (docs) |
| Testing evidence | Quality / verification | `__tests__/` (Vitest), `docs/ASSIGNMENT_4_TESTING_EVIDENCE.md` | Implemented for unit tests; no browser E2E suite |
| Production deployment | Ops / Vercel | `vercel.json`, `docs/DEPLOYMENT.md` | Documented only (**no production URL claim** without separate evidence) |

---

## Design-to-code summary (Assignment 2 → final)

| Design expectation | Final alignment |
|--------------------|-----------------|
| App Router + API + Supabase + Stripe | Aligned in code structure |
| Auth / games / rinks / book / dashboard flows | Mostly aligned; messaging & matching absent |
| Component / feature folders | Aligned (`components/*`, `lib/*`) |
| ERD / tables | Mostly aligned; unused / unwired areas remain (`messages`, `game_matches`, `payments` writes) |
| Validated server write paths | Aligned (`requireAuth` + Zod) |
| Full role matrix enforcement | Not aligned as complete product claim |

---

## Explicit non-claims (Assignment 4)

Do **not** state in the final report or demo that GoGoHockey provides:

1. Fully verified Stripe end-to-end payment confirmation  
2. A live production deployment URL (unless separately proven)  
3. Full RBAC across all roles  
4. Direct messaging  
5. Automatic game matching  

Use: **implemented**, **partially supported**, or **not implemented**, with the evidence column above.

---

*This matrix supports Assignment 4 final submission. Prefer code paths and docs listed here over aspirational roadmap language.*
