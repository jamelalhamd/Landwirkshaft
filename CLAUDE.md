# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint via next lint
npm run typecheck  # tsc --noEmit (no test suite exists yet)
npm run format     # Prettier over ts/tsx/md/json/css
```

There are no automated tests. Type-checking (`npm run typecheck`) is the primary correctness gate.

## Architecture

### Routing

All public pages live under `src/app/[locale]/` — the locale segment is always `ar` or `en`. `src/app/page.tsx` redirects `/` to the default locale (`ar`). The middleware at `middleware.ts` handles locale detection (cookie → `Accept-Language` header → default `ar`) and redirects non-localised paths.

**Important:** Middleware runs on Edge Runtime. Do not import Node.js-only packages there. Use plain `Request`/`Headers` APIs instead of packages like `negotiator`.

### Data layer

All content reads go through `src/lib/data/repository.ts` — never import Supabase directly from a page. The active implementation is chosen at startup by the `NEXT_PUBLIC_DATA_SOURCE` env var:

- `mock` (default) — in-memory fixtures from `src/lib/data/mock-repository.ts`
- `supabase` — live DB via `src/lib/data/supabase-repository.ts`

Pages are identical regardless of source; switching is a single env-var change.

### Auth

`src/lib/auth/getSession.ts` is the sole server-side auth entry point. It returns `SessionInfo` with a `roleAtLeast(role)` helper. When `NEXT_PUBLIC_DATA_SOURCE !== 'supabase'` it always returns an unauthenticated session.

Roles in ascending order: `viewer → editor → admin → super_admin`. Roles are enforced both at the app layer (route guards using `getSession`) and at the DB layer (RLS policies in `supabase/migrations/002_rls_policies.sql`).

### i18n

- Route: `/[locale]/...` where locale is `ar` or `en`
- Strings: `src/lib/i18n/dictionaries/{ar,en}.json` loaded server-side via `getDictionary(locale)` — the `ar.json` type is the authoritative shape for both files
- DB content: every translatable column is split into `*_ar` / `*_en` fields (e.g. `title_ar`, `title_en`)
- Direction: `<html lang dir>` is set in `src/app/[locale]/layout.tsx` from `localeMeta[locale]`; use Tailwind's logical utilities (`start`/`end`, `ms-`/`me-`, `ps-`/`pe-`) so RTL flips automatically

### Rendering strategy

Pages use ISR by default. The revalidation period is set per-page via `export const revalidate = N`. Admin pages (`/[locale]/admin/**`) and login use dynamic SSR (no `revalidate` export). Do not add `revalidate` to auth-gated pages.

### Supabase helpers

| File | Usage |
|---|---|
| `src/lib/supabase/server.ts` | Server components and API routes (`import 'server-only'`) |
| `src/lib/supabase/client.ts` | Client components only |
| `src/lib/supabase/middleware.ts` | Session refresh inside middleware |

Never use the service role key outside server-only files.

### Design system

Tailwind is extended in `tailwind.config.ts` with:
- `primary-*` (institutional blue, brand at `primary-700: #1a4e9c`) and `secondary-*` (agricultural green, brand at `secondary-600: #16a34a`)
- `surface`, `ink`, `border`, `ring` semantic tokens backed by CSS variables for dark mode
- `fluid-*` font size scale for responsive/accessible sizing
- `shadow-gov`, `shadow-gov-md`, `shadow-gov-lg` for government-style elevation
- `cn()` utility in `src/lib/utils.ts` merges Tailwind classes (`clsx` + `tailwind-merge`)

### Accessibility

`AccessibilityProvider` (client component wrapping `[locale]/layout.tsx`) persists user preferences to `localStorage` and applies classes to `<html>`: `a11y-font-{lg|xl|xxl}`, `a11y-contrast`, `a11y-reduce-motion`, `dark`. TTS uses `window.speechSynthesis` keyed to the active `<html lang>`.

## Environment variables

```bash
NEXT_PUBLIC_DATA_SOURCE=mock          # or "supabase"
NEXT_PUBLIC_SUPABASE_URL=             # required when source=supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # required when source=supabase
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy `.env.local.example` to `.env.local` to get started.

## Supabase migrations

When connecting a real Supabase project, apply migrations in order via `supabase db push` or the SQL editor:

1. `001_init_schema.sql`
2. `002_rls_policies.sql`
3. `003_storage_buckets.sql`
4. `004_seed.sql`

After the first sign-up, promote the user to `super_admin`:
```sql
update public.profiles set role = 'super_admin' where email = 'you@example.com';
```

Types in `src/lib/supabase/types.ts` are hand-authored to mirror the schema. Once connected, regenerate with:
```bash
npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
```

## Content editorial workflow

`draft → review → published → archived` — enforced by the `content_status` enum and RLS. Editors cannot transition to `published`; only `admin` and above can.

The `public.audit_logs` table is append-only (no UPDATE/DELETE RLS). Every admin mutation should insert an audit log row.
