# Roadmap

This session delivered the **foundation + core**. The plan below sketches the remaining phases.

## ✅ Phase 0 — Foundation (delivered)

- Next.js 15 App Router + TypeScript strict + Tailwind design system
- i18n (AR/EN, RTL/LTR) with locale-routing middleware
- Design system, dark mode, high-contrast mode, font scaling, TTS, reduce-motion
- Header (with both logos), Footer, mobile nav, language switcher, accessibility menu
- Home page: Hero, breaking-news ticker, quick services, statistics, latest news, pillars
- Public list pages: News, Documents, Research, Staff, Gallery, Contact (with API route)
- Auth scaffold + admin landing with role-aware guard
- Supabase migrations: schema (10 tables + enums + triggers), RLS (all tables), storage buckets, seed
- Repository pattern — same interface for mock + Supabase
- Architecture / sitemap / README docs

## Phase 1 — Live data + auth

- [ ] Provision Supabase project, run all 4 migrations
- [ ] Promote first super admin
- [ ] Switch `NEXT_PUBLIC_DATA_SOURCE=supabase`, smoke-test every page
- [ ] Wire `refreshSession()` into `middleware.ts`
- [ ] Logout endpoint + session-aware Header
- [ ] Rate limit `/api/contact` (Upstash KV recommended)

## Phase 2 — CMS (admin pages)

- [ ] `/admin/news` — list, create, edit, schedule, publish workflow
- [ ] `/admin/documents` — upload PDF to Supabase Storage, metadata, status
- [ ] `/admin/research` — paper records with authors, ISSN, DOI, citation generator
- [ ] `/admin/staff` — staff editor with photo upload
- [ ] `/admin/gallery` — album manager + multi-image upload
- [ ] `/admin/contact` — inbox with status workflow + reply
- [ ] `/admin/users` — invite, role assignment (admin+)
- [ ] `/admin/audit` — audit-log viewer (super_admin)
- [ ] Editorial workflow: `draft → review → published` enforced in UI
- [ ] Audit-log insert on every admin mutation

## Phase 3 — Advanced features

- [ ] Full-text search across news + research (Postgres `tsvector` or Meilisearch)
- [ ] Seed registry detail pages with filters by crop, region, year
- [ ] Citation generator (APA / MLA / ISO 690) on research detail
- [ ] Interactive map of research centers (Leaflet + governorate GeoJSON)
- [ ] PDF viewer in-page (PDF.js)
- [ ] Newsletter subscription (Supabase + email provider)

## Phase 4 — SEO, performance, launch

- [ ] `sitemap.xml` per locale + `robots.txt`
- [ ] JSON-LD: Organization, NewsArticle, ScholarlyArticle
- [ ] Lighthouse audit ≥ 95 across all categories
- [ ] Image optimization for staff photos (Supabase transforms + Next/Image)
- [ ] Bundle analysis pass; remove unused locales from server bundle
- [ ] Pen-test pass (OWASP Top 10, RLS bypass attempts)
- [ ] Backup + DR plan (Supabase PITR + nightly logical dumps)
- [ ] Production deploy (Vercel or self-hosted Node)

## Phase 5 — Post-launch

- [ ] Analytics with privacy in mind (Plausible / Umami)
- [ ] User feedback widget
- [ ] Translation memory for editors (so AR↔EN authoring is consistent)
- [ ] Mobile app considerations (React Native + same Supabase backend)
