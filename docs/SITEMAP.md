# Sitemap

All public pages are under `[locale]` where `locale ∈ {ar, en}`. The default redirect goes to the user's preferred language; otherwise Arabic.

## Public

```
/ar                          Home
/ar/about                    About the Commission
/ar/staff                    Staff Directory
/ar/news                     News & Announcements (list)
/ar/news/[slug]              News article
/ar/documents                Official Documents
/ar/research                 Research & Projects / Digital Library
/ar/gallery                  Media Gallery
/ar/contact                  Contact form
/ar/privacy                  Privacy Policy           (TODO)
/ar/terms                    Terms of Use             (TODO)
```

The English mirror exists at `/en/...` for every route above.

## Auth

```
/[locale]/login              Sign-in (Supabase Auth — password)
/[locale]/logout             POST endpoint for sign-out (TODO)
```

## Admin (RBAC — editor / admin / super_admin)

```
/[locale]/admin                          Dashboard landing
/[locale]/admin/news                     News CMS (TODO)
/[locale]/admin/news/[id]                News editor (TODO)
/[locale]/admin/documents                Documents CMS (TODO)
/[locale]/admin/research                 Research CMS (TODO)
/[locale]/admin/staff                    Staff editor (TODO)
/[locale]/admin/gallery                  Media manager (TODO)
/[locale]/admin/contact                  Inbox (admin only) (TODO)
/[locale]/admin/audit                    Audit log viewer (super_admin) (TODO)
/[locale]/admin/users                    User & role management (admin+) (TODO)
```

## API

```
POST /api/contact            Public contact form (spam-hardened, honeypot)
```

## SEO

- `sitemap.xml` generated per locale (TODO — `next-sitemap` or hand-rolled route)
- `robots.txt` with `Disallow: /admin`
- Open Graph + locale alternates already wired in `generateMetadata`
