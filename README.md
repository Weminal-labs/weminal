# Crypto Opportunities Database

A Notion-like structured database for tracking crypto opportunities — hackathons, grants, fellowships, and bounties — with dual access: web UI and AI agents via MCP.

Built by [Weminal Labs](https://github.com/weminal-labs).

## Opportunity Types

| Type | Color | Description |
|------|-------|-------------|
| Hackathon | Blue | Competitive building events |
| Grant | Green | Funding programs for projects |
| Fellowship | Purple | Structured development programs |
| Bounty | Orange | Task-based rewards |

## Tech Stack

- **Frontend:** Next.js (App Router), TanStack Table, TanStack Query, shadcn/ui, Tailwind CSS
- **API:** Hono (mounted in Next.js catch-all route), Zod validation
- **Database:** Supabase (PostgreSQL) with RLS, GIN indexes, FTS
- **MCP Server:** @modelcontextprotocol/sdk, stdio transport, 5 tools + 4 resources
- **Deployment:** Vercel

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd crypto-opportunities-db
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Run database migration (in Supabase SQL Editor)
# Paste contents of supabase/migrations/001_create_opportunities.sql

# Seed data (optional)
# Paste contents of supabase/seed.sql

# Start development
pnpm dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server (API + frontend) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm mcp:dev` | Start MCP server in watch mode |
| `pnpm mcp:build` | Bundle MCP server for distribution |

## API Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/opportunities` | List with filters, sort, pagination |
| GET | `/opportunities/:id` | Get single opportunity |
| POST | `/opportunities` | Create (name + type required) |
| PATCH | `/opportunities/:id` | Partial update |
| DELETE | `/opportunities/:id` | Delete |
| GET | `/meta/types` | Opportunity type enum values |
| GET | `/meta/statuses` | Status enum values |
| GET | `/meta/blockchains` | Distinct blockchains |
| GET | `/meta/tags` | Distinct tags |
| GET | `/meta/organizations` | Distinct organizations |
| GET | `/health` | Health check |

### Filter Parameters

`type`, `status`, `organization`, `blockchain`, `tag`, `search`, `start_date_gte`, `end_date_lte`, `sort_by`, `sort_order`, `page`, `per_page`

## MCP Server

5 tools for Claude Code integration:

- `opportunity_list` — List/filter opportunities
- `opportunity_get` — Get by ID
- `opportunity_create` — Create (name + type required)
- `opportunity_update` — Partial update
- `opportunity_delete` — Delete

4 resources: types, statuses, blockchains, tags

See [MCP Setup Guide](docs/mcp-setup.md) for configuration.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only) |
| `ALLOWED_ORIGINS` | No | Production CORS origins |

## License

MIT
