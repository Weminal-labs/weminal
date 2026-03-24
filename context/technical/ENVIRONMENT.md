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

The MCP server needs the same Supabase variables. Pass them via the Claude Code config:

```json
{
  "mcpServers": {
    "crypto-opportunities": {
      "command": "node",
      "args": ["dist/mcp-server.js"],
      "env": {
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
      }
    }
  }
}
```

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` has full database access — treat it as a root credential
- Never prefix Supabase keys with `NEXT_PUBLIC_` — they must stay server-side only
- If a key is accidentally committed, rotate it immediately in Supabase dashboard
