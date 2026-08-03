# Assignment 3 and 4 Scope Analysis – GoGoHockey

**GitHub:** https://github.com/cst2335-lab/hockeyhub  
**Branch reviewed:** `main` @ `edd214e`  
**Analysis date:** 2026-07-26  
**Method:** Read-only review of code, docs, scripts, SQL, and tests. No live Supabase / Stripe / Vercel verification in this pass.  
**Package name:** `gogohockey` (v2.0.0).

---

## 1. Purpose of This Analysis

This document supports **CST8319 Software Development Project Assignment 3 and Assignment 4** planning.

The GoGoHockey codebase is already a long-running product prototype (Next.js 15 App Router, Supabase, Stripe Checkout, i18n, Vitest). Assignment 3 and 4 must therefore:

- reflect the **real current state**, not invent a greenfield prototype;
- **not** claim that every existing advanced feature belongs to Assignment 3;
- map **demonstrable, evidence-backed** work into Demo 3 / Report 3;
- reserve **finalization, verification gaps, and incomplete product loops** for Assignment 4;
- avoid overclaiming (especially payment, messaging, matching, production deployment, and formal user testing).

This file is **analysis only**. It does not rewrite README, invent commit history, or modify application code.

---

## 2. Current Project Reality

Based on repository evidence (`app/`, `components/`, `lib/`, `app/api/`, `scripts/sql/`, `docs/`, `__tests__/`, `package.json`, `README.md`, `AGENTS.md`):

### Implemented and working (strong code evidence)

| Area | Evidence |
|------|----------|
| Next.js 15 + TypeScript + Tailwind + next-intl (en/fr) | `package.json`, `app/[locale]/`, `messages/` |
| Supabase Auth login / register / logout / cookie session | `LoginClient.tsx`, `RegisterClient.tsx`, `lib/supabase/*`, `lib/hooks/useAuth.ts` |
| Profile view / update via API + Zod | `profile/page.tsx`, `app/api/profile/update/route.ts`, `lib/validations/profile.ts` |
| Dashboard with live counts, posted games, bookings | `dashboard/page.tsx`, React Query + Supabase |
| Rink listing (search / filter / sort) from Supabase | `rinks/page.tsx`, `lib/queries/rinks.ts` |
| Booking form → create pending booking → Stripe Checkout redirect | `book/[rinkId]/page.tsx`, `app/api/bookings/create-checkout/route.ts` |
| Stripe webhook updates booking to `confirmed` (when env configured) | `app/api/webhooks/stripe/route.ts`, `docs/STRIPE_BOOKING_SETUP.md` |
| Game invitation list / create / edit / delete / interest / rate | `games/*`, `app/api/games/*` |
| Notifications UI (list, mark read, delete) + Realtime subscription | `notifications/page.tsx`, `useNotifications.ts` |
| Clubs list + create | `clubs/page.tsx`, `app/api/clubs/create/route.ts` |
| Rink manager guard for manage-rink | `layout.tsx`, `manage-rink/page.tsx`, `docs/ROLES_AND_ROUTE_GUARDS.md` |
| Unit tests | `__tests__/` — previously verified **90/90** Vitest pass |
| Docs architecture / API / deployment / roles / Stripe / rinks | `docs/*`, `scripts/sql/` |

### Implemented but not verified in this pass (code exists; live success unproven)

| Area | Why “not verified” |
|------|---------------------|
| Full Stripe test payment end-to-end | Needs `STRIPE_*` keys, webhook endpoint, and a real test charge |
| RLS actually enabled on production Supabase | Policies exist in `scripts/sql/supabase-rls.sql`; live DB state unknown |
| Booking conflict DB `EXCLUDE` constraint applied | Present in SQL script; not confirmed on remote DB |
| Resend confirmation email | Optional; needs `RESEND_API_KEY` |
| Vercel deployment | `vercel.json` + docs; **no production/preview URL in repo** |
| Auth protection of pages | Client layout redirects exist; **middleware does not enforce auth** |

### Documented or planned only / incomplete product loops

