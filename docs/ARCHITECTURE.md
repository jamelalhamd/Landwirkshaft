# Architecture

## Goals

- Government-grade security and auditability.
- Strict separation between **data source** (Supabase / mock) and **UI**.
- Multi-language **AR/EN** with proper RTL, not just translation.
- Accessibility: WCAG 2.2 AA target — font scaling, contrast, motion, TTS.
- Performant: SSG + ISR by default; SSR only where the page truly depends on the request.
- Zero Firebase. Supabase only.

## Rendering strategy

| Page                              | Strategy        | Why                                                |
| --------------------------------- | --------------- | -------------------------------------------------- |
| `/[locale]`                       | ISR (5 min)     | Stable content, frequent reads                     |
| `/[locale]/news`                  | ISR (2 min)     | Time-sensitive but cacheable                       |
| `/[locale]/news/[slug]`           | ISR (2 min)     | Same                                               |
| `/[locale]/documents`/`research`  | ISR (10 min)    | Slow-changing reference material                   |
| `/[locale]/staff`/`gallery`       | ISR (10 min)    | Slow-changing                                      |
| `/[locale]/about`                 | Static          | Editorial                                          |
| `/[locale]/admin/**`              | Dynamic (SSR)   | Requires session — never cached                    |
| `/[locale]/login`                 | Dynamic (SSR)   | Auth-aware                                         |
| `/api/contact`                    | Edge-compatible | Stateless                                          |

## Data flow

```
[ page.tsx ]  ── await getRepository() ──► [ ContentRepository ]
                                            │
                                            ├── mockRepository  (default, in-memory)
                                            └── supabaseRepository (server-only)
```

Switching the source is a one-env-var change. UI code is identical regardless of source.

## Auth model

| Role          | Capability                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| `viewer`      | Read all published content (default for new sign-ups)                       |
| `editor`      | Create + edit drafts and submit for review; cannot publish or change roles  |
| `admin`       | Publish, delete, manage users (except super admin), read contact inbox      |
| `super_admin` | Full access, including audit logs                                           |

Roles are stored on `public.profiles.role` and enforced both at the **app layer** (route guards) and at the **DB layer** (RLS policies in `supabase/migrations/002_rls_policies.sql`).

## Editorial workflow

`draft → review → published → archived` — enforced by `content_status` enum + RLS. Non-admin editors cannot transition to `published`.

## Audit log

`public.audit_logs` is append-only — there are no `update` or `delete` RLS policies. Every admin mutation should call an `audit_logs` insert. Triggers (future work) will automate this for tables like `news_articles`.

## i18n strategy

- Routing: `/[locale]/...` with locale resolved by middleware (cookie → `Accept-Language` → default `ar`).
- Strings: JSON dictionaries in `src/lib/i18n/dictionaries/{locale}.json`.
- Content: Every translatable DB column is split into `*_ar` and `*_en` fields (clearer joins, simpler RLS than a fallback table).
- Direction: `<html dir>` is set from `localeMeta[locale].dir` — Tailwind's `start`/`end` logical utilities flip correctly.

## Accessibility

`AccessibilityProvider` persists user preferences in `localStorage`:

- 4-step font scale → `html.a11y-font-{lg|xl|xxl}`
- High contrast → `html.a11y-contrast`
- Reduce motion → `html.a11y-reduce-motion`
- Theme → `html.dark`
- TTS uses `window.speechSynthesis` with the active `<html lang>`.

A skip-to-content link is the first focusable element in `[locale]/layout.tsx`.

## Security hardening

- Strict security headers via `next.config.mjs` (HSTS, X-Frame-Options, etc.).
- RLS enabled on **every** table.
- Contact API has a honeypot field + size limits; production should add rate limiting.
- Service role key is server-only and **never** read from a client component.
- Storage buckets that hold user uploads (`attachments`) are private; admins read via signed URLs.
