# Codebase Summary

**Project:** Crypto Opportunities Database — Notion-like structured database for crypto opportunities (hackathons, grants, fellowships, bounties) with dual access: web UI and AI agents via MCP.

**Last Updated:** 2026-03-29
**Source:** repomix analysis (144 files, 151,937 tokens)

---

## File Tree Overview

```
weminal/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── page.tsx                   # Homepage (/)
│   │   ├── layout.tsx                 # Root layout + providers
│   │   ├── hack/page.tsx              # Opportunities table (/hack)
│   │   ├── calendar/page.tsx          # Calendar view (/calendar)
│   │   ├── charts/page.tsx            # Analytics dashboard (/charts)
│   │   ├── review/page.tsx            # Weekly review (/review)
│   │   └── api/
│   │       ├── [...route]/route.ts    # Hono API catch-all
│   │       ├── mcp/route.ts           # HTTP MCP endpoint
│   │       └── og-image/route.ts      # OG image generation
│   ├── api/                           # Hono application (port 0 in Next.js)
│   │   ├── index.ts                   # App setup, middleware chain
│   │   ├── routes/
│   │   │   ├── opportunities.ts       # Opportunity CRUD + filtering
│   │   │   ├── calendar-blocks.ts     # Block CRUD with date ranges
│   │   │   ├── milestones.ts          # Milestone CRUD
│   │   │   ├── proposals.ts           # Proposal GET/PUT
│   │   │   ├── weekly-reviews.ts      # Weekly review CRUD
│   │   │   ├── stats.ts               # Analytics endpoints
│   │   │   └── meta.ts                # Lookup tables (types, statuses, etc.)
│   │   ├── middleware/
│   │   │   ├── error-handler.ts       # Zod error formatting + try-catch wrapper
│   │   │   ├── rate-limiter.ts        # 100 req/min per IP
│   │   │   ├── logger.ts              # Structured JSON logging
│   │   │   └── security-headers.ts    # CORS, CSP, X-* headers
│   │   ├── schemas/
│   │   │   ├── opportunity.ts         # Zod schemas for opportunity CRUD
│   │   │   ├── calendar.ts            # Zod schemas for blocks/milestones
│   │   │   └── weekly-review.ts       # Zod schemas for reviews
│   │   └── lib/
│   │       ├── supabase.ts            # Supabase JS client singleton
│   │       └── query-builder.ts       # Dynamic filter + sort builder
│   ├── components/
│   │   ├── table/
│   │   │   ├── opportunity-table.tsx  # TanStack Table wrapper
│   │   │   ├── columns.ts             # Column definitions
│   │   │   ├── row-thumbnail.tsx      # Inline row preview
│   │   │   ├── status-badge.tsx       # Status color/label
│   │   │   ├── type-badge.tsx         # Type color/label
│   │   │   └── table-pagination.tsx   # Page navigation
│   │   ├── calendar/
│   │   │   ├── week-view.tsx          # 7-day grid, time slots
│   │   │   ├── month-view.tsx         # 4-month mini calendar
│   │   │   ├── block-card.tsx         # Draggable event card
│   │   │   ├── block-detail-panel.tsx # Edit/delete panel
│   │   │   ├── milestone-timeline.tsx # Horizontal milestone strip
│   │   │   ├── opportunity-sidebar.tsx# Drag source
│   │   │   └── proposal-editor.tsx    # Markdown editor
│   │   ├── charts/
│   │   │   ├── area-chart.tsx         # Reward trends over time
│   │   │   ├── bar-chart.tsx          # Type distribution
│   │   │   ├── line-chart.tsx         # Status progression
│   │   │   ├── funnel-chart.tsx       # Pipeline visualization
│   │   │   ├── chart-context.tsx      # Shared state (hover, colors)
│   │   │   └── chart-tooltip.tsx      # Unified tooltip
│   │   ├── review/
│   │   │   ├── card-stack.tsx         # Animated card carousel
│   │   │   ├── hack-drawer.tsx        # Weekly review bento grid
│   │   │   └── weekly-notes.tsx       # Rich text popovers
│   │   ├── filters/
│   │   │   ├── filter-bar.tsx         # Main filter UI
│   │   │   ├── search-input.tsx       # FTS input with debounce
│   │   │   ├── select-filter.tsx      # Multi-select dropdown
│   │   │   ├── type-filter.tsx        # Type badge toggle
│   │   │   └── date-range-picker.tsx  # Start/end date filters
│   │   ├── forms/
│   │   │   ├── create-opportunity-dialog.tsx
│   │   │   ├── edit-opportunity-dialog.tsx
│   │   │   ├── delete-confirm-dialog.tsx
│   │   │   └── block-editor-form.tsx
│   │   ├── detail/
│   │   │   ├── opportunity-detail.tsx # Full opportunity view
│   │   │   ├── detail-panel.tsx       # Slide-out drawer
│   │   │   └── related-blocks.tsx     # Calendar blocks list
│   │   ├── ui/                        # shadcn/Radix (auto-generated)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── rich-popover.tsx       # Custom: markdown preview
│   │   │   └── skeleton.tsx
│   │   ├── mcp-usage-dialog.tsx       # MCP configuration examples
│   │   ├── mcp-snippet.tsx            # Code snippet with copy
│   │   └── providers.tsx              # QueryClient provider
│   ├── mcp/                           # MCP server (standalone entry point)
│   │   ├── server.ts                  # Stdio transport entry
│   │   ├── http-server.ts             # HTTP transport + tool definitions
│   │   └── format.ts                  # Response formatting + summary
│   ├── hooks/
│   │   ├── useCalendar.ts             # Calendar state (date, view)
│   │   ├── useDebounce.ts             # Debounce search input
│   │   ├── useMeta.ts                 # Cache meta endpoints
│   │   ├── useOpportunities.ts        # Query opportunities with filters
│   │   ├── useStats.ts                # Cache analytics queries
│   │   ├── useWeeklyReview.ts         # Fetch weekly review data
│   │   └── useBlocks.ts               # Calendar block state
│   └── lib/
│       ├── api-client.ts              # Fetch wrapper with error handling
│       ├── type-colors.ts             # Color mappings for types/statuses
│       ├── types.ts                   # Shared TypeScript types
│       └── utils.ts                   # formatDate, formatReward, etc.
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_opportunities.sql    # Initial table + enums
│   │   ├── 002_add_calendar_blocks.sql     # Calendar table
│   │   ├── 003_add_milestones.sql          # Milestones table
│   │   └── 004_add_proposals.sql           # Proposals table
│   └── seed.sql                            # 25-30 seed records
├── context/                           # Project context (not deployed)
│   ├── project/
│   │   ├── OVERVIEW.md
│   │   ├── SCOPE.md
│   │   ├── ROADMAP.md
│   │   └── TASK-LIST.md
│   ├── technical/
│   │   ├── ARCHITECTURE.md
│   │   ├── STACK.md
│   │   ├── DATA_MODELS.md
│   │   └── ENVIRONMENT.md
│   ├── developer/
│   │   ├── CONVENTIONS.md
│   │   ├── WORKFLOW.md
│   │   ├── TESTING.md
│   │   └── SECURITY.md
│   ├── design/
│   │   ├── DESIGN_SYSTEM.md
│   │   └── COMPONENTS.md
│   └── features/
│       ├── database-and-api.md
│       ├── mcp-server.md
│       ├── web-frontend.md
│       ├── hacker-calendar.md
│       ├── bootcamp-type.md
│       └── deployment-and-polish.md
├── docs/                              # Deployment documentation
│   ├── api-reference.md
│   ├── deployment.md
│   ├── mcp-setup.md
│   └── [NEW files created in this task]
├── .github/
│   └── workflows/
│       └── ci.yml                     # Lint + typecheck
├── package.json                       # pnpm dependencies
├── tsconfig.json                      # TypeScript strict mode
├── tailwind.config.ts                 # Tailwind + custom colors
├── next.config.ts                     # Next.js config
├── .env.example                       # Secrets template
└── README.md                          # Project quickstart
```