| Area | Evidence |
|------|----------|
| Auto-created notifications on game interest / booking | UI types exist; production inserts only in `app/api/notifications/test/route.ts` |
| Host accept interest / contact reveal loop | UI reads `status === 'accepted'`; **no host accept API** |
| `game_matches` table workflow | **No code references** |
| User-to-user messaging | **No `messages` table usage** |
| `payments` table writes | RLS in SQL; **no app insert/select** |
| Admin / club_admin / super_admin enforcement | Documented in roles doc; **not enforced in app** |
| E2E tests | **None** (no Playwright/Cypress) |
| Assignment 1 report in repo | **Not found** (`docs/CST8319/` empty) |
| `.env.example` | Referenced in `DEPLOYMENT.md`; **file not present** |

### Incomplete or risky features

1. **Payment integrity:** duplicate webhook routes (`/api/webhooks/stripe` and `/api/stripe/webhook`); failed payments only logged; no `payments` table sync.  
2. **Game social loop incomplete:** interest without host accept → matching not real.  
3. **Security verification gap:** RLS SQL in repo ≠ confirmed live enforcement.  
4. **README gap for Demo 3:** minimal run instructions; no Assignment 3 scope, limitations, or test checklist.  
5. **Commit authorship:** recent history shows mainly `cst2335-lab` / Cursor Agent — do not invent multi-member iterative history from git alone.

---

## 3. Assignment 1 Requirement Alignment

**Note:** The original Assignment 1 report is **not present** in this repository (`docs/CST8319/` exists but contains no files). This section is inferred from current product docs (`docs/ARCHITECTURE.md`, `README.md`, `docs/ROADMAP.md`, `docs/ROLES_AND_ROUTE_GUARDS.md`) and **must be cross-checked** against the team’s submitted Assignment 1 PDF/Word document.

| Assignment 1 Area | Original / Expected Intent | Current Project Evidence | Status | Notes |
|---|---|---|---|---|
| Project goal | Ottawa youth hockey community: find/post games, book ice, clubs | `docs/ARCHITECTURE.md`, `README.md` | Strongly supported | Positioning consistent across docs |
| Tech stack | Web app; modern JS stack; cloud backend | Next.js 15, TypeScript, Tailwind, Supabase, Stripe | Strongly supported | Matches long-running stack |
| Auth / accounts | Users can register and sign in | Login/register/logout + profiles | Strongly supported | Client-side page guards; not middleware |
| Profile | User hockey profile | Profile view/edit + API | Strongly supported | Avatar upload not found |
| Dashboard | Personal hub | Dashboard with games/bookings/metrics | Strongly supported | Messages not present |
| Rinks | Browse Ottawa rinks | Rinks list + Supabase data | Strongly supported | No dedicated rink detail page |
| Booking | Reserve ice time | Book form + bookings table | Partially supported | Full paid flow needs live Stripe verification |
| Payments | Online payment | Stripe Checkout + webhook code | Partially supported | Do not claim “complete” until test payment verified |
| Game invitations | Post / browse / interest | Games CRUD + interest API | Strongly supported | Host accept incomplete |
| Matching | Confirm matches | Status field / roadmap only | Planned / documented only | No `game_matches` usage |
| Messaging | User messaging | — | Not enough evidence | No messaging module |
| Notifications | Alerts | UI + Realtime; auto-create missing | Partially supported | Test API only for inserts |
| Clubs / roles | Clubs + managers | Clubs create; rink_managers guard | Partially supported | Admin roles documented only |
| Dependencies | External services | Supabase, Stripe, Resend, Sentry, Vercel | Strongly supported | Documented in AGENTS / DEPLOYMENT |
| Timeline / backlog | Phased delivery | `TASKS.md`, `ROADMAP.md`, `CHANGELOG.md` | Strongly supported | V2 P0–P2 marked done in docs |
| Team process | Multi-member collaboration | Feature branches + PR #8 mention | Partially supported | Recent authors not clearly showing all members |

---

## 4. Assignment 2 Design Alignment

Assignment 2 design artifacts (UML, ERD, formal use-case diagrams) are **not stored as dedicated design files** in this repo. Alignment is judged against **architecture docs + implemented structure**. Cross-check with the submitted Assignment 2 document.

