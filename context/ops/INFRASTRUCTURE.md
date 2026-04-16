# Infrastructure

> Deployment and hosting setup.

## Environments

| Environment | URL | Purpose |
|------------|-----|---------|
| Local | `http://localhost:3000` | Development |
| Production | `https://weminal.pages.dev` | Live (Cloudflare Pages) |

## Hosting

**Cloudflare Pages** — edge-native deployment via `@cloudflare/next-on-pages`.
- Deployment command: `pnpm run build:cf && npx wrangler pages deploy .vercel/output/static --project-name weminal`
- Environment variables set in Cloudflare Pages dashboard → Settings → Environment Variables
- Edge Workers runtime — no persistent TCP connections (use Supabase Transaction pooler)
- Rollback via Cloudflare Pages dashboard deployment history

### Deployment Process

1. Commit and push to `main` (GitHub)
2. GitHub Actions runs build + deploy via `cloudflare/wrangler-action`
3. Wrangler deploys to Cloudflare Pages
4. No manual deploy step required after CI is set up

## Database Hosting

**Supabase Cloud** — managed PostgreSQL.
- Free tier: 500MB storage, 2GB bandwidth
- **Edge runtime requires Transaction pooler** — port 6543, `?pgbouncer=true`
  - Get URL from Supabase dashboard → Settings → Database → "Transaction" pooler tab
  - Use this URL as `DATABASE_URL` in Cloudflare Pages env vars
- Dashboard for SQL queries, schema inspection, logs

## MCP Server

Two deployment options:

### Stdio Transport (Local)
- Runs as a child process of Claude Code or Claude Desktop
- Bundled with esbuild to `dist/mcp-server.mjs`
- Users clone repo, run `pnpm mcp:build`, and configure in Claude Code

### HTTP Transport (Remote)
- HTTP endpoint at `https://weminal.pages.dev/api/mcp`
- Cloudflare Pages edge function — no separate hosting needed
- JSON-RPC 2.0 protocol
- Public read tools (no auth), authenticated write tools (Bearer token required)
- Token: per-user delegate API keys (`wem_` prefix) set from the `/profile` page

## DNS & Domains

Optional custom domain via Cloudflare Pages. Low priority.

## Cost

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Cloudflare Pages | Free | $0 |
| Supabase | Free | $0 |
| Domain | Optional | ~$1/mo |
