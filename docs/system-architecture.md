# System Architecture

**Project:** Crypto Opportunities Database
**Deployment:** Vercel (Next.js + Hono) + Supabase (PostgreSQL)
**Last Updated:** 2026-03-29

---

## High-Level System Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                          Users                                  │
├────────────────────┬──────────────────────────────────────┬────┤
│  Web User (Human)  │  Claude Code (AI Agent)              │    │
│  Browser           │  Terminal                            │    │
└────────┬───────────┴──────────────────┬─────────────────┬─┘    │
         │                              │                 │       │
         │ HTTPS                        │ stdio or HTTP   │       │
         │ (fetch)                      │ (MCP)           │       │
         ▼                              ▼                 ▼       │
┌────────────────────────────────────────────────────────────────┐
│               Vercel (Edge + Serverless Functions)              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Application                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  React 19 Pages (Client Components)                      │  │
│  │  ├─ / (HomePage)                                         │  │
│  │  ├─ /hack (OpportunitiesTable)                           │  │
│  │  ├─ /calendar (CalendarView)                             │  │
│  │  ├─ /charts (AnalyticsDashboard)                         │  │
│  │  └─ /review (WeeklyReview)                               │  │
│  │                                                           │  │
│  │  api/[...route]/route.ts (Hono API Catch-All)            │  │
│  │  ├─ /api/v1/opportunities/* (CRUD)                       │  │
│  │  ├─ /api/v1/calendar-blocks/* (CRUD)                     │  │
│  │  ├─ /api/v1/milestones/* (CRUD)                          │  │
│  │  ├─ /api/v1/proposals/* (CRUD)                           │  │
│  │  ├─ /api/v1/stats/* (Analytics)                          │  │
│  │  ├─ /api/v1/meta/* (Lookup tables)                       │  │
│  │  ├─ /api/v1/health (Health check)                        │  │
│  │  └─ /api/v1/weekly-reviews/* (Reviews)                   │  │
│  │                                                           │  │
│  │  api/mcp/route.ts (HTTP MCP Endpoint)                    │  │
│  │  └─ /api/mcp (POST for tool calls)                       │  │
│  │                                                           │  │
│  │  api/og-image/route.ts (Social Media)                    │  │
│  │  └─ /api/og-image (OG image generation)                  │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ TCP/HTTP (HTTPS)
                     │ (Parameterized queries)
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
┌─────────────────────┐   ┌──────────────────┐
│  Supabase Cloud     │   │  Local Dev       │
│  (PostgreSQL)       │   │  (Same DB)       │
├─────────────────────┤   └──────────────────┘
│ opportunities table │
│ calendar_blocks     │
│ milestones          │
│ proposals           │
│                     │
│ Indexes:            │
│ - GIN (arrays)      │
│ - btree (dates)     │
│ - FTS (full-text)   │
│                     │
│ RLS Policies:       │
│ - service_role      │
│   bypass only       │
│                     │
│ Backups:            │
│ - Daily auto        │
│ - Point-in-time     │
└─────────────────────┘
```

---

## Request Flow Diagrams

### Web UI → API → Database (HTTPS)

```
1. Browser Action
   └─ User clicks "Create opportunity"
      └─ Form validation (Zod)
         └─ TanStack Query useMutation

2. HTTP Request
   └─ POST /api/v1/opportunities
      ├─ Headers: Content-Type: application/json
      └─ Body: { name, type, ... }

3. Hono Middleware Pipeline (in order)
   ├─ Rate Limiter (100 req/min per IP)
   ├─ Logger (structured JSON)
   ├─ CORS middleware (allow origin)
   ├─ Security Headers (CSP, X-Frame-Options)
   └─ Route Handler

4. Opportunity Route Handler
   ├─ Parse request body
   ├─ Validate with createOpportunitySchema (Zod)
   │  └─ If invalid → Error middleware catches → 400 VALIDATION_ERROR
   ├─ Supabase insert
   │  └─ INSERT INTO opportunities (name, type, ...)
   │     VALUES ($1, $2, ...) [Parameterized]
   └─ Return 201 + created record

5. Error Handler (catch-all middleware)
   ├─ Catches Zod errors → formatted response
   ├─ Catches DB errors (FK violations, etc) → formatted response
   └─ Catches unknown errors → 500 INTERNAL_ERROR

6. HTTP Response
   └─ { "data": { "id": "uuid", "name": "...", ... } }

7. Browser
   ├─ TanStack Query mutation resolves
   ├─ Optimistic update applied (or reverted if error)
   ├─ Success toast shown
   └─ UI re-renders with new record
```

### MCP Agent → Tools → Database (stdio or HTTP)

```
1. Claude Code Terminal
   └─ "List all grants due this month"

2. MCP Request via stdio
   └─ { "jsonrpc": "2.0", "method": "tools/call",
        "params": { "name": "opportunity_list",
                    "arguments": { "type": "grant", ... } } }

3. MCP Server (src/mcp/server.ts)
   ├─ Reads stdin
   ├─ Parses JSON-RPC request
   └─ Calls http-server.ts tool function

4. HTTP Server Tool Function (src/mcp/http-server.ts)
   ├─ Validate arguments with Zod
   ├─ Call Supabase client (same as API routes)
   │  └─ SELECT * FROM opportunities WHERE type = $1 AND end_date >= $2
   └─ Format response (format.ts)
      ├─ Summary (100-200 chars)
      └─ Full JSON data

5. Response Formatting (src/mcp/format.ts)
   ├─ Summarize results for Claude's context
   ├─ Enforce 50KB limit (truncate if needed)
   └─ Return as text + JSON

6. MCP Response via stdout
   └─ { "jsonrpc": "2.0", "result": "Grant 1: ...\nGrant 2: ..." }

7. Claude Code
   ├─ Receives response
   ├─ Interprets results
   └─ Generates follow-up actions or response to user
```

---

## Data Model

### Table: opportunities

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type opportunity_type NOT NULL,  -- ENUM: hackathon, grant, fellowship, bounty
  status opportunity_status NOT NULL DEFAULT 'discovered',  -- ENUM: 9 values
  organization TEXT,
  description TEXT,
  reward_amount NUMERIC,  -- in USD or native currency
  blockchains TEXT[],  -- Array: ['Ethereum', 'Polygon', ...]
  tags TEXT[],  -- Array: ['DeFi', 'Web3', ...]
  links JSONB,  -- { "website": "...", "twitter": "...", "github": "..." }
  start_date DATE,
  end_date DATE,
  website_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  CONSTRAINT check_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- Indexes
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_organization ON opportunities(organization);
CREATE INDEX idx_opportunities_blockchains ON opportunities USING GIN(blockchains);
CREATE INDEX idx_opportunities_tags ON opportunities USING GIN(tags);
CREATE INDEX idx_opportunities_start_date ON opportunities(start_date);
CREATE INDEX idx_opportunities_end_date ON opportunities(end_date);
CREATE INDEX idx_opportunities_fts ON opportunities USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

### Table: calendar_blocks

```sql
CREATE TABLE calendar_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot TEXT NOT NULL,  -- 'AM' or 'PM'
  hours INTEGER DEFAULT 4,  -- Duration in hours
  status TEXT DEFAULT 'scheduled',  -- ENUM: scheduled, in_progress, done, skipped
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calendar_blocks_opportunity_id ON calendar_blocks(opportunity_id);
CREATE INDEX idx_calendar_blocks_date ON calendar_blocks(date);
CREATE UNIQUE INDEX idx_calendar_blocks_unique_slot ON calendar_blocks(opportunity_id, date, slot);
```

### Table: milestones

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',  -- ENUM: pending, completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_milestones_opportunity_id ON milestones(opportunity_id);
CREATE INDEX idx_milestones_date ON milestones(date);
```

### Table: proposals

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL UNIQUE REFERENCES opportunities(id) ON DELETE CASCADE,
  content TEXT,  -- Markdown
  status TEXT DEFAULT 'draft',  -- ENUM: draft, submitted
  submitted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_proposals_opportunity_id ON proposals(opportunity_id);
```

### Enums

```sql
CREATE TYPE opportunity_type AS ENUM ('hackathon', 'grant', 'fellowship', 'bounty', 'bootcamp');

CREATE TYPE opportunity_status AS ENUM (
  'discovered',
  'evaluating',
  'applying',
  'accepted',
  'in_progress',
  'submitted',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE block_status AS ENUM ('scheduled', 'in_progress', 'done', 'skipped');

CREATE TYPE proposal_status AS ENUM ('draft', 'submitted');
```

---

## API Architecture

### Hono App Structure

```typescript
// src/api/index.ts
const app = new Hono();

// Middleware (applied globally, in order)
app.use(rateLimiterMiddleware);
app.use(loggerMiddleware);
app.use(cors());
app.use(securityHeadersMiddleware);

// Routes (mounted)
app.route('/opportunities', opportunitiesRouter);
app.route('/calendar-blocks', calendarBlocksRouter);
app.route('/milestones', milestonesRouter);
app.route('/proposals', proposalsRouter);
app.route('/meta', metaRouter);
app.route('/weekly-reviews', weeklyReviewsRouter);
app.route('/stats', statsRouter);

app.get('/health', healthCheckHandler);

// Error handler (catch-all)
app.onError(errorHandler);

export default app;
```

### Route Structure Example: Opportunities

```typescript
// src/api/routes/opportunities.ts
const router = new Hono();

// POST /opportunities
router.post('/', async (c) => {
  const body = createOpportunitySchema.parse(await c.req.json());
  const result = await createOpportunity(body);
  return c.json({ data: result }, 201);
});

// GET /opportunities
router.get('/', async (c) => {
  const filters = listOpportunitiesSchema.parse(c.req.query());
  const result = await queryBuilder.build(filters);
  const { data, total } = await supabase.from('opportunities')
    .select('*', { count: 'exact' })
    .apply(result.query);
  return c.json({
    data,
    pagination: { page: filters.page, per_page: filters.per_page, total }
  });
});

// GET /opportunities/:id
router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return c.json({ error: { code: 'NOT_FOUND' } }, 404);
  return c.json({ data });
});

// PATCH /opportunities/:id
router.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const updates = updateOpportunitySchema.parse(await c.req.json());
  const { data } = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return c.json({ data });
});

// DELETE /opportunities/:id
router.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await supabase.from('opportunities').delete().eq('id', id);
  return c.json({ success: true, deleted_id: id });
});

export default router;
```

---

## MCP Server Architecture

### Stdio Transport (Local Claude Code Integration)

```typescript
// src/mcp/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { httpServerTools } from './http-server.js';

const server = new Server({
  name: 'weminal-opportunities',
  version: '1.0.0',
});

// Register tools (from http-server.ts)
for (const tool of httpServerTools) {
  server.tool(tool.name, tool.description, tool.inputSchema, tool.execute);
}

// Register resources
server.resource('types', listTypesResource);
server.resource('statuses', listStatusesResource);
server.resource('blockchains', listBlockchainsResource);
server.resource('tags', listTagsResource);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP Transport (Remote Access via /api/mcp)

```typescript
// src/mcp/http-server.ts
export const httpServerTools = [
  {
    name: 'opportunity_list',
    description: 'List opportunities with filters',
    inputSchema: opportunityListSchema,
    execute: async (input) => {
      const result = await supabase
        .from('opportunities')
        .select('*')
        .eq('type', input.type)
        .range(0, 49);  // Max 50 results
      return formatResponse(result);
    }
  },
  // ... 15 more tools
];

// HTTP endpoint at /api/mcp
// src/app/api/mcp/route.ts
export async function POST(req: Request) {
  const { tool, input } = await req.json();
  const toolDef = httpServerTools.find((t) => t.name === tool);
  if (!toolDef) return json({ error: 'Unknown tool' }, 400);
  const result = await toolDef.execute(input);
  return json(result);
}
```

---

## Frontend Architecture

### Page Structure (Next.js App Router)

```
/ (HomePage)
  └─ Static content, navigation links

/hack (OpportunitiesTable)
  ├─ Client component (use 'use client')
  ├─ useOpportunities hook (TanStack Query)
  ├─ useQueryState for filters (nuqs)
  ├─ FilterBar component
  ├─ OpportunityTable component
  │  └─ TanStack Table v8 (headless)
  │     └─ Columns (type, status, reward, dates)
  │     └─ Sorting, pagination, row selection
  └─ CreateOpportunityDialog (form with Zod validation)

/calendar (CalendarView)
  ├─ Client component
  ├─ useCalendar hook (state management)
  ├─ MonthView (mini calendar + date navigation)
  ├─ WeekView (7-column grid, AM/PM slots)
  ├─ OpportunitySidebar (drag source)
  ├─ BlockCard components (draggable events)
  ├─ DetailPanel (edit/delete)
  └─ MilestoneTimeline (horizontal strip)

/charts (AnalyticsDashboard)
  ├─ useStats hook (TanStack Query)
  ├─ AreaChart (reward trends)
  ├─ BarChart (type distribution)
  ├─ LineChart (status progression)
  └─ FunnelChart (pipeline visualization)

/review (WeeklyReview)
  ├─ useWeeklyReview hook
  ├─ HackDrawer (bento grid layout)
  │  └─ Card stack (animated carousel)
  └─ RichPopover (notes with markdown)
```

### State Management

| State Type | Library | Location | Lifetime |
|------------|---------|----------|----------|
| Server state | TanStack Query | Hooks (useOpportunities, useStats) | Query stale time (5min) |
| Client state | URL params | nuqs hook | Browser session |
| UI state | React useState | Component | Re-render |
| Cache | TanStack Query | Memory | Configured by stale time |

### Data Flow: TanStack Query

```
User Action
  ↓
Mutation hook (useMutation)
  ├─ onMutate: optimistic update (instant feedback)
  ├─ mutationFn: API call (await)
  ├─ onSuccess: invalidate queries (refetch)
  └─ onError: revert optimistic (rollback)

Alternative: Query hook (useQuery)
  ├─ queryKey: includes filters (cache key)
  ├─ queryFn: API call with params
  └─ staleTime: 5min default (background refetch)
```

---

## Security Architecture

### Current (v1)

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| **Database** | service_role key only | No anon access; RLS policies disabled but present |
| **API** | Rate limiting (100 req/min/IP) | Middleware-based, memory (not persistent) |
| **API** | Input validation (Zod) | Prevent injection, malformed data |
| **API** | Parameterized queries | All Supabase queries use $1, $2 params (no string concat) |
| **API** | Security headers | CSP, X-Frame-Options, X-Content-Type-Options |
| **API** | CORS | Configured for production origins |
| **Frontend** | No auth required | All users see all data (v1 design decision) |
| **Deployment** | HTTPS only | Vercel enforces |
| **Secrets** | Environment variables | .env.local not committed; Vercel secrets |

### Future (v2)

```
┌─ Supabase Auth (GitHub OAuth)
├─ Row-Level Security (RLS) per user
├─ Soft deletes + archive view
├─ Audit logging for sensitive operations
├─ API key auth for third-party consumers
└─ Persistent rate limiting (Upstash Redis)
```

---

## Deployment Topology

### Vercel (Next.js + Hono)

```
Developer commits to main
  ↓
GitHub Actions CI
  ├─ Run ESLint
  ├─ Run TypeScript check
  └─ If passing → trigger Vercel deploy

Vercel Build
  ├─ pnpm install
  ├─ pnpm build (Next.js production build)
  └─ Deploy to edge + serverless functions

Production
  ├─ / → Served from CDN (static)
  ├─ /api/* → Serverless functions
  ├─ /hack → Streamed from edge
  └─ Assets → Vercel CDN (immutable)
```

### Supabase (PostgreSQL)

```
Vercel Functions
  ├─ Connection: TCP to Supabase Postgres
  ├─ Connection pooling: None (serverless stateless)
  └─ Auth: SUPABASE_SERVICE_ROLE_KEY

Database Backups
  ├─ Automatic daily snapshots
  ├─ Point-in-time recovery (14 days free tier)
  └─ Manual export available

RLS Policies (Prepared for v2)
  ├─ auth.uid() checks (disabled in v1)
  └─ service_role bypass (always allowed)
```

---

## Performance Characteristics

### API Latency Targets (p95)

| Endpoint | Query | Expected | Actual |
|----------|-------|----------|--------|
| `GET /opportunities` (list) | SELECT with filters + pagination | <200ms | ~80-100ms |
| `GET /opportunities/:id` | Single record lookup | <100ms | ~30-50ms |
| `POST /opportunities` | INSERT + validation | <300ms | ~100-150ms |
| `PATCH /opportunities/:id` | UPDATE + validation | <300ms | ~80-120ms |
| `DELETE /opportunities/:id` | DELETE | <150ms | ~50-80ms |
| `GET /meta/types` | Enum values (cached) | <50ms | ~10-20ms |
| `GET /opportunities?search=...` | FTS search | <500ms | ~120-200ms |

### Frontend Render Times

| Component | Initial | Cached | Notes |
|-----------|---------|--------|-------|
| OpportunityTable (100 rows) | ~800ms | ~100ms | Virtual scrolling planned v1.1 |
| CalendarView (month) | ~600ms | ~100ms | Memoized event cards |
| AnalyticsDashboard | ~500ms | ~50ms | Static visx charts |
| WeeklyReview | ~400ms | ~50ms | Card stack animations CSS-based |

### Caching Strategy

```
TanStack Query Default Configuration:
  ├─ staleTime: 5 minutes
  ├─ cacheTime (gcTime): 1 hour
  └─ refetchOnWindowFocus: true

URL State Persistence:
  ├─ nuqs serializes to query string
  ├─ Filters survive page reload
  └─ Shared links include filters

Database Indexes:
  ├─ Query planner optimizes to index lookups
  ├─ FTS uses GIN index (fast full-text search)
  └─ Array filters use GIN index (@> operator)
```

---

## Monitoring & Observability (v2)

```
Planned Metrics:
  ├─ Vercel Analytics (Core Web Vitals)
  ├─ Supabase Query Performance
  │  └─ Slow query log (>1s)
  ├─ Error Tracking
  │  └─ Sentry integration
  ├─ APM (Application Performance Monitoring)
  │  └─ Datadog or similar
  └─ User Analytics
     └─ PostHog or Plausible
```

---

## Scaling Strategy

### Current (v1)
- Single Vercel deployment
- Single Supabase database
- No database connection pooling
- No caching layer

### v1.5 (Load Testing Phase)
- Monitor Vercel function cold starts
- Test Supabase connection limits
- Profile database query times
- Benchmark chart rendering

### v2 (Scaling)
```
If API latency exceeds targets:
  ├─ Add Redis caching layer (Upstash)
  ├─ Implement query result caching
  └─ Consider Vercel Edge Middleware for filtering

If database CPU exceeds 80%:
  ├─ Migrate to Supabase Dedicated (from Free/Pro)
  ├─ Add read replicas (PostgreSQL)
  └─ Optimize slow queries (add indexes, rewrite)

If storage exceeds 500MB:
  └─ Archive old opportunities (soft delete)
```

---

## Development Environment

### Local Setup

```
Prerequisites:
  ├─ Node.js 20+
  ├─ pnpm 10.28
  ├─ Git
  └─ Supabase CLI (optional, for local DB)

Installation:
  ├─ git clone <repo>
  ├─ cd weminal
  ├─ pnpm install
  └─ cp .env.example .env.local

Environment Variables:
  ├─ SUPABASE_URL (from Supabase project)
  ├─ SUPABASE_SERVICE_ROLE_KEY (from Supabase settings)
  └─ ALLOWED_ORIGINS (optional, for prod CORS)

Database:
  ├─ Run migrations in Supabase SQL Editor
  ├─ Seed data (pnpm seed)
  └─ Local Postgres (optional, with Supabase CLI)

Development Server:
  ├─ pnpm dev (Next.js + Hono)
  ├─ http://localhost:3000 (app)
  ├─ http://localhost:3000/api/v1/health (health check)
  └─ pnpm mcp:dev (MCP server in watch mode)
```

---

## Disaster Recovery

### Data Backup
```
Supabase Backups:
  ├─ Automatic daily snapshots (free tier)
  ├─ Point-in-time recovery (14 days)
  └─ Manual export via Supabase dashboard

Recovery Procedure:
  1. Supabase dashboard → Backups tab
  2. Select snapshot
  3. Restore (creates new project)
  4. Update Vercel env var (SUPABASE_URL)
  5. Verify health check
```

### Code Backup
```
GitHub Repository:
  ├─ Default branch: main
  ├─ Protected branch rules (code review required)
  └─ Automated CI (lint + typecheck)

Recovery Procedure:
  1. git log --oneline (find commit)
  2. git revert <commit> (safe revert)
  3. OR git reset --hard <commit> (hard reset)
  4. git push origin main
```

---

## Known Limitations

- **No connection pooling:** Serverless functions open fresh connections
- **Hard deletes only:** No soft delete yet (v2 feature)
- **No real-time:** Polling only (Supabase Realtime v2 feature)
- **50KB MCP responses:** Agents see summaries, not full data
- **No auth:** All users see all data (v1 design)
- **No offline support:** Frontend requires network connectivity
- **Single-region:** Supabase default region only (no multi-region failover)

---

## Architecture Evolution

```
v1 (Current)
  └─ Single table, no auth, basic API

v1.1
  ├─ Keyboard navigation
  ├─ Automated tests
  └─ HTTP MCP transport

v2
  ├─ User auth (GitHub OAuth)
  ├─ Row-level security (RLS)
  ├─ Soft deletes + archive
  ├─ Real-time updates
  ├─ Webhooks (Discord, Slack)
  ├─ Analytics dashboard
  └─ Kanban view

v3+
  ├─ Multi-tenancy
  ├─ Mobile app
  ├─ White-label SaaS
  └─ Premium analytics
```

---

## Summary

The system is architected as a **stateless, serverless application** with:
1. **Vercel** hosting Next.js frontend + Hono API (single deployment)
2. **Supabase** database with GIN indexes and RLS ready
3. **Single table design** (opportunities with type enum)
4. **Dual interfaces** (web UI + MCP tools)
5. **Type-safe validation** (Zod everywhere)
6. **Zero vendor lock-in** (can export data anytime)

This design prioritizes **simplicity for v1**, with **clear paths to scale** in v2.