| Assignment 2 Design Element | Current Code / Documentation Evidence | Alignment Status | Notes / Risks |
|---|---|---|---|
| System architecture | `docs/ARCHITECTURE.md`: App Router + API routes + Supabase + Stripe | Aligned | Canonical UI under `app/[locale]/` |
| Use-case / user flows | Auth, games, rinks, book, dashboard pages exist | Mostly aligned | Messaging / matching flows not implemented |
| Component structure | `components/layout|features|ui|auth|notifications|rinks` | Aligned | Feature-oriented, not formal class diagrams in repo |
| ERD / database design | Tables used in code + `scripts/sql/supabase-rls.sql` | Mostly aligned | Live schema unconfirmed; unused tables (`messages`, `game_matches`, `payments` writes) |
| Services architecture | `app/api/*` + `requireAuth` + Zod | Aligned | Main write paths server-side |
| External services | Supabase Auth/DB, Stripe Checkout/Webhook, Resend optional, Sentry optional | Mostly aligned | Env-dependent; Stripe/Resend degrade if unset |
| AuthN/AuthZ design | Roles doc + rink_managers + RLS SQL | Needs clarification | Page auth is client-side; full RBAC matrix not enforced |
| Payment design | `STRIPE_BOOKING_SETUP.md` + checkout/webhook | Mostly aligned | No `payments` table integration; duplicate webhook path |
| Security design | Sanitize, RLS scripts, debug route block | Mostly aligned | Production RLS application not verified |
| i18n / theming | next-intl; `THEMING.md` | Aligned | en/fr only |
| Design changes since A2 | Docs restructure; legacy routes removed; SQL moved to `scripts/sql/` | Changed from design | Expect to explain evolution in A3/A4 reports |

---

## 5. Feature Inventory by Evidence Level

| Feature / Module | Evidence Found | Evidence Type | Verified? | Suggested Assignment Placement |
|---|---|---|---|---|
| Homepage / marketing shell | `app/[locale]/page.tsx`, hero components | working route/page | Code yes; live UI needs demo | Assignment 3 prototype demonstration |
| Login / register / logout | Auth clients + layout signOut | working route/page + API | Code yes | Assignment 3 prototype demonstration |
| Session / cookies | `@supabase/ssr` | config + lib | Code yes | Assignment 3 documentation only |
| Profile view/edit | profile pages + `/api/profile/*` | working route/page + API | Code yes | Assignment 3 prototype demonstration |
| Dashboard | dashboard page + queries | working route/page | Code yes | Assignment 3 prototype demonstration |
| Rinks browse | rinks page + query | working route/page | Code yes | Assignment 3 prototype demonstration |
| Book rink form (pre-pay) | book page + create-checkout | working route/page + API | Code yes; payment live **no** | Assignment 3 prototype demonstration (form + redirect **if** Stripe configured; else show form + known limitation) |
| Stripe paid confirmation | webhook + booking status | API route + documentation | Not verified live | Assignment 4 finalization **or** A3 only if live test recorded |
| Cancel / refund | cancel API + policies | API + lib + docs | Not verified live | Assignment 4 finalization |
| Games browse/create/detail | games routes + APIs | working route/page + API | Code yes | Assignment 3 prototype demonstration |
| Game interest express/remove | interest API | API route | Code yes | Assignment 3 prototype demonstration |
| Host accept interest | status read only | incomplete code path | No | Assignment 4 finalization |
| Game matching (`game_matches`) | — | unknown / absent | No | Assignment 4 stretch / future work |
| Ratings | rate API + UI | API + component | Code yes | Assignment 3 documentation only (optional short demo) |
| Notifications UI | notifications page | working route/page | Code yes | Assignment 3 prototype demonstration |
| Auto notification create | test route only | API (debug) | No | Assignment 4 finalization |
| Clubs list/create | clubs pages + API | working route/page + API | Code yes | Assignment 3 documentation only (short) |
| Rink manager manage-rink | manage-rink + guards | working route/page | Needs manager account | Assignment 4 finalization / optional A3 if demo account exists |
| Messaging | — | unknown / absent | No | Do not mention unless verified |
| Admin / full RBAC | roles doc + SQL role column | documentation + SQL | No | Assignment 4 stretch / future work |
| Vitest unit tests | `__tests__/` | test/script | Yes (90 pass previously) | Assignment 3 documentation only / demo evidence |
| E2E tests | — | unknown / absent | No | Assignment 4 finalization |
| Vercel production | `vercel.json`, DEPLOYMENT.md | config + documentation | No URL | Assignment 4 finalization |
| README / setup | README + AGENTS | documentation | Partial | Assignment 3 documentation only (must improve before submit) |
| RLS / SQL scripts | `scripts/sql/` | Supabase table/script | Script yes; live no | Assignment 3 documentation only; verify in A4 |
| PWA / Sentry | providers + sentry configs | config only | Optional | Do not mention unless verified |

