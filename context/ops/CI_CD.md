# CI/CD Pipeline

> Set up in Phase 4.

## Pipeline Overview

### On PR

- **GitHub Actions:** `pnpm install` -> `pnpm lint` -> `pnpm tsc --noEmit`
- **Vercel:** Automatic preview deploy

### On Push to Main

- **Vercel:** Automatic production deploy
  - `pnpm install` -> `pnpm build` -> deploy to edge

## Deploy Process

### Staging

No dedicated staging environment in v1. Use Vercel preview deploys for testing.

### Production

Push to `main` triggers automatic Vercel deployment. No manual steps needed.

### MCP Server

Manual build and distribution:
```
pnpm mcp:build  # esbuild bundle -> dist/mcp-server.js
```

Users configure their own Claude Code setup with the bundled file.

## Secrets in CI

| Secret | Location | Used By |
|--------|----------|---------|
| `SUPABASE_URL` | Vercel env vars | API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env vars | API routes |

GitHub Actions doesn't need Supabase secrets — it only runs lint and typecheck.
