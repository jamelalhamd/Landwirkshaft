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

All public pages live under `src/app/[locale]/` — the locale segment is always `ar` or `en`. `src/app/page.tsx` redirects `/` to the default locale (`ar`). The middleware at `middleware.ts` handles locale detection (cookie `NEXT_LOCALE` → `Accept-Language` header → default `ar`) and redirects non-localised paths.

Admin routes (`/[locale]/admin/**`) are guarded at the middleware layer: if the `__session` cookie is absent the request is redirected to `/[locale]/login` immediately, before any server component runs. Pages then do a second, authoritative check with `getSession()` which verifies the cookie cryptographically via Firebase Admin.

`dynamicParams = false` is set on the locale layout — any path with a segment other than `ar`/`en` returns 404 automatically.

**Important:** Middleware runs on Edge Runtime. Firebase Admin SDK is NOT Edge-compatible — do not import it in middleware. The middleware only checks for the presence of the `__session` cookie; full verification happens in `getSession()` (Node.js runtime).

### Auth — Firebase

Authentication has been migrated from Supabase to Firebase. The flow:

1. Client calls `signInWithEmailAndPassword` from `firebase/auth` using `clientAuth` (`src/lib/firebase/client.ts`)
2. Client POSTs the Firebase ID token to `POST /api/auth/session`
3. Server verifies the token with Firebase Admin and creates an HttpOnly session cookie (`__session`, 5-day expiry)
4. All subsequent server requests verify this cookie with `adminAuth().verifySessionCookie(sessionCookie, true)` (`checkRevoked: true`)
5. Logout: `POST /api/auth/logout` → revokes refresh tokens via Admin SDK + deletes the cookie

`src/lib/auth/getSession.ts` is the sole server-side auth entry point. It returns `SessionInfo` (defined in `src/lib/auth/types.ts`) with a `roleAtLeast(role)` helper. Returns `unauthenticated` if no cookie is present or the cookie is expired/revoked.

Firebase helpers:
| File | Usage |
|---|---|
| `src/lib/firebase/client.ts` | Client components — exports `clientAuth` |
| `src/lib/firebase/admin.ts` | Server-only — exports `adminAuth()` and `adminDb()` factory functions |

Never call `adminAuth()` or `adminDb()` from client components or middleware.

### Roles — Firestore

Roles in ascending order: `viewer → editor → admin → super_admin` (defined in `src/lib/auth/types.ts`).

Roles are stored in Firestore `users/{uid}.role`. A new Firestore user document is created automatically on first login by the `/api/auth/session` route with role `viewer`. Promote users via the Firebase console or a future `/admin/users` page.

Security rules in `firestore.rules` mirror the role hierarchy — read them before adding new Firestore collections.

### Data layer

All content reads go through `src/lib/data/repository.ts` — never import Firestore directly from a page. The active implementation is chosen at startup by the `NEXT_PUBLIC_DATA_SOURCE` env var:

- `mock` (default) — in-memory fixtures from `src/lib/data/mock-repository.ts`
- `firebase` — live data via Firestore (implementation pending — Phase 2)

The `ContentRepository` interface (same file) is the authoritative contract: `getLatestNews`, `getBreakingNews`, `getNewsBySlug`, `listStaff`, `listDepartments`, `listDocuments`, `listResearch`, `listMedia`, `getSiteStats`. Both implementations must satisfy this interface.

### i18n

- Route: `/[locale]/...` where locale is `ar` or `en`
- Strings: `src/lib/i18n/dictionaries/{ar,en}.json` loaded server-side via `getDictionary(locale)` — the `ar.json` type is the authoritative shape for both files
- DB content: every translatable field uses `*_ar` / `*_en` naming convention
- Direction: `<html lang dir>` is set in `src/app/[locale]/layout.tsx` from `localeMeta[locale]`; use Tailwind's logical utilities (`start`/`end`, `ms-`/`me-`, `ps-`/`pe-`) so RTL flips automatically
- For directional icons (arrows etc.), pick the variant based on locale: `locale === 'ar' ? ArrowLeft : ArrowRight`

