# Assignment 4 Feature Traceability – GoGoHockey

**Course:** CST8319 Software Development Project — Assignment 4  
**Updated:** 2026-08-16  
**Sources:** [ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./ASSIGNMENT_3_4_SCOPE_ANALYSIS.md) · [ASSIGNMENT_4_FINALIZATION.md](./ASSIGNMENT_4_FINALIZATION.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [ROLES_AND_ROUTE_GUARDS.md](./ROLES_AND_ROUTE_GUARDS.md)

**Live Application:** https://gogohockey-henna.vercel.app/en  

GoGoHockey is deployed on Vercel, with Supabase providing database, authentication, and backend data services.

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
| Personal dashboard / hub | Dashboard use case | `dashboard/page.tsx`, `my-games/page.tsx`, live posted metrics via `/api/games/posted-metrics` + `lib/games/posted-metrics.ts` (creator cards use current views/active interests) | Implemented |
| Browse Ottawa ice rinks | Rinks list / data model | `rinks/page.tsx`, `lib/queries/rinks.ts` | Implemented |
| Reserve ice time (booking) | Booking flow | `book/[rinkId]/page.tsx`, bookings APIs | Partially supported (form + create-checkout; **Stripe E2E not claimed**) |
| Online payment | Payment design (Checkout + webhook) | `/api/bookings/create-checkout`, `/api/webhooks/stripe`, `/api/stripe/webhook`, `docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md` | Partially supported (**no full E2E claim**) |
| Game invitations: post / browse / interest | Games use cases | `games/*`, `/api/games/create`, `/api/games/interest`, `/api/games/view`, `/api/games/posted-metrics` (live creator metrics); capacity helper `lib/games/capacity.ts` | Implemented (host accept incomplete; capacity + view/interest metrics corrected and unit-tested) |
| Confirm / match games | Matching design | No `game_matches` usage in app code | Not implemented (**do not claim automatic matching**) |
| User-to-user messaging | Messaging module | No messages module / table usage | Not implemented (**do not claim direct messaging**) |
| Notifications / alerts | Notifications design | `notifications/page.tsx`, `useNotifications.ts`; interest-create DB trigger; interest-remove API notify (`lib/notifications/interest-removed.ts`) | Partially supported (UI yes; create+remove interest notify; host accept / booking events incomplete) |
| Clubs / roles | AuthZ / RBAC design | Clubs pages + API; `manage-rink` guard; `docs/ROLES_AND_ROUTE_GUARDS.md` | Partially supported (**full RBAC not claimed**) |
| Data security / RLS | Security design / ERD policies | `scripts/sql/supabase-rls.sql` | Documented only / partially applied (**live RLS not claimed as fully verified**) |
| i18n (en/fr) | Localization | `next-intl`, `messages/en.json`, `messages/fr.json` | Implemented |
| External dependencies documented | Deployment / env design | `.env.example`, `docs/DEPLOYMENT.md` | Implemented (docs) |
| Testing evidence | Quality / verification | `__tests__/` (Vitest), `docs/ASSIGNMENT_4_TESTING_EVIDENCE.md`, `docs/evidence/assignment-4-final-verification-2026-08-16.log` | Implemented for unit tests; no browser E2E suite |
| Production deployment | Ops / Vercel + Supabase | Live app https://gogohockey-henna.vercel.app/en; `vercel.json`, `docs/DEPLOYMENT.md` | Implemented (verified Vercel + Supabase) |

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
2. Full RBAC across all roles  
3. Direct messaging  
4. Automatic game matching  

**Do claim (verified):** live Vercel deployment at https://gogohockey-henna.vercel.app/en with Supabase database, authentication, and backend data services.

Use: **implemented**, **partially supported**, or **not implemented**, with the evidence column above.

---

*This matrix supports Assignment 4 final submission. Prefer code paths and docs listed here over aspirational roadmap language.*