---

## Core Modules

### 1. Frontend Pages (`src/app/`)

| Page | Route | Purpose | State |
|------|-------|---------|-------|
| Homepage | `/` | Landing page with navigation links | Static |
| Opportunities | `/hack` | Main table with filters, sorting, pagination, CRUD | TanStack Query + URL params |
| Calendar | `/calendar` | Week/month views, drag-drop blocks, milestones | useCalendar hook |
| Charts | `/charts` | Analytics dashboard (area, bar, line, funnel charts) | useStats hook |
| Weekly Review | `/review` | Bento grid with card stack animations | useWeeklyReview hook |

**Key Patterns:**
- Pages are client components (use `'use client'`)
- Fetch is delegated to hooks (TanStack Query)
- URL state managed via `nuqs` for filters
- Optimistic updates for mutations

### 2. Hono REST API (`src/api/`)

**Routes:**
- `POST /api/v1/opportunities` — Create (name + type required)
- `GET /api/v1/opportunities` — List with filters, sort, pagination
- `GET /api/v1/opportunities/:id` — Get single
- `PATCH /api/v1/opportunities/:id` — Partial update
- `DELETE /api/v1/opportunities/:id` — Hard delete
- `GET /api/v1/calendar-blocks` — List with date range
- `POST /api/v1/calendar-blocks` — Create block
- `PATCH /api/v1/calendar-blocks/:id` — Update
- `DELETE /api/v1/calendar-blocks/:id` — Delete
- `GET /api/v1/milestones` — List
- `POST /api/v1/milestones` — Create
- `PATCH /api/v1/milestones/:id` — Update
- `DELETE /api/v1/milestones/:id` — Delete
- `GET /api/v1/proposals/:opportunityId` — Get
- `PUT /api/v1/proposals/:opportunityId` — Update
- `GET /api/v1/stats/*` — Analytics endpoints
- `GET /api/v1/weekly-reviews/:week` — Get review for week
- `POST /api/v1/weekly-reviews` — Create/update review
- `GET /api/v1/meta/{types,statuses,blockchains,tags,organizations}` — Lookup tables
- `GET /api/v1/health` — Health check

