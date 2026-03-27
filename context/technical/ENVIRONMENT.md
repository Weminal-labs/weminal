# Environment Variables

> Never commit real values. This file documents what variables are needed and why.

## Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, bypasses RLS) | `eyJhbGciOiJIUzI1NiIs...` |

## Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL (or use relative `/api/v1`) | `/api/v1` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins for production | `https://your-app.vercel.app` |
| `MCP_API_KEY` | Bearer token for authenticated MCP write operations (HTTP endpoint at `/api/mcp`) | — |

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

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` has full database access — treat it as a root credential
- Never prefix Supabase keys with `NEXT_PUBLIC_` — they must stay server-side only
- If a key is accidentally committed, rotate it immediately in Supabase dashboard
