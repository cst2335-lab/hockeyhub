# GoGoHockey

Ottawa youth ice hockey community platform — find and post games, browse rinks, start ice bookings, and manage a player profile.

**Course:** CST8319 Software Development Project — **Assignment 3** (initial working prototype)  
**GitHub:** [github.com/cst2335-lab/hockeyhub](https://github.com/cst2335-lab/hockeyhub)  
**Package name:** `gogohockey` (v2.0.0)

This README is written for instructors reviewing Assignment 3. Assignment 3 demonstrates a **runnable, evidence-backed prototype subset** of a long-running codebase. It is **not** a claim that the full product vision is complete.

---

## Project overview

GoGoHockey helps Ottawa-area players, parents, and clubs:

- sign in and manage a hockey profile;
- use a personal dashboard;
- browse and post game invitations;
- browse Ottawa ice rinks;
- open a booking form (checkout route exists; **paid Stripe E2E is not claimed for Assignment 3**);
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
| Payments (partial) | Stripe Checkout + webhook code (E2E payment **not** claimed for A3) |
| Unit tests | Vitest |

---

## How to run locally

**Prerequisites:** Node.js 18+ (Demo 3 checklist used Node `v24.6.0` / npm `11.5.1`), npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/en` by default.

Without real Supabase credentials, the UI can still render, but data-dependent pages may fail or show empty/error states. See [AGENTS.md](./AGENTS.md) for developer conventions.

---

## Environment variables

Create a `.env.local` file in the project root (gitignored). Required for a meaningful Demo 3 walkthrough:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `SUPABASE_SERVICE_KEY` | For server/admin scripts | Service role key (some docs may say `SUPABASE_SERVICE_ROLE_KEY` — map to `SUPABASE_SERVICE_KEY`) |
| `STRIPE_SECRET_KEY` | Optional for A3 core demo | Stripe secret (booking checkout) |
| `STRIPE_WEBHOOK_SECRET` | Optional for A3 core demo | Stripe webhook signature (`whsec_…`) |

Stripe, Resend, and Sentry degrade gracefully if unset. **Do not commit secrets.** Deployment variable lists: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## Assignment 3 prototype scope

### In scope for Demo 3 (implemented / safe to show)

- Project structure with locale routes (`/en`, `/fr`)
- Login, register, logout (Supabase Auth)
- Profile view (and update via API)
- Dashboard (metrics / games / bookings sections when Supabase is configured)
- Games: list, create, detail, express interest
- Rinks: browse with search / filter / sort
- Booking **form** and create-checkout API route (pricing UI)
- Notifications **page UI** (list / read / delete)
- Documented API routes with Zod validation on main write paths
- Unit tests (Vitest) and Assignment 3 evidence docs

### Partially supported (show carefully)

- **Booking → Stripe:** form and checkout route exist; full paid confirmation depends on Stripe env + webhook. Assignment 3 does **not** claim end-to-end payment completion.
- **Notifications:** UI works; automatic creation from business events is incomplete.
- **Page protection:** unauthenticated users are redirected from the dashboard layout (client-side); middleware does not fully enforce auth on all pages.

### Out of scope / not claimed for Assignment 3

- Complete Stripe payment workflow as “done”
- User-to-user messaging
- Game matching / `game_matches`
- Host accept-interest / contact-reveal loop as a finished product flow
- Formal user / stakeholder testing
- Production or preview deployment URL (unless separately verified)
- Full RBAC enforcement
- Live Supabase RLS verification on the remote project
- Browser E2E automated tests (Playwright/Cypress)

Details: [docs/ASSIGNMENT_3_PROGRESS.md](./docs/ASSIGNMENT_3_PROGRESS.md) · [docs/DEMO_3_KNOWN_LIMITATIONS.md](./docs/DEMO_3_KNOWN_LIMITATIONS.md)

---

## Testing

```bash
npm run test
```

Runs Vitest unit tests under `__tests__/`. Demo 3 checklist re-run (2026-07-26): **18 files, 90/90 passed**.

Unit tests are **not** a substitute for Stripe E2E payment verification or browser E2E coverage.

Manual Demo 3 path results: [docs/DEMO_3_TESTING_CHECKLIST.md](./docs/DEMO_3_TESTING_CHECKLIST.md).

---

## Known limitations

Honest limitations for Assignment 3 (do not overclaim in the report or video):

- Stripe Checkout E2E (Checkout → webhook → booking `confirmed`) was **not** verified for Demo 3.
- Messaging and game matching are **not implemented**.
- Host accept-interest and auto-created notifications are incomplete.
- Full RBAC and live RLS on remote Supabase are **not verified** as complete.
- No production deployment URL is claimed from this repository alone.
- No formal user-testing artifact is claimed.
- No Playwright/Cypress E2E suite in the repo.

Full list and safe wording: [docs/DEMO_3_KNOWN_LIMITATIONS.md](./docs/DEMO_3_KNOWN_LIMITATIONS.md).

---

## Assignment 4 next steps

1. Verify Stripe test-mode payment end-to-end (or document payment as explicitly partial with justification).
2. Complete host accept-interest + auto notifications on key events.
3. Confirm RLS on Supabase; harden protected routes (middleware / server-side).
4. Add minimal E2E smoke coverage; finalize deployment evidence if a live URL is available.

Scope split: [docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md).

---

## Assignment 3 evidence docs

| Document | Purpose |
|----------|---------|
| [docs/ASSIGNMENT_3_CODE_PACKAGE_NOTES.md](./docs/ASSIGNMENT_3_CODE_PACKAGE_NOTES.md) | Code package / ZIP packaging notes |
| [docs/ASSIGNMENT_3_VERSION_CONTROL.md](./docs/ASSIGNMENT_3_VERSION_CONTROL.md) | GitHub branch / commit evidence pointer |
| [docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md](./docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md) | A3 / A4 scope analysis (source of truth) |
| [docs/ASSIGNMENT_3_PROGRESS.md](./docs/ASSIGNMENT_3_PROGRESS.md) | Assignment 3 progress narrative |
| [docs/DEMO_3_TESTING_CHECKLIST.md](./docs/DEMO_3_TESTING_CHECKLIST.md) | Demo 3 testing checklist with results |
| [docs/DEMO_3_KNOWN_LIMITATIONS.md](./docs/DEMO_3_KNOWN_LIMITATIONS.md) | Known limitations / anti-overclaiming |
| [docs/DEMO_3_VIDEO_WALKTHROUGH.md](./docs/DEMO_3_VIDEO_WALKTHROUGH.md) | Suggested Demo 3 video script |

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

Architecture details: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

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

Vercel is the recommended host. Required env vars for a real deploy include Supabase URL, anon key, and service key. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**Assignment 3 does not claim a live production/preview URL** unless one is separately verified and documented.