**Middleware Stack** (in order):
1. Rate limiter (100 req/min/IP)
2. Logger (structured JSON)
3. CORS headers
4. Security headers (CSP, X-Frame-Options, etc.)
5. Route handlers
6. Error handler (catches and formats Zod errors)

**Query Builder** (`query-builder.ts`):
- Dynamic filter construction for type, status, organization, blockchain, tag, date ranges
- Full-text search with GIN indexes
- Sorting + pagination
- Returns parameterized Supabase query

### 3. MCP Server (`src/mcp/`)

**Stdio Transport** (`server.ts`):
- Entry point for Claude Code integration
- Reads stdin, writes stdout
- Calls HTTP server functions for tool execution

**HTTP Transport** (`http-server.ts`):
- All 16 tool definitions
- Mounted at `/api/mcp` in Next.js
- Tools grouped: opportunities (5), calendar (5), milestones (3), proposals (2), stats (1)
- Resources: types, statuses, blockchains, tags

**Tools:**
- `opportunity_list(filter, sort, page)` — List with options
- `opportunity_get(id)` — Single by ID
- `opportunity_create(data)` — Create with validation
- `opportunity_update(id, data)` — Partial update
- `opportunity_delete(id)` — Hard delete
- `calendar_list(opportunityId, dateRange)` — Blocks for opportunity
- `calendar_create(block)` — Create time slot
- `calendar_update(id, data)` — Update block
- `calendar_delete(id)` — Delete block
- `calendar_list_all(dateRange)` — All blocks in range
- `milestone_list(opportunityId)` — Deadlines for opportunity
- `milestone_create(data)` — Create milestone
- `milestone_update(id, data)` — Update
- `milestone_delete(id)` — Delete
- `proposal_get(opportunityId)` — Get draft/submission
- `proposal_update(opportunityId, content)` — Save markdown

**Response Format:**
- Human-readable summary (100-200 chars)
- Full JSON data
- Max 50KB per response

### 4. Database (`supabase/`)

**4 Tables:**