### Rendering strategy

Pages use ISR by default. The revalidation period is set per-page via `export const revalidate = N`:

| Page | Revalidation |
|---|---|
| `/[locale]` (home) | 300 s (5 min) |
| `/[locale]/news` and `/[locale]/news/[slug]` | 120 s (2 min) |
| `/[locale]/documents`, `/research`, `/staff`, `/gallery` | 600 s (10 min) |
| `/[locale]/about` | static (no revalidate) |
| `/[locale]/admin/**` and `/login` | dynamic SSR — **no `revalidate` export** |

Do not add `revalidate` to auth-gated pages.

### Design system

Tailwind is extended in `tailwind.config.ts` with:
- `primary-*` (institutional blue, brand at `primary-700: #1a4e9c`) and `secondary-*` (agricultural green, brand at `secondary-600: #16a34a`)
- `surface`, `ink`, `border`, `ring` semantic tokens backed by CSS variables for dark mode
- `fluid-*` font size scale for responsive/accessible sizing
- `shadow-gov`, `shadow-gov-md`, `shadow-gov-lg` for government-style elevation
- `cn()` utility in `src/lib/utils.ts` merges Tailwind classes (`clsx` + `tailwind-merge`)

The `@/` path alias maps to `src/`.

### Accessibility

`AccessibilityProvider` (client component wrapping `[locale]/layout.tsx`) persists user preferences to `localStorage` and applies classes to `<html>`: `a11y-font-{lg|xl|xxl}`, `a11y-contrast`, `a11y-reduce-motion`, `dark`. TTS uses `window.speechSynthesis` keyed to the active `<html lang>`. A skip-to-content link (`#main`) is the first focusable element in the layout.

### Security

Global security headers (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are applied to all routes in `next.config.mjs`. The `/api/contact` route uses a honeypot field (`website`) — if it is non-empty the request is silently accepted and discarded.

Session cookies are HttpOnly, Secure (production), SameSite=Strict. The logout endpoint calls `revokeRefreshTokens()` so stolen cookies cannot be replayed.

## TypeScript

Strict mode is on with `noUncheckedIndexedAccess`. Types in `src/lib/supabase/types.ts` are legacy — the canonical auth types are now in `src/lib/auth/types.ts`. Keep `UserRole` and `SessionInfo` imports from `@/lib/auth/types`.

## Environment variables

```bash
# Firebase (client — public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-only — NEVER expose)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Data source: "mock" | "firebase"
NEXT_PUBLIC_DATA_SOURCE=mock

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

Copy `.env.local.example` to `.env.local` to get started.

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (start in production mode, then deploy `firestore.rules`)
4. Enable **Storage** (configure access rules separately)
5. Download a service account key: Project Settings → Service accounts → Generate new private key
6. Fill `.env.local` with the values from the Firebase console and the service account JSON
7. Deploy Firestore rules: `firebase deploy --only firestore:rules`
8. Create the first user via Firebase Auth console, then set their role in Firestore:
   ```
   users/{uid} → { role: "super_admin" }
   ```

## Content editorial workflow

`draft → review → published → archived` — enforced by the `content_status` type and Firestore security rules. Editors cannot write `published` status; only `admin` and above can.

Audit logs go to the `audit_logs` Firestore collection — append-only (no update/delete rules). Every admin mutation should write an audit log document.

## Implementation status

- **Done (Phase 0):** All public pages, Firebase Auth + session cookies, role-based route guards, Firestore security rules
- **Phase 1 next:** Firebase Firestore repository implementation (`src/lib/data/firebase-repository.ts`) to replace mock data, Firebase Storage integration
- **Phase 2:** Admin CMS pages (`/admin/news`, `/admin/documents`, `/admin/users`, etc.)

See `docs/ROADMAP.md` for the full plan.
