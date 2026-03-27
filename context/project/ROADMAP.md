# Roadmap

> Generated from plan phases. Timeline: ~4 weeks total.

## v1 — Core (MVP)

### Phase 1: Database & API (Week 1)

- Supabase PostgreSQL setup — enums, table, indexes, trigger, RLS
- Hono REST API with full CRUD
- Zod validation schemas (create, update, list query)
- Dynamic query builder with type/status/org/chain/tag/date/FTS filters
- Meta endpoints (types, statuses, blockchains, tags, organizations)
- Health check endpoint
- Error handling + request logging middleware
- CORS middleware
- Seed data (25-30 opportunities across all 4 types)

### Phase 2: MCP Server (Week 2) — parallel with Phase 3

- MCP server with @modelcontextprotocol/sdk
- 5 tools: opportunity_list, opportunity_get, opportunity_create, opportunity_update, opportunity_delete
- 4 resources: types, statuses, blockchains, tags
- stdio transport
- Response formatting (pretty-print, summaries, 50KB limit)
- Error handling for all tool calls
- Build script (esbuild bundle)
- Claude Code configuration example

### Phase 3: Web Frontend (Weeks 2-3) — parallel with Phase 2

- shadcn/ui setup + TanStack Table + TanStack Query
- API client with fetch wrapper
- TypeBadge component (hackathon=blue, grant=green, fellowship=purple, bounty=orange)
- Column definitions with type and organization columns
- FilterBar: type (prominent), status, organization, blockchain, tag, search
- URL state sync with nuqs
- Inline cell editing with optimistic updates
- Create opportunity dialog with type selector
- Delete confirmation dialog
- Detail/expanded view with type-specific labels
- Loading skeletons, empty states, toast notifications
- Responsive card layout for mobile
- Column visibility toggle

### Phase 4: Deployment & Polish (Week 4)

- Vercel deployment with environment variables
- Rate limiting middleware (100 req/min per IP)
- Production CORS + security headers
- Security audit (inputs, secrets, error messages)
- Performance review (Lighthouse, API latency)
- MCP server bundle + distribution
- GitHub Actions CI (lint + typecheck)
- Documentation (README, API reference, MCP setup, deployment)
- End-to-end testing (web + MCP, all 4 types)
- Cross-browser + mobile testing

### Phase 5: Hacker Calendar (1.5 weeks) — COMPLETE

- 3 new Supabase tables: calendar_blocks, milestones, proposals (FK to opportunities) ✓
- Calendar API: blocks CRUD with date range, milestones CRUD, proposals GET/PUT ✓
- MCP tools: milestone_list, milestone_create, proposal_get, proposal_update ✓
- Week view — 7-column CSS grid with AM/PM slots, date-fns math ✓
- Month view — 4-month compact grid ✓
- Opportunity sidebar with drag & drop → create calendar blocks ✓
- Block moving within calendar (drag to different day/slot) ✓
- Detail panel: block editing, milestone list, proposal editor ✓
- Milestone timeline strip below calendar ✓
- Post-event notes (done/skipped status, learnings) ✓
- App header with /hack ↔ /calendar navigation ✓
- Homepage at / with navigation links ✓
- Mobile card list view for opportunities ✓
- MCP HTTP endpoint at /api/mcp (public read, authenticated write) ✓
- MCP Usage dialog with config snippets ✓
- Live deployment at weminal.vercel.app ✓

### Phase 6: Bootcamp Type (Upcoming)

- Add `bootcamp` to opportunity_type enum (5th type)
- New column: `parent_hackathon_id` UUID FK with constraint (bootcamp-only)
- Updated API filters: GET /opportunities?parent_hackathon_id=...
- API responses include joined `parent_hackathon_name`
- MCP tools updated: parent_hackathon_id arg for bootcamp CRUD
- Frontend: teal badge for bootcamp type
- Frontend: HackathonSelect dropdown in create/edit dialog when type = bootcamp
- Frontend: ParentHackathonChip display in table rows
- Frontend: Optional "Parent Hackathon" column (hidden by default)

## v1.1 — Polish

- Keyboard navigation (Cmd+K for search, arrow keys in table)
- Resizable columns
- Type filter quick-toggle buttons
- Smooth expand/collapse transitions
- Row hover highlighting
- Better FTS with ILIKE fallback for short names

## v2 — Expansion

- User auth with Supabase Auth (GitHub OAuth) + RLS per user
- Soft deletes with `deleted_at` column and archive view
- Real-time table updates via Supabase Realtime
- HTTP/SSE MCP transport for remote agent access
- Submission / deliverable tracking linked to opportunities
- Auto-discovery: scrape opportunity aggregator sites
- Calendar sync: export deadlines to Google Calendar / .ics
- Discord/Slack webhooks for status changes and approaching deadlines
- Analytics dashboard: reward trends, chain popularity, success rates by type
- Kanban view: visual pipeline board grouped by status or type
- Persistent rate limiting with Upstash Redis

## Backlog

- Mobile-native app
- Multi-tenancy
- Bulk import/export (CSV)
- API key auth for third-party consumers