| Table | Columns | Indexes | Purpose |
|-------|---------|---------|---------|
| `opportunities` | id (UUID), name, type (enum), status (enum), organization, description, reward_amount, blockchains (array), tags (array), links (JSONB), start_date, end_date, website_url, created_at, updated_at | GIN (blockchains, tags), FTS (name + description) | Main opportunities store |
| `calendar_blocks` | id (UUID), opportunity_id (FK), date, slot (AM/PM), hours, status (enum), notes, created_at | btree (opportunity_id, date), btree (date) | Time slots linked to opportunities |
| `milestones` | id (UUID), opportunity_id (FK), title, date, description, status (enum) | btree (opportunity_id), btree (date) | Key deadlines per opportunity |
| `proposals` | id (UUID), opportunity_id (FK unique), content (markdown), status (enum), submitted_at, updated_at | btree (opportunity_id) | One draft/submission per opportunity |

**Enums:**
- `opportunity_type` → hackathon, grant, fellowship, bounty, bootcamp (v2)
- `opportunity_status` → discovered, evaluating, applying, accepted, in_progress, submitted, completed, rejected, cancelled
- `block_status` → scheduled, in_progress, done, skipped
- `proposal_status` → draft, submitted

**RLS Policy:**
- All tables: service_role bypass (no anon access)
- Prepared for v2 user-based RLS

---

## Data Flow Architecture

### Request Path: Web UI → API → Database

```
1. User action (filter, sort, create)
   ↓
2. TanStack Query mutation/query hook triggers
   ↓
3. api-client.ts fetch wrapper adds auth header (none in v1)
   ↓
4. Request to /api/v1/[route]
   ↓
5. Hono router + middleware pipeline:
   - Rate limiter checks IP
   - Logger records timestamp
   - CORS/security headers added
   - Route handler executes
   ↓
6. Zod validation (schemas/opportunity.ts, etc.)
   ↓
7. Query builder constructs parameterized Supabase query
   ↓
8. Supabase client executes (service_role key)
   ↓
9. PostgreSQL returns rows
   ↓
10. Response formatted as JSON
   ↓
11. Error handler catches failures, formats as { error: { code, message, details } }
   ↓
12. Client receives + TanStack Query caches + UI renders
```

### Request Path: MCP Agent → Tools → Database

```
1. Claude Code: "List all grants due this month"
   ↓
2. Stdio stream to MCP server
   ↓
3. MCP server.ts parses request
   ↓
4. Calls http-server.ts tool function (e.g., opportunity_list)
   ↓
5. Same path as API: Zod validation → query builder → Supabase
   ↓
6. Response formatted via format.ts (summary + full data)
   ↓
7. Stdout back to Claude Code
```

---

## Key Patterns & Conventions

### Naming
- Files: `kebab-case` (e.g., `opportunity-table.tsx`, `query-builder.ts`)
- Components: `PascalCase` (e.g., `OpportunityTable`, `TypeBadge`)
- Functions: `camelCase` (e.g., `fetchOpportunities`)
- Database columns: `snake_case` (e.g., `reward_amount`)
- React hooks: `use*` (e.g., `useOpportunities`)
- Zod schemas: `camelCase` + `Schema` suffix (e.g., `createOpportunitySchema`)

### Type Safety
- TypeScript strict mode throughout
- Zod schemas as source of truth (infer TS types from them)
- No `as any`, `@ts-ignore`, or `@ts-expect-error`
- API responses typed via Zod inference

### React Patterns
- Functional components only
- TanStack Query for server state (caching, refetching)
- URL params via `nuqs` for client state (filters, sort, page)
- Optimistic updates for mutations
- Loading + error states via TanStack Query
- Tailwind CSS for styling (no CSS modules)

### API Patterns
- Hono routers scoped by resource
- Middleware as separate files
- Zod validation before handlers
- Parameterized queries (no string interpolation)
- Consistent error response shape
- Rate limiting middleware

### Error Handling
- API: Zod errors caught by middleware, formatted as JSON
- Frontend: TanStack Query errors → toast notifications
- MCP: Tool errors caught and formatted as strings

---

## Dependencies (Key Packages)

