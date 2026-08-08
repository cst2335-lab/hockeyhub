# GoGoHockey

Ottawa youth ice hockey community platform — find and post games, browse rinks, start ice bookings, and manage a player profile.

**Course:** CST8319 Software Development Project — **Assignment 4** (final project submission)  
**GitHub:** [github.com/cst2335-lab/hockeyhub](https://github.com/cst2335-lab/hockeyhub)  
**Package name:** `gogohockey` (v2.0.0)

This README is for instructors reviewing **Assignment 4 final submission**. It describes the finalized, documented state of the GoGoHockey codebase: what is implemented, what remains partially supported, and what is explicitly not claimed.

---

## Project overview

GoGoHockey helps Ottawa-area players, parents, and clubs:

- sign in and manage a hockey profile;
- use a personal dashboard;
- browse and post game invitations;
- browse Ottawa ice rinks;
- open a booking form with checkout route support (**Stripe end-to-end payment is not claimed as fully verified**);
- view a notifications UI.

The project uses Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase, and next-intl (English / French). Canonical UI lives under `app/[locale]/`.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS · `next-themes` |
| Auth / database | Supabase |
| Internationalization | next-intl (`en`, `fr`) |
| Payments (partial) | Stripe Checkout + webhook code (E2E payment **not** claimed without recorded verification) |
| Unit tests | Vitest |

---

## How to run locally

**Prerequisites:** Node.js 18+, npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/en` by default.

Copy `.env.example` to `.env.local` and fill in values (never commit secrets). Without real Supabase credentials, the UI can still render, but data-dependent pages may fail or show empty/error states. See [AGENTS.md](./AGENTS.md).

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `SUPABASE_SERVICE_KEY` | For server/admin scripts | Service role key (map `SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_KEY` if needed) |
| `STRIPE_SECRET_KEY` | Optional for core demo | Stripe secret (booking checkout) |
| `STRIPE_WEBHOOK_SECRET` | Optional for core demo | Stripe webhook signature (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key |

See [`.env.example`](./.env.example) and [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## Assignment 4 final scope

### Implemented (safe to demonstrate)

- Locale routes (`/en`, `/fr`)
- Login, register, logout (Supabase Auth)
- Profile view / update
- Dashboard (metrics / games / bookings when Supabase is configured)
- Games: list, create, detail, express interest
- Rinks: browse with search / filter / sort
- Notifications page UI (list / read / delete)
- API routes with Zod validation on main write paths
- Unit tests (Vitest) and Assignment 4 finalization docs

### Partially supported (do not overclaim)

- **Booking → Stripe:** booking form and create-checkout API exist; webhook handlers exist with idempotency helpers. **Full Checkout → webhook → booking `confirmed` E2E is not claimed** unless separately verified and recorded.
- **Notifications:** UI works; automatic creation from all business events is incomplete (some DB triggers exist; host accept loop remains incomplete).
- **Page protection:** dashboard layout redirects unauthenticated users (client-side); middleware does not fully enforce auth on all pages.

### Not claimed in Assignment 4

- Full production / preview deployment URL (unless separately verified)
- Complete Stripe payment workflow as “done”
- Direct messaging
- Automatic game matching / `game_matches`
- Complete host accept-interest / contact-reveal product flow
- Full RBAC enforcement
- Live RLS verification on remote Supabase as fully confirmed
- Browser E2E automated suite (Playwright/Cypress)

Details: [docs/ASSIGNMENT_4_FINALIZATION.md](./docs/ASSIGNMENT_4_FINALIZATION.md).

---

## Testing

```bash
npm run test
```

Runs Vitest under `__tests__/`. Manual paths and evidence: [docs/ASSIGNMENT_4_TESTING_EVIDENCE.md](./docs/ASSIGNMENT_4_TESTING_EVIDENCE.md).

---

## Known limitations

- Stripe Checkout E2E payment confirmation is **not** claimed without recorded verification.
- Messaging and automatic game matching are **not implemented**.
- Host accept-interest and full auto-notification coverage remain incomplete.
- Full RBAC and live RLS confirmation are **not** claimed as complete.
- No production URL is claimed from this repository alone.
- No Playwright/Cypress E2E suite in the repo.

Stripe webhook boundary / technical debt: [docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md](./docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md).

---

## Assignment 4 evidence docs

| Document | Purpose |
|----------|---------|
| [docs/ASSIGNMENT_4_FINALIZATION.md](./docs/ASSIGNMENT_4_FINALIZATION.md) | Final feature status and limitations |
| [docs/ASSIGNMENT_4_TESTING_EVIDENCE.md](./docs/ASSIGNMENT_4_TESTING_EVIDENCE.md) | Local run, tests, demo paths, evidence |
| [docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md](./docs/ASSIGNMENT_4_STRIPE_BOUNDARY.md) | Stripe webhook boundary and debt |
| [docs/ASSIGNMENT_4_CODE_PACKAGE_NOTES.md](./docs/ASSIGNMENT_4_CODE_PACKAGE_NOTES.md) | Final code package notes |
| [docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md) | A3 / A4 scope analysis (historical) |
| [docs/DEMO_3_TESTING_CHECKLIST.md](./docs/DEMO_3_TESTING_CHECKLIST.md) | Assignment 3 testing checklist (prior evidence) |

---

## Project structure

```
app/[locale]/     # Main UI (en/fr)
app/api/          # API route handlers
app/(dev)/        # Debug pages (blocked in production)
components/       # UI and feature components
lib/              # Supabase, validation, business logic
scripts/sql/      # Database SQL (RLS, rinks)
docs/             # Documentation index → docs/README.md
messages/         # i18n copy
__tests__/        # Vitest unit tests
```

Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Documentation index

| Document | Description |
|----------|-------------|
| [docs/README.md](./docs/README.md) | Full documentation index |
| [AGENTS.md](./AGENTS.md) | Env vars, commands, developer conventions |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture and modules |
| [docs/API.md](./docs/API.md) | API routes |
| [docs/TASKS.md](./docs/TASKS.md) | Current tasks and phases |
| [docs/THEMING.md](./docs/THEMING.md) | Theme and brand tokens |
| [docs/RENEW_RINKS.md](./docs/RENEW_RINKS.md) | Rink data import |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide |
| [docs/STRIPE_BOOKING_SETUP.md](./docs/STRIPE_BOOKING_SETUP.md) | Stripe booking setup |

---

## Deployment notes

Vercel is the recommended host. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**Assignment 4 does not claim a live production/preview URL** unless one is separately verified and documented in the report or evidence files.