---

## 6. Recommended Assignment 3 Scope

Assignment 3 = **credible initial prototype demonstration** of the **already-built core**, not a claim that the product is finished.

### Features to demonstrate in Assignment 3 video

1. Project overview (GoGoHockey; Ottawa youth hockey).  
2. Local run: `npm install` → `npm run dev` → `/en`.  
3. Register or login → redirect to Dashboard.  
4. Profile view (and optionally edit one field).  
5. Browse Games → open a game detail → express interest (if logged in).  
6. Browse Rinks → search/filter → open Book page (date/time/hours UI).  
7. Dashboard: posted games / bookings / metrics.  
8. Notifications page UI (even if empty / test data).  
9. Brief mention of backend: Supabase tables + `app/api` (screenshot or folder walk).  
10. Run `npm run test` and show pass summary.  
11. Known limitations slide (Stripe live, matching, messaging, auto-notifications).  
12. Next steps for Assignment 4.

**Optional (only if pre-verified before filming):** Stripe test Checkout → confirmed booking on Dashboard.

### Features to describe in Assignment 3 report

- Architecture overview (`docs/ARCHITECTURE.md`).  
- Response to Assignment 2 feedback (structure cleanup, localized routes, Zod APIs, docs consolidation).  
- Tech stack and env vars (`AGENTS.md` / `DEPLOYMENT.md`).  
- Feature inventory with honest status (use §5 of this file).  
- Testing: Vitest unit suite.  
- GitHub: repo URL, branch `main`, representative commits (do not invent authorship).  
- Next steps toward Assignment 4.

### Features to avoid overclaiming in Assignment 3

- Full Stripe payment “complete” without recorded test payment.  
- Messaging, game matching, host accept-interest.  
- Automatic business notifications.  
- Full RBAC (admin / club_admin).  
- Production deployment URL (unless documented and working).  
- Formal stakeholder/user testing (unless real feedback exists).  
- That every ROADMAP item was delivered for A3.

### Evidence still needed before Assignment 3 submission

| Evidence | Why |
|----------|-----|
| Live Demo 3 recording checklist completed | Course requires prototype demo |
| Confirmed `.env.local` works for at least Auth + rinks/games reads | Data pages otherwise empty/fail |
| Screenshot or log of `npm run test` | Testing/debugging evidence |
| README updates (planned separately) | Setup, scope, limitations, next steps |
| Cross-check with Assignment 1 & 2 submissions | This analysis cannot replace those PDFs |
| Optional: one Stripe test payment video segment | Only if claiming payment in Demo 3 |

---

## 7. Recommended Assignment 4 Scope

Assignment 4 = **finalize, verify, polish, and close gaps** for the final demo and report.

### Finalize / polish / validate

| Item | Assignment 4 focus |
|------|--------------------|
| Stripe booking E2E | Test mode payment, webhook, confirmed status, cancel/refund demo |
| `payments` table sync (if required by design) | Or explicitly drop from scope with justification |
| Host accept interest + contact reveal | Close game social loop |
| Auto notifications on interest/accept/booking | Replace test-only inserts |
| Middleware or server-side auth for protected pages | Harden beyond client redirect |
| Consolidate duplicate Stripe webhook routes | Technical debt |
| Confirm RLS applied on Supabase | Security verification evidence |
| E2E smoke tests (even minimal Playwright) | Testing maturity |
| README final + deployment URL | Final documentation |
| Clubs edit / rink manager demo account | Role demo polish |
| Performance / empty states / i18n edge cases | Optimization |
| Lessons learned / project evolution | Final report narrative |

### Stretch / future work (mention as out of final scope if unfinished)

- Messaging module  
- `game_matches` / smart matching  
- Admin dashboard / full role matrix  
- Recurring bookings / advanced finance reports  

---

## 8. Prototype Demonstration Plan for Assignment 3

Recommended **video order** (based on real evidence):