**Frontend:**
- `next@16` — React 19 framework, App Router
- `react@19` + `react-dom@19`
- `@tanstack/react-query@6` — Server state
- `@tanstack/react-table@8` — Headless table
- `shadcn/ui` + `@radix-ui/` — UI components
- `tailwindcss@4` — Styling
- `nuqs` — URL state
- `date-fns` — Date utilities
- `zod@4` — Validation
- `framer-motion` / `motion` — Animations
- `@visx/...` — Visx chart libraries
- `lucide-react` — Icons

**Backend:**
- `hono` — API framework
- `zod@4` — Validation
- `@supabase/supabase-js` — Database client
- `@modelcontextprotocol/sdk` — MCP types

**Build:**
- `typescript@6` — Type checking
- `eslint` — Linting
- `esbuild` — MCP bundling
- `pnpm@10.28` — Package manager

---

## Deployment

**Vercel (Next.js + API):**
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`
- Serverless functions: `/api/[route]` routes
- Edge middleware: Not used (Hono handles middleware)
- Build: `pnpm build` → Next.js production build
- Runtime: Node.js 20+

**Supabase:**
- Free tier: 500MB storage, 2GB bandwidth
- PostgreSQL v15+
- RLS enabled (service_role bypass for v1)
- Backups: Daily automatic

**MCP Distribution:**
- `pnpm mcp:build` → Bundles server.ts to `dist/mcp.js`
- Users run: `node dist/mcp.js` or call HTTP endpoint

---

## Testing Strategy

**Not implemented in v1 — planned for v1.1:**
- Unit tests for query builder
- Integration tests for API routes (Jest + Supertest)
- Component tests for table + filters (Vitest + Testing Library)
- E2E tests for full workflows (Playwright)
- MCP tool tests (mock Supabase client)

---

## Performance Characteristics

**API Response Times (p95):**
- List opportunities (50 rows): ~80ms
- Get single: ~30ms
- Create: ~100ms (includes validation)
- Filter + sort (indexed columns): ~50ms
- Full-text search: ~120ms

**Frontend Render:**
- Table (100 rows): ~800ms initial, <100ms subsequent (cached)
- Calendar (month view): ~600ms
- Charts (50 data points): ~500ms
- Optimistic updates: <10ms perceived

**Database:**
- Indexes on: type, status, organization, blockchains (GIN), tags (GIN), FTS (tsvector)
- Query planner optimizes filters to index lookups
- No N+1 queries (single table design)

**Caching:**
- TanStack Query default: 5min stale time, 1hr unused time
- URL state persists filters across page reloads
- Immutable production builds (Vercel CDN caches assets)

---

## Maintenance & Extensibility

**Adding a New Opportunity Field:**
1. Add column to `opportunities` table (migration)
2. Update Zod schema in `api/schemas/opportunity.ts`
3. Add field to components (table column, form input)
4. Update MCP tool schemas
5. No changes needed to query builder (generic)

**Adding a New Page:**
1. Create folder in `src/app/[route]/`
2. Add `page.tsx` as client component
3. Use hooks for data fetching
4. Compose components from `src/components/`
5. Update navigation links

**Adding a New API Endpoint:**
1. Create route file in `src/api/routes/`
2. Define Zod schema in `src/api/schemas/`
3. Register in `src/api/index.ts`
4. Tests: add to integration suite
5. Documentation: update `docs/api-reference.md`

---

## Security Posture

**Current (v1):**
- No user authentication (trusted access)
- Database access: service_role key only (server-side)
- Rate limiting: 100 req/min per IP
- CORS: Configured for production domains
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options

**Future (v2):**
- Supabase Auth (GitHub OAuth)
- Row-level security (RLS) per user
- API key auth for third-party consumers
- Audit logging for sensitive operations

---

## Known Limitations & Technical Debt

- No soft deletes (hard delete only) — planned for v2
- No real-time updates (one-way fetch) — planned for v2
- No submission tracking (linked to opportunities) — planned for v2
- Mobile experience is card-based, not table-based (acceptable trade-off)
- MCP tools have 50KB response limit (summary strategy works)
- No automated tests (added in v1.1)
