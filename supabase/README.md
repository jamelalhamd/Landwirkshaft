# Supabase

## Applying migrations

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Link your project (one-time)
supabase link --project-ref <your-project-ref>

# 3. Push the migrations
supabase db push
```

Or paste each `.sql` file into the **SQL Editor** in the Supabase dashboard in order:

1. `001_init_schema.sql` — tables, indexes, triggers
2. `002_rls_policies.sql` — Row Level Security
3. `003_storage_buckets.sql` — storage buckets + policies
4. `004_seed.sql` — minimal seed data

## Promoting the first super admin

After signing up the first user through the app, run this in the SQL editor:

```sql
update public.profiles set role = 'super_admin' where email = 'you@example.com';
```

## Switching the app off mock data

In `.env.local`:

```
NEXT_PUBLIC_DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

No code changes are needed — the repository pattern picks the source at startup.