1. **Project overview** — problem, users, tech stack; show the GoGoHockey product and GitHub repository.  
2. **Response to Assignment 2 feedback** — cite structure cleanup (`app/[locale]`, `scripts/sql/`, docs index); Zod server APIs; legacy route redirects.  
3. **Current prototype pages** — Home → Login → Dashboard → Games → Rinks → Book → Profile → Notifications.  
4. **Key implemented features** — auth, profile, games + interest, rinks browse, booking form, dashboard data.  
5. **Backend / database / service evidence** — Supabase project (Dashboard tables screenshot if available), `app/api` tree, `scripts/sql/supabase-rls.sql`, optional Stripe Dashboard (test mode).  
6. **README / run instructions** — show clone → install → env → `npm run dev` (after README is updated for A3).  
7. **GitHub commit history** — show recent real commits on `main` (e.g. docs structure, V2 P2, redirects); **do not fabricate** multi-author history.  
8. **Testing / debugging checklist** — `npm run test`; note console clean on happy path; list known issues.  
9. **Known limitations** — payment unverified / incomplete loops / no messaging / no E2E / no production URL.  
10. **Next steps for Assignment 4** — payment verification, interest accept, auto-notifications, auth hardening, deployment, E2E.

---

## 9. Testing and Debugging Evidence Needed

| Test Area | Command / Action | Expected Result | Current Evidence | Needed Before Submission |
|---|---|---|---|---|
| Dependency install | `npm install` | Completes without fatal errors | Lockfile present | Record success in Demo 3 / report |
| Local dev server | `npm run dev` | Serves localhost:3000 → `/en` | Documented in README/AGENTS | Film startup |
| Homepage load | Open `/en` | Hero / marketing loads | `app/[locale]/page.tsx` | Visual check + no blocking console errors |
| Main navigation | Navbar / bottom-nav | Links to Games, Clubs, Dashboard, Profile | `components/layout/*` | Click-through demo |
| Auth pages | `/en/login`, `/en/register` | Forms work; errors show | Auth clients | Login with test account |
| Protected pages | Visit `/en/dashboard` logged out | Redirect to login | Client layout guard | Confirm behaviour on film |
| Rinks page | `/en/rinks` | List from Supabase or graceful empty/error | Query code | Needs valid Supabase env |
| Games page | `/en/games` | List loads | Query code | Needs valid Supabase env |
| Book page | `/en/book/[rinkId]` | Form + cost UI | Book page | Demo without claiming payment if Stripe unset |
| API routes | Call or show create-checkout / games create | Auth required / Zod errors | `docs/API.md` | Optional Postman/screenshot |
| Env documentation | Check README/AGENTS/DEPLOYMENT | Vars listed | AGENTS + DEPLOYMENT | Add `.env.example` recommendation (A3 docs) |
| Unit tests | `npm run test` | 90 pass (previously) | Vitest suite | Re-run and capture output |
| Browser console | DevTools on main flows | No unexpected red errors | Not captured in repo | Manual check |
| Known issues | Document gaps | Honest limitations list | This analysis | Put in README / report |
| README accuracy | Follow README alone | New teammate can run | README currently thin | Update before A3 (separate task) |
| Stripe (optional A3) | Test Checkout | Booking confirmed | Code + STRIPE doc | Only if claiming payment |
| Production URL | Open Vercel URL | App loads | **Missing in repo** | A4 unless available now |

---

## 10. GitHub Commit History Risk

### Current observation

- Active branch: `main`, tracking `origin/main`.  
- Recent meaningful commits include docs/structure cleanup (`edd214e`), V2 P2 docs/SEO/XSS commits, legacy redirect PR `#8`.  
- History supports a **mature, iterative project**, not a last-minute empty repo.  
- Risk: recent author names do **not** clearly show all Assignment 1 team members; claiming “balanced multi-member weekly commits” from git alone is **unsafe**.

### Sufficiency for Assignment 3

