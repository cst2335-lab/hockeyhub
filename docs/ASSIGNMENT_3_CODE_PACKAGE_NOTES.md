# GoGoHockey – Assignment 3 Prototype Code Package

**Course:** CST8319 Software Development Project — Assignment 3 (Project Demo 3)  
**Package title:** GoGoHockey – Assignment 3 Prototype Code Package  
**Date packaged:** 2026-08-02  
**Git branch:** `main`  
**Base commit:** `f4a638d` (`f4a638d96acb6c10993f3b6f14d1ade06207d855`)  
**GitHub:** https://github.com/cst2335-lab/hockeyhub  

**Packaging note on version identity:** This ZIP was produced from the local working tree on 2026-08-02 while `main` pointed at `f4a638d`, and **also includes Assignment 3 packaging updates** prepared for submission (`docs/ASSIGNMENT_3_CODE_PACKAGE_NOTES.md`, `docs/ASSIGNMENT_3_VERSION_CONTROL.md`, and README wording polish for Assignment 3). Those packaging files may not yet appear on the remote commit until they are pushed. Use GitHub history at the URL above for prior commit evidence; use this ZIP for the instructor-facing prototype code package.

---

## Pre-package command results (2026-08-02)

| Command | Result | Notes |
|---------|--------|-------|
| `npm install` | Pass | Dependencies up to date (exit 0). `npm audit` reports vulnerabilities in the dependency tree; not treated as a packaging blocker. |
| `npm run test` | Pass | Vitest: **18 files, 90/90 tests passed**. |
| `npm run lint` | Pass | `next lint`: no ESLint warnings or errors (exit 0). Deprecation notice: `next lint` will be removed in Next.js 16. |
| `npm run build` | Pass | `next build` completed successfully (exit 0). |

---

## What this ZIP contains

A single top-level folder `GoGoHockey_Assignment3_Group12_Code_Package/` with the runnable GoGoHockey prototype source tree, including:

- Application source: `app/`, `components/`, `lib/`, `messages/`, `public/`
- API and scripts: `app/api/`, `scripts/`, `scripts/sql/`
- Documentation: `docs/` (Assignment 3 evidence, architecture, API, deployment)
- Unit tests: `__tests__/`
- Project config: `package.json`, `package-lock.json`, `tsconfig.json`, Next/Tailwind/PostCSS configs, `README.md`
- Packaging / version-control notes: this file and `docs/ASSIGNMENT_3_VERSION_CONTROL.md`

### Intentionally excluded

- `node_modules/`, `.next/`, `.vercel/`, `coverage/`, Playwright/test-result/dist build outputs
- `.env`, `.env.local`, and other secret-bearing env files
- Supabase service keys and Stripe secret keys
- Local OS clutter (e.g. `.DS_Store`) and editor cache folders
- Full `.git/` directory (history is referenced via GitHub + commit hash instead)

---

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

Create a local `.env.local` with at least `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for data-backed pages. See `README.md`.

---

## How to test

```bash
npm run test
```

Runs Vitest unit tests. Manual Demo 3 path results: `docs/DEMO_3_TESTING_CHECKLIST.md`.

---

## Features included for Assignment 3 (implemented or partially supported)

| Area | Status for A3 |
|------|----------------|
| Localized Next.js app (`en` / `fr`) | Implemented |
| Supabase authentication (login / register / logout) | Implemented |
| Dashboard | Implemented |
| Profile view / update support | Implemented |
| Games list / detail / create (interest where implemented) | Implemented |
| Rinks browse / search / filter / sort | Implemented |
| Booking form and create-checkout route | **Partially supported** (form + route; Stripe E2E not claimed) |
| Notifications UI | Implemented (UI; auto-create incomplete) |
| API routes and Zod validation | Implemented |
| Documentation and Demo 3 testing checklist | Included |

---

## Features NOT claimed complete in Assignment 3

Reserved for Assignment 4 or explicitly out of A3 claims:

- Stripe end-to-end payment confirmation (Checkout → webhook → booking `confirmed`)
- Full production deployment evidence / live URL claim
- Direct messaging
- Full game matching
- Complete host accept-interest / contact reveal workflow
- Full RBAC verification
- Live Supabase RLS verification on the remote project
- Browser E2E automated test suite (Playwright/Cypress)

See `docs/DEMO_3_KNOWN_LIMITATIONS.md` and `docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md`.

---

## Assignment 4 next steps

1. Stripe test-mode E2E verification  
2. Payment webhook confirmation and booking status finalization  
3. Auto notifications on key business events  
4. Host accept-interest / contact reveal  
5. Route protection and RLS hardening  
6. Final diagrams and release documentation  
7. Final deployment evidence if a live URL is available  

---

## Related evidence docs in this package

- `README.md` — instructor-oriented overview and run instructions  
- `docs/ASSIGNMENT_3_PROGRESS.md`  
- `docs/ASSIGNMENT_3_4_SCOPE_ANALYSIS.md`  
- `docs/DEMO_3_TESTING_CHECKLIST.md`  
- `docs/DEMO_3_KNOWN_LIMITATIONS.md`  
- `docs/DEMO_3_VIDEO_WALKTHROUGH.md`  
- `docs/ASSIGNMENT_3_VERSION_CONTROL.md`  

---

*Packaging language uses “prototype,” “Assignment 3 scope,” “implemented or partially supported,” and “reserved for Assignment 4.”*
