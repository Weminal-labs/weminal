# Infrastructure

> Deployment and hosting setup.

## Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Local | `http://localhost:3000` | Development |
| Production | `weminal.vercel.app` | Live |

## Hosting

**Vercel** — zero-config Next.js hosting.
- Manual deployments with `npx vercel --prod` (not auto-deploy from git)
- Environment variables encrypted at rest
- Serverless functions for API routes + MCP HTTP endpoint
- One-click rollback available

### Deployment Process

1. Commit and push to `main` (GitHub)
2. Run `npx vercel --prod` locally or from CI
3. Vercel rebuilds and deploys to weminal.vercel.app
4. No automatic deploys from git — explicit manual deploy required

## Database Hosting

**Supabase Cloud** — managed PostgreSQL.
- Free tier: 500MB storage, 2GB bandwidth
- Connection pooler in transaction mode
- Dashboard for SQL queries, schema inspection, logs

## MCP Server

Two deployment options:

### Stdio Transport (Local)
- Runs as a child process of Claude Code or Claude Desktop
- Bundled with esbuild to `dist/mcp-server.mjs`
- Users clone repo, run `pnpm mcp:build`, and configure in Claude Code

### HTTP Transport (Remote)
- HTTP endpoint at `https://weminal.vercel.app/api/mcp`
- Serverless function on Vercel, no separate hosting needed
- JSON-RPC 2.0 protocol
- Public read tools (no auth), authenticated write tools (Bearer token required)
- Token: set `MCP_API_KEY` in Vercel environment variables

## DNS & Domains

Optional custom domain via Vercel. Low priority for v1.

## Cost

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby / Pro | $0-$20 |
| Supabase | Free | $0 |
| Domain | Optional | ~$1/mo |