| Criterion | Assessment |
|-----------|------------|
| Project has substantial prior commits | Supported |
| Feature-branch / PR workflow evidence | Partially supported (branches + PR #8) |
| Recent Assignment-3-specific documentation commits | **Not yet** — this analysis file is new and uncommitted |
| Evidence of ongoing testing/docs for Demo 3 | Needs new real commits |

### Recommended **real** commits (only after real file changes)

Safe message examples:

- `docs: add Assignment 3 and 4 scope analysis`
- `docs: update README for Assignment 3 setup instructions`
- `docs: add Demo 3 testing checklist`
- `docs: document prototype feedback and known issues`

**Do not** invent backdated commits or rewrite history.

---

## 11. README and Documentation Gaps

Current `README.md` covers: short overview, `npm install` / `npm run dev`, stack list, folder sketch, links to docs, partial env list.

### Likely insufficient for Assignment 3 without updates

Missing or weak relative to typical Demo 3 expectations:

| Gap | Recommendation (do not rewrite in this pass) |
|-----|-----------------------------------------------|
| Full env var table | Point clearly to AGENTS + include minimal `.env.example` later |
| “Features in Assignment 3 prototype” | Explicit in-scope / out-of-scope list |
| Known limitations | Stripe, matching, messaging, notifications auto-create, deployment |
| Testing / debugging summary | How to run `npm run test`; what was manually checked |
| Database / Supabase setup steps | Link RENEW_RINKS + RLS SQL apply steps |
| Assignment 4 next steps | Short bullet list |
| Production / preview URL | Add only if real |
| English section for graders | Consider bilingual or English README section if course requires English |

Related docs that already help (link from README later): `ARCHITECTURE.md`, `DEPLOYMENT.md`, `API.md`, `STRIPE_BOOKING_SETUP.md`, `ROLES_AND_ROUTE_GUARDS.md`, this analysis file.

---

## 12. Risks and Anti-Overclaiming Rules

**Do not claim in Assignment 3 report/video unless verified:**

1. Full booking + payment workflow is complete (unless Stripe test payment filmed).  
2. Payment records are stored in a `payments` table.  
3. Formal user / stakeholder testing was conducted (unless real feedback artifacts exist).  
4. Recent balanced multi-member commit activity (unless git authors support it).  
5. Full production deployment on Vercel (unless URL works and is documented).  
6. Messaging system exists.  
7. Game matching / `game_matches` is implemented.  
8. Host can accept interested players (code incomplete).  
9. Notifications are automatically generated by business events.  
10. Full RBAC (admin / club_admin / parent) is enforced.  
11. RLS is confirmed active on the live Supabase project.  
12. E2E test coverage exists.  
13. Every item in `ROADMAP.md` or `TASKS.md` “completed” list was delivered specifically for Assignment 3.

**Safe language patterns:**

- “Implemented in code and demonstrated locally…”  
- “Configured when environment variables are present…”  
- “Planned for Assignment 4…”  
- “Cannot be confirmed from the repository alone…”

---

## 13. Final Recommendations

### Priority 1 — Evidence required before Assignment 3 submission

1. Prepare Demo 3 script using §8 page walkthrough (auth → dashboard → games → rinks → book → profile).  
2. Ensure `.env.local` allows Auth + rinks/games data for filming.  
3. Re-run `npm run test` and keep a screenshot/log.  
4. Decide whether Stripe appears in Demo 3 (only if a test payment can be shown).  
5. Cross-check this analysis against Assignment 1 and Assignment 2 submissions.

### Priority 2 — Documentation updates (separate tasks; not done here)

1. Commit this analysis: `docs: add Assignment 3 and 4 scope analysis`.  
2. Update README for A3 setup, in-scope features, limitations, next steps.  
3. Add Demo 3 testing checklist / known issues note.  
4. Optionally add `.env.example` (no secrets).

### Priority 3 — Testing / debugging

1. Manual happy-path checklist from §9.  
2. Console check on main routes.  
3. Document failures honestly (empty data, Stripe unset, etc.).

### Priority 4 — Assignment 4 preparation

1. Stripe E2E + webhook proof.  
2. Host accept-interest + auto notifications.  
3. Auth hardening + RLS verification.  
4. Remove duplicate webhook debt; E2E smoke test.  
5. Final README + deployment URL + lessons learned.

---

## Appendix A — Key evidence paths (quick reference)

| Path | Role |
|------|------|
| `app/[locale]/` | Canonical UI |
| `app/api/` | Server APIs |
| `lib/supabase/`, `lib/validations/`, `lib/booking/`, `lib/stripe/` | Core services |
| `scripts/sql/supabase-rls.sql` | RLS + booking constraint SQL |
| `docs/ARCHITECTURE.md` | Architecture narrative |
| `docs/API.md`, `docs/API_ERROR_CODES.md` | API contract |
| `docs/STRIPE_BOOKING_SETUP.md` | Payment setup |
| `docs/ROLES_AND_ROUTE_GUARDS.md` | RBAC intent |
| `docs/TASKS.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md` | Status / backlog / history |
| `__tests__/` | Vitest suite |
| `README.md`, `AGENTS.md` | Run / env |

---

*End of analysis. No application code or other documentation files were modified in this pass.*
