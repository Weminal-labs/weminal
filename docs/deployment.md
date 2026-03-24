# Deployment Guide

## Vercel Deployment

1. Push repo to GitHub
2. Connect repo in [Vercel Dashboard](https://vercel.com/new)
3. Set framework: Next.js (auto-detected)
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS` (your production URL)
5. Deploy

Vercel auto-deploys on push to `main` and creates preview deploys on PRs.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open SQL Editor
3. Run `supabase/migrations/001_create_opportunities.sql`
4. Optionally run `supabase/seed.sql` for sample data
5. Copy Project URL and service_role key to Vercel env vars

## CI/CD

GitHub Actions runs on every PR and push to main:
- `pnpm install`
- `pnpm lint`
- `pnpm tsc --noEmit`

Vercel preview deploys trigger automatically on PRs.

## Security Checklist

- [x] SUPABASE_SERVICE_ROLE_KEY in env vars only (never in code)
- [x] No NEXT_PUBLIC_ prefix on secrets
- [x] RLS enabled with no anon policies
- [x] Rate limiting (100 req/min per IP)
- [x] CORS restricted to known origins
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- [x] Zod validation on all inputs
- [x] Parameterized queries via Supabase client
- [x] Error responses don't expose internals
