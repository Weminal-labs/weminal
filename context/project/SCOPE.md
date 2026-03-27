# Project Scope

> Generated from proposal and PRD. Updated as priorities shift.

## In Scope — v1

- **Opportunity CRUD** — create, read, update, delete for all 5 types (hackathon, grant, fellowship, bounty, bootcamp)
- **Single table schema** — `opportunities` table with `type` enum (5 types), status enum, arrays for blockchains/tags, JSONB for links, parent_hackathon_id for bootcamps
- **Filtering** — by type, status, organization, blockchain, tags, date range
- **Full-text search** — on name and description fields
- **Sorting & pagination** — server-side, any column, asc/desc
- **REST API** — Hono mounted in Next.js catch-all route, Zod validation, consistent error format
- **Meta endpoints** — /meta/types, /meta/statuses, /meta/blockchains, /meta/tags, /meta/organizations
- **Health check** — /health endpoint
- **MCP Server** — 5 tools (list, get, create, update, delete) + 4 resources, stdio transport
- **Web table UI** — TanStack Table, shadcn/ui, type badges with color coding, inline editing
- **Type filter** — prominent multi-select for opportunity types (blue/green/purple/orange/teal for hackathon/grant/fellowship/bounty/bootcamp)
- **Organization filter** — autocomplete filter for organizing entities
- **URL-persisted filters** — via nuqs library
- **Create dialog** — with type selector as first required field
- **Detail view** — expandable row or side panel
- **Loading & empty states** — skeletons, per-type empty state messages
- **Responsive layout** — card view on mobile with type badges
- **Toast notifications** — for all CRUD feedback
- **Seed data** — 25-30 opportunities across all 4 types
- **Vercel deployment** — with environment variables, rate limiting, CORS, security headers
- **Documentation** — README, API reference, MCP setup guide, deployment guide

## Out of Scope — v1 (possible later)

- User authentication / multi-tenancy
- Submission / deliverable tracking
- Calendar integrations / .ics export
- Automated opportunity discovery / scraping
- HTTP/SSE MCP transport (v1 is stdio only)
- Mobile-native app
- Soft deletes (v1 uses hard deletes)
- Real-time subscriptions (Supabase Realtime)
- Row selection / bulk operations
- Kanban view grouped by status or type
- Analytics dashboard (reward trends, success rates)
- Discord/Slack webhook notifications
- Persistent rate limiting (v1 uses in-memory; Redis in v2)

## Never In Scope

- Storing raw payment card data (any payment integration would use Stripe or equivalent)
- Running arbitrary user code
- Multi-database architecture for v1

## Open Questions

- Custom domain for production deployment (optional, low priority)
- Whether to use tabs vs. multi-select for the type filter UX
