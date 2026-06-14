# GCSAR Platform

Next.js 15 (App Router) + TypeScript + Tailwind + Supabase digital platform for the General Commission for Scientific Agricultural Research (GCSAR).

## Quick start

```powershell
# 1. Install
npm install

# 2. Set up env
Copy-Item .env.local.example .env.local

# 3. Run
npm run dev
```

The site is served at <http://localhost:3000>. The default locale is Arabic (`/ar`) with full RTL support; English (`/en`) is LTR.

## Data sources

The app reads all content through `src/lib/data/repository.ts`. The active source is chosen at startup by `NEXT_PUBLIC_DATA_SOURCE`:

| Value      | Behavior                                       |
| ---------- | ---------------------------------------------- |
| `mock`     | (default) reads in-memory fixtures             |
| `supabase` | reads live data from your Supabase project     |

Switching sources requires only an env change — no code changes.

## Stack

- **Next.js 15** (App Router, SSG + ISR, server components)
- **React 19**
- **TypeScript 5** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS 3** + custom design system
- **Supabase**: PostgreSQL + Auth + Storage (no Firebase)
- **i18n**: AR/EN, RTL/LTR, dictionaries in `src/lib/i18n/dictionaries`
- **Accessibility**: font-size scale, high-contrast, reduce-motion, TTS, skip-to-content

## Project structure

```
.
├── docs/                     # Architecture documentation
├── middleware.ts             # Locale routing (cookie + Accept-Language)
├── public/logos/             # Placeholder GCSAR + Syria emblem
├── src/
│   ├── app/
│   │   ├── [locale]/         # All public pages live under [locale]
│   │   │   ├── about/
│   │   │   ├── admin/        # Auth-gated admin landing
│   │   │   ├── contact/      # Contact form + API route
│   │   │   ├── documents/
│   │   │   ├── gallery/
│   │   │   ├── login/
│   │   │   ├── news/[slug]
│   │   │   ├── research/
│   │   │   └── staff/
│   │   ├── api/contact/      # Spam-hardened contact endpoint
│   │   └── layout.tsx
│   ├── components/
│   │   ├── home/             # Home page sections
│   │   ├── layout/           # Header, Footer, A11y menu, language switcher
│   │   └── ui/               # Shared UI primitives
│   ├── lib/
│   │   ├── auth/             # getSession (role-aware)
│   │   ├── data/             # Repository pattern (mock + Supabase impls)
│   │   ├── i18n/             # Dictionaries + getDictionary
│   │   ├── supabase/         # Client/server/middleware Supabase helpers
│   │   └── utils.ts
│   └── styles/
└── supabase/
    ├── README.md
    └── migrations/           # SQL: schema, RLS, storage, seed
```

## Connecting Supabase (later)

See [`supabase/README.md`](supabase/README.md). Summary:

1. Create a Supabase project.
2. Run the four SQL migrations in order through the SQL editor (or `supabase db push`).
3. Copy your project URL + anon key into `.env.local`.
4. Set `NEXT_PUBLIC_DATA_SOURCE=supabase`.
5. Sign up the first user through the app, then promote them to `super_admin` via SQL.

## Production hardening checklist

- [ ] Replace placeholder logos in `public/logos/` with official assets.
- [ ] Run the four SQL migrations against a real Supabase project.
- [ ] Add `Content-Security-Policy` header to `next.config.mjs` once external domains are finalized.
- [ ] Wire `refreshSession()` from `src/lib/supabase/middleware.ts` into `middleware.ts`.
- [ ] Add rate-limiting to `/api/contact` (Upstash or Vercel KV).
- [ ] Enable Supabase audit-log inserts on admin mutations.
- [ ] Configure a production WAF / DDoS layer at the edge.

## License

Government / institutional use. All content rights reserved to GCSAR.
