# Infrastructure

> Deployment and hosting setup.

## Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Local | `http://localhost:3000` | Development |
| Preview | `*.vercel.app` (auto-generated per PR) | PR review |
| Production | `*.vercel.app` (or custom domain) | Live |

## Hosting

**Vercel** — zero-config Next.js hosting.
- Auto-deploys on push to `main`
- Preview deploys on PRs
- Edge functions for API routes
- Environment variables encrypted at rest

## Database Hosting

**Supabase Cloud** — managed PostgreSQL.
- Free tier: 500MB storage, 2GB bandwidth
- Connection pooler in transaction mode
- Dashboard for SQL queries, schema inspection, logs

## MCP Server

Not hosted — runs locally as a stdio child process of Claude Code.
- Bundled with esbuild to `dist/mcp-server.js`
- Users clone repo, build, and configure in Claude Code

## DNS & Domains

Optional custom domain via Vercel. Low priority for v1.

## Cost

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby / Pro | $0-$20 |
| Supabase | Free | $0 |
| Domain | Optional | ~$1/mo |
