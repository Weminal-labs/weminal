# Environment Variables

> Never commit real values. This file documents what variables are needed and why.

## Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, bypasses RLS) | `eyJhbGciOiJIUzI1NiIs...` |

## Better Auth (Required for auth)

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Random secret ≥ 32 chars — signs session cookies. Generate with `openssl rand -hex 32`. Never commit. | `a1b2c3d4...` (64 hex chars) |
| `BETTER_AUTH_URL` | Canonical base URL of the app. Used for OAuth redirect URLs and cookie domain. | `https://weminal.pages.dev` |
| `DATABASE_URL` | Postgres connection string for Better Auth tables. Must use Supabase **Transaction pooler** (port 6543, `?pgbouncer=true`). Direct connections (5432) won't work on Cloudflare Workers. | `postgresql://postgres.xxx:pass@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `GITHUB_CLIENT_ID` | Client ID from GitHub OAuth App settings | `Iv1.abc123...` |
| `GITHUB_CLIENT_SECRET` | Client secret from GitHub OAuth App. Server-side only — never prefix with `NEXT_PUBLIC_`. | `ghp_abc...` |

## Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL (or use relative `/api/v1`) | `/api/v1` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins for production | `https://your-app.vercel.app` |
| `MCP_API_KEY` | **DEPRECATED** — was a bearer token for the `/api/mcp` HTTP endpoint. Now replaced by per-user `wem_` API keys generated from `/profile`. | — |

## Setup Instructions

### Supabase

1. Go to https://supabase.com and create a new project
2. In Project Settings > API, find:
   - **Project URL** — this is `SUPABASE_URL`
   - **service_role key** (under "Project API keys") — this is `SUPABASE_SERVICE_ROLE_KEY`
3. Never use the `anon` key — this project uses `service_role` only

### Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in the Supabase values from above
3. `.env.local` is in `.gitignore` — never commit it

### Vercel Production

1. In Vercel project settings > Environment Variables
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Optionally add `ALLOWED_ORIGINS` with your production domain

### Better Auth

#### BETTER_AUTH_SECRET
Generate a cryptographically random secret:
```
openssl rand -hex 32
```
Add the output as `BETTER_AUTH_SECRET` in `.env.local`. Rotate immediately if ever committed to git.

#### BETTER_AUTH_URL
- Local development: `http://localhost:3000`
- Production (Cloudflare Pages): `https://weminal.pages.dev`

#### DATABASE_URL (Supabase Transaction Pooler)
1. Go to Supabase dashboard → Project Settings → Database → Connection string
2. Select **Transaction** pooler mode (not Session)
3. Copy the connection string — it uses **port 6543** and includes `?pgbouncer=true`
4. Format: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true`

> The Transaction pooler is required because Cloudflare Workers cannot hold persistent TCP connections. Do NOT use port 5432 (direct connection).

#### GitHub OAuth App
1. Go to https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Set **Homepage URL** to `https://weminal.pages.dev` (or `http://localhost:3000` for dev)
3. Set **Authorization callback URL** to `https://weminal.pages.dev/api/auth/callback/github`
4. For local dev, create a separate OAuth app with callback `http://localhost:3000/api/auth/callback/github`
5. Copy **Client ID** → `GITHUB_CLIENT_ID`
6. Generate **Client secret** → `GITHUB_CLIENT_SECRET`

### MCP Server

#### Stdio Transport (Local)

For local Claude Code development, run the stdio MCP server:

```json
{
  "mcpServers": {
    "crypto-opportunities": {
      "command": "node",
      "args": ["dist/mcp-server.mjs"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
      }
    }
  }
}
```

#### HTTP Transport (Remote)

For remote Claude Desktop access, use the HTTP MCP endpoint at `/api/mcp`:

```json
{
  "mcpServers": {
    "crypto-opportunities": {
      "url": "https://weminal.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_API_KEY"
      }
    }
  }
}
```

Set `MCP_API_KEY` in Vercel production environment for write operations.

> **DEPRECATED**: `MCP_API_KEY` is deprecated as of 2026-04-08. The HTTP MCP endpoint will transition to per-user `wem_` API keys generated from `/profile`. Existing `MCP_API_KEY` values will continue to work until Phase D ships.

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` has full database access — treat it as a root credential
- Never prefix Supabase keys with `NEXT_PUBLIC_` — they must stay server-side only
- If a key is accidentally committed, rotate it immediately in Supabase dashboard
