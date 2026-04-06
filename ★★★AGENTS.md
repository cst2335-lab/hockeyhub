# ★★★ AGENTS — GoGoHockey

Ottawa youth ice hockey community platform built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Cursor Cloud specific instructions

### Preferred working mode (lightweight / no-start)

- For discovery tasks (for example, "hello world" onboarding checks), inspect markdown/docs first and summarize findings before writing code.
- Do **not** start long-running services by default (including `npm run dev`) unless the user explicitly asks to run them.

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| Next.js dev server | `npm run dev` | Serves on `http://localhost:3000`, redirects to `/en` by default |

### Environment variables

A `.env.local` file must be created from injected secrets before starting the dev server. Required secrets:

| Secret name | Required | Purpose |
|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public/anon key |
| `SUPABASE_SERVICE_KEY` | Yes (server ops) | Supabase service_role key. Note: user may provide as `SUPABASE_SERVICE_ROLE_KEY` — map it to `SUPABASE_SERVICE_KEY` in `.env.local` |
| `STRIPE_SECRET_KEY` | Optional | Stripe payment processing |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature (starts with `whsec_`) |
| `TEST_LOGIN_USERNAME` | Optional | Test account email for automated login |
| `TEST_LOGIN_PASSWORD` | Optional | Test account password |

Without real Supabase credentials, the app UI renders but data-dependent pages will fail gracefully. Stripe, Resend, and Sentry are optional and degrade gracefully if not configured.

To create `.env.local` from injected env vars, write a shell heredoc mapping each secret. The file is gitignored.

### Commands

See `package.json` scripts. Key commands:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Tests | `npm run test` (vitest, 90 tests in 18 files) |
| Build | `npm run build` |
| Import rinks from CSV | `npm run db:import-rinks -- --apply` (needs `SUPABASE_SERVICE_KEY`; see `docs/★★★RENEW_RINKS.md`) |

### Gotchas

- **Task status / 待办**：以 `docs/NEXT_PHASE_TASKS.md` **§三（进行中）、§四（下阶段）** 为唯一权威。较旧的 `CHANGELOG_IMPROVEMENTS` §十二「未完成」等为历史快照；若与 NEXT_PHASE 冲突，以 NEXT_PHASE 为准（见 CHANGELOG §二十一）。
- **Sentry setup location**: Client init lives in `instrumentation-client.ts` (with `onRouterTransitionStart` export). Do not reintroduce deprecated `sentry.client.config.ts`.
- **`next lint` deprecation**: Next.js 15.5+ deprecates `next lint` in favor of the ESLint CLI directly. The `npm run lint` script still works but exits with code 1 due to the deprecation notice.
- **Protected routes**: Pages like `/en/rinks`, `/en/games`, `/en/dashboard` require authentication and will redirect to `/en/login` without a valid Supabase session.
- **Package manager**: Uses npm (lockfile: `package-lock.json`).
- **First compile is slow**: The initial page load after `npm run dev` takes ~15s due to webpack compilation of ~5000 modules. Subsequent navigations are fast.
- **Supabase `profiles` table**: May return 400 errors if the table schema doesn't match the query. This is a database-side issue, not a code problem.
- **Dark mode / theming**: Cards and forms should use theme tokens (`bg-card`, `text-card-foreground`, `border-border`) rather than fixed `bg-white` or `text-gray-*` on themed surfaces. In `.dark`, `--surface` matches `--card` so `bg-surface` stays readable. See `docs/★★★THEMING.md`.
