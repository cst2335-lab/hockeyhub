# GoGoHockey

Ottawa youth ice hockey community platform built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Cursor Cloud specific instructions

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| Next.js dev server | `npm run dev` | Serves on `http://localhost:3000`, redirects to `/en` by default |

### Environment variables

A `.env.local` file is required with at minimum:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

Without real Supabase credentials, the app UI renders but data-dependent pages will fail gracefully. Stripe, Resend, and Sentry are optional and degrade gracefully if not configured.

### Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Tests | `npm run test` (vitest) |
| Build | `npm run build` |

### Gotchas

- **Lint has a pre-existing error**: `react-hooks/rules-of-hooks` in `app/[locale]/(dashboard)/dashboard/page.tsx` (conditional `useMemo`). This is a codebase issue, not an environment problem.
- **Sentry warnings**: The dev server emits Sentry warnings about `onRouterTransitionStart` and deprecated `sentry.client.config.ts`. These are non-blocking and can be ignored.
- **`next lint` deprecation**: Next.js 15.5+ deprecates `next lint` in favor of the ESLint CLI directly. The `npm run lint` script still works.
- **Protected routes**: Pages like `/en/rinks`, `/en/games`, `/en/dashboard` require authentication and will redirect to login without a valid Supabase session.
- **Package manager**: Uses npm (lockfile: `package-lock.json`).
