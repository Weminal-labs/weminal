# Architecture

> Generated from architecture document.

## System Overview

```
 +----------------------------------------------+
 |                  Consumers                    |
 |                                               |
 |  +----------------+    +-------------------+  |
 |  |  React Web UI  |    |  Claude Agent     |  |
 |  |  (Next.js)     |    |  (stdio or HTTP)  |  |
 |  +-------+--------+    +--------+----------+  |
 |          |                      |              |
 +----------------------------------------------+
            |                      |
            v                      v (stdio)
 +------------------+   +-------------------+
 |  Hono API        |   |  MCP Server       |
 |  /api/v1/*       |   |  (stdio transport)|
 |  /api/mcp (HTTP) |   |  16 tools +       |
 |  /hack, /calendar|   |  6 resources      |
 |  (REST + JSON)   |   |                   |
 +--------+---------+   +--------+----------+
          |                      |
          |   HTTP MCP endpoint  |
          |   (public read +     |
          |   auth write)        |
          |                      |
          |   All use Supabase   |
          |   JS client with     |
          |   service_role key   |
          v                      v
 +----------------------------------------------+
 |              Supabase (PostgreSQL)            |
 |  - opportunities table (all 4 types)         |
 |  - calendar_blocks (time slots)              |
 |  - milestones (key dates)                    |
 |  - proposals (drafts & submissions)          |
 |  - GIN indexes (arrays, JSONB, FTS)          |
 |  - RLS: service_role bypass only             |
 +----------------------------------------------+
```

### Deployment View

```
 +-------------------+       +-------------------+
 |  Vercel           |       |  Local Dev        |
 |                   |       |                   |
 |  Next.js App      |       |  Claude Code      |
 |  +-------------+  |       |  +-------------+  |
 |  | React UI    |  |       |  | MCP Server  |  |
 |  +-------------+  |       |  | (stdio)     |  |
 |  | Hono API    |  |       |  +------+------+  |
 |  | (catch-all) |  |       |         |         |
 |  +------+------+  |       +---------+---------+
 |         |         |                 |
 +---------+---------+                 |
           |                           |
           +-------------+-------------+
                         |
                         v
               +---------+---------+
               |  Supabase Cloud   |
               |  (hosted PG)      |
               +-------------------+
```

## Data Flow

### Web UI -> API -> Database

```
User Action -> TanStack Table State -> URL Params -> TanStack Query -> Hono API -> Supabase
                                                          |
                                                     Cache Layer
                                                     (stale-while-revalidate)
```

### MCP Agent -> Database

```
Claude Code -> stdio -> MCP Server -> Zod Validation -> Supabase Client -> PostgreSQL
```

### API Request Pipeline

```
Request
  -> Rate Limiter (100 req/min per IP)
  -> Logger (structured JSON)
  -> CORS (allow web origin)
  -> Route Handler
    -> Zod Validation
    -> Dynamic Query Builder
    -> Supabase Client (parameterized query)
    -> Response
  -> Error Handler (catch-all)
```

## Key Design Decisions

- **Single table design** — one `opportunities` table with `type` enum covers all 4 types. No joins needed.
- **Hono in Next.js** — API and frontend in single Vercel deployment via catch-all route.
- **Server-side filtering & pagination** — API handles all query logic. Client sends params, receives paginated results.
- **Shared code** — Supabase client, Zod schemas, and query builder shared between API and MCP server.
- **service_role only** — no anon access. All DB queries go through server-side code.

## Project Structure

```
src/
  app/                      # Next.js App Router pages
    page.tsx                # Homepage (/)
    layout.tsx
    hack/
      page.tsx              # Opportunities table (/hack)
    calendar/
      page.tsx              # Calendar view (/calendar)
    api/
      [...route]/           # Hono API catch-all
      mcp/
        route.ts            # HTTP MCP endpoint (/api/mcp)
  api/                      # Hono application
    index.ts
    routes/
      opportunities.ts      # Opportunity CRUD
      calendar-blocks.ts    # Block CRUD
      milestones.ts         # Milestone CRUD
      proposals.ts          # Proposal CRUD
      meta.ts               # Lookup endpoints
    middleware/
      error-handler.ts
      rate-limiter.ts
      logger.ts
    schemas/
      opportunity.ts        # Zod schemas for opportunities
      calendar.ts           # Zod schemas for calendar data
    lib/
      supabase.ts           # Client singleton
      query-builder.ts      # Dynamic filter builder
  components/               # React components
    table/
    filters/
    calendar/
    forms/
    detail/
    ui/                     # shadcn components
    mcp-usage-dialog.tsx    # MCP config snippets
    mcp-snippet.tsx
  mcp/                      # MCP server (separate entry point)
    server.ts               # Stdio transport entry point
    http-server.ts          # HTTP transport + tool definitions
    format.ts               # Response formatting
  hooks/                    # React hooks (useCalendar, useBlocks, etc.)
  lib/                      # Shared utilities
    types.ts
    api-client.ts
    type-colors.ts
supabase/
  migrations/               # SQL migration files
  seed.sql                  # Seed data
```
