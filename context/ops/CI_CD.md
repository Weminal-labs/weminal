# CI/CD Pipeline

> Set up in Phase 4.

## Pipeline Overview

### On PR

- **GitHub Actions:** `pnpm install` → `pnpm lint` → `pnpm tsc --noEmit`
- No automatic preview deploy on PRs (test locally with `pnpm dev`)

### On Push to Main

- **GitHub Actions:** `pnpm install` → `pnpm run build:cf` → `cloudflare/wrangler-action` deploys to Cloudflare Pages

## Deploy Process

### Staging

No dedicated staging environment. Use local dev (`pnpm dev`) for testing before pushing to main.

### Production

Push to `main` triggers automatic deployment to Cloudflare Pages via GitHub Actions and `wrangler-action`.

### MCP Server

Manual build and distribution:
```
pnpm mcp:build  # esbuild bundle -> dist/mcp-server.mjs
```

Users configure their own Claude Code setup with the bundled file.

## Secrets in CI

| Secret | Location | Used By |
|--------|----------|---------|
| `SUPABASE_URL` | Cloudflare Pages env vars | API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Pages env vars | API routes |
| `DATABASE_URL` | Cloudflare Pages env vars | Better Auth (Transaction pooler URL, port 6543) |
| `BETTER_AUTH_SECRET` | Cloudflare Pages env vars | Better Auth session signing |
| `GITHUB_CLIENT_ID` | Cloudflare Pages env vars | OAuth login |
| `GITHUB_CLIENT_SECRET` | Cloudflare Pages env vars | OAuth login |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secrets | `wrangler-action` deploy |

GitHub Actions only needs `CLOUDFLARE_API_TOKEN` for deployment — Supabase secrets stay in Cloudflare Pages env vars, not GitHub.
