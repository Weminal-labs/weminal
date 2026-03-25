# Task List

> The single source of truth for what needs to be done.
> Updated by Claude after every meaningful piece of work.
> Each task links to the feature file it belongs to.
>
> **Status keys:**
> `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` blocked · `[>]` deferred

---

## How Tasks Are Numbered

Tasks are numbered globally across the whole project: T1, T2, T3...
They never get renumbered — a completed task keeps its number forever.
This means you can reference "T12" in a commit message or conversation and
it always points to the same thing.

---

## Active Sprint

Tasks currently being worked on or up next.

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|
| T20 | `[x]` | Manual API testing (all endpoints, filters, error cases) | [database-and-api](../features/database-and-api.md) | All 14 tests passing |

---

## Backlog

Tasks that are planned but not started yet. Ordered by priority.

### Phase 1: Database & API

(All code tasks complete — T20 manual testing remains)

### Phase 2: MCP Server

(All tasks complete — T21-T37)

### Phase 3: Web Frontend

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|
| T49 | `[>]` | Build EditableCell component | [web-frontend](../features/web-frontend.md) | Deferred to v1.1 |
| T56 | `[>]` | Implement responsive card layout for mobile | [web-frontend](../features/web-frontend.md) | Deferred to v1.1 |
| T57 | `[ ]` | Add column visibility toggle | [web-frontend](../features/web-frontend.md) | |
| T58 | `[ ]` | Match Figma design tokens | [web-frontend](../features/web-frontend.md) | |

### Phase 4: Deployment & Polish

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|
| T59 | `[ ]` | Set up Vercel project and connect GitHub repo | [deployment-and-polish](../features/deployment-and-polish.md) | Needs Vercel account |
| T60 | `[ ]` | Configure production environment variables | [deployment-and-polish](../features/deployment-and-polish.md) | Needs Vercel |
| T61 | `[ ]` | Deploy initial build to Vercel | [deployment-and-polish](../features/deployment-and-polish.md) | Needs Vercel |
| T77 | `[ ]` | Run launch checklist | [deployment-and-polish](../features/deployment-and-polish.md) | After deploy |
| T75 | `[ ]` | Cross-browser testing | [deployment-and-polish](../features/deployment-and-polish.md) | |
| T76 | `[ ]` | Mobile responsive testing | [deployment-and-polish](../features/deployment-and-polish.md) | |
| T77 | `[ ]` | Run launch checklist | [deployment-and-polish](../features/deployment-and-polish.md) | |

### Phase 5: Hacker Calendar

| # | Status | Task | Feature | Notes |
|---|--------|------|---------|-------|
| T78 | `[ ]` | Create migration: calendar_blocks table | [hacker-calendar](../features/hacker-calendar.md) | |
| T79 | `[ ]` | Create migration: milestones table | [hacker-calendar](../features/hacker-calendar.md) | |
| T80 | `[ ]` | Create migration: proposals table | [hacker-calendar](../features/hacker-calendar.md) | |
| T81 | `[ ]` | Seed milestones for existing opportunities | [hacker-calendar](../features/hacker-calendar.md) | |
| T82 | `[ ]` | Zod schemas for blocks, milestones, proposals | [hacker-calendar](../features/hacker-calendar.md) | |
| T83 | `[ ]` | API routes: /calendar/blocks CRUD | [hacker-calendar](../features/hacker-calendar.md) | |
| T84 | `[ ]` | API routes: milestones CRUD | [hacker-calendar](../features/hacker-calendar.md) | |
| T85 | `[ ]` | API routes: proposals GET/PUT/DELETE | [hacker-calendar](../features/hacker-calendar.md) | |
| T86 | `[ ]` | MCP tools: milestone_list, milestone_create | [hacker-calendar](../features/hacker-calendar.md) | |
| T87 | `[ ]` | MCP tools: proposal_get, proposal_update | [hacker-calendar](../features/hacker-calendar.md) | |
| T88 | `[ ]` | Install date-fns | [hacker-calendar](../features/hacker-calendar.md) | |
| T89 | `[ ]` | CalendarPage /calendar route + header | [hacker-calendar](../features/hacker-calendar.md) | |
| T90 | `[ ]` | WeekView — CSS grid with AM/PM slots | [hacker-calendar](../features/hacker-calendar.md) | |
| T91 | `[ ]` | MonthView — 4-month compact grid | [hacker-calendar](../features/hacker-calendar.md) | |
| T92 | `[ ]` | BlockCard component | [hacker-calendar](../features/hacker-calendar.md) | |
| T93 | `[ ]` | OpportunitySidebar (draggable) | [hacker-calendar](../features/hacker-calendar.md) | |
| T94 | `[ ]` | DnD: sidebar → calendar (POST block) | [hacker-calendar](../features/hacker-calendar.md) | |
| T95 | `[ ]` | DnD: calendar → calendar (PATCH move) | [hacker-calendar](../features/hacker-calendar.md) | |
| T96 | `[ ]` | DetailPanel with block editing | [hacker-calendar](../features/hacker-calendar.md) | |
| T97 | `[ ]` | MilestoneList + AddMilestoneForm | [hacker-calendar](../features/hacker-calendar.md) | |
| T98 | `[ ]` | MilestoneTimeline strip | [hacker-calendar](../features/hacker-calendar.md) | |
| T99 | `[ ]` | ProposalEditor | [hacker-calendar](../features/hacker-calendar.md) | |
| T100 | `[ ]` | App header nav: /hack ↔ /calendar | [hacker-calendar](../features/hacker-calendar.md) | |
| T101 | `[ ]` | TanStack Query hooks for new data | [hacker-calendar](../features/hacker-calendar.md) | |
| T102 | `[ ]` | Empty states + loading skeletons | [hacker-calendar](../features/hacker-calendar.md) | |
| T103 | `[ ]` | Post-event re-noting (done/skipped) | [hacker-calendar](../features/hacker-calendar.md) | |

---

## Blocked

Tasks that can't proceed until something else is resolved.

| # | Task | Feature | Blocked by |
|---|------|---------|------------|
| — | — | — | — |

---

## Completed

Finished tasks — kept for reference and audit trail.

| # | Task | Feature | Completed |
|---|------|---------|-----------|
| T1 | Init Next.js project with TypeScript, Tailwind, pnpm; install deps | database-and-api | 2026-03-25 |
| T2 | Create .env.example | database-and-api | 2026-03-25 |
| T3 | Set up directory structure | database-and-api | 2026-03-25 |
| T4 | Write migration SQL (enums + table + indexes + trigger + RLS) | database-and-api | 2026-03-25 |
| T5 | Create Supabase client singleton | database-and-api | 2026-03-25 |
| T6 | Define Zod schemas | database-and-api | 2026-03-25 |
| T7 | Build dynamic query builder | database-and-api | 2026-03-25 |
| T8 | Implement GET /opportunities | database-and-api | 2026-03-25 |
| T9 | Implement GET /opportunities/:id | database-and-api | 2026-03-25 |
| T10 | Implement POST /opportunities | database-and-api | 2026-03-25 |
| T11 | Implement PATCH /opportunities/:id | database-and-api | 2026-03-25 |
| T12 | Implement DELETE /opportunities/:id | database-and-api | 2026-03-25 |
| T13 | Implement meta endpoints | database-and-api | 2026-03-25 |
| T14 | Implement GET /health | database-and-api | 2026-03-25 |
| T15 | Add error handling middleware | database-and-api | 2026-03-25 |
| T16 | Add request logger middleware | database-and-api | 2026-03-25 |
| T17 | Add CORS middleware | database-and-api | 2026-03-25 |
| T18 | Mount Hono in Next.js catch-all route | database-and-api | 2026-03-25 |
| T19 | Write seed data SQL (28 opportunities) | database-and-api | 2026-03-25 |
| T20 | Manual API testing (all 14 tests passing) | database-and-api | 2026-03-25 |
| T21 | Install @modelcontextprotocol/sdk + esbuild + tsx | mcp-server | 2026-03-25 |
| T22 | Create MCP server entry point with stdio transport | mcp-server | 2026-03-25 |
| T23 | Define all 5 tool schemas | mcp-server | 2026-03-25 |
| T24 | Implement opportunity_list tool handler | mcp-server | 2026-03-25 |
| T25 | Implement opportunity_get tool handler | mcp-server | 2026-03-25 |
| T26 | Implement opportunity_create tool handler | mcp-server | 2026-03-25 |
| T27 | Implement opportunity_update tool handler | mcp-server | 2026-03-25 |
| T28 | Implement opportunity_delete tool handler | mcp-server | 2026-03-25 |
| T29 | Implement response formatting (pretty-print, summaries, 50KB) | mcp-server | 2026-03-25 |
| T30 | Implement error handling for all tool calls | mcp-server | 2026-03-25 |
| T31 | Define 4 MCP resources | mcp-server | 2026-03-25 |
| T32 | Implement resource handlers | mcp-server | 2026-03-25 |
| T33 | Add build + dev scripts | mcp-server | 2026-03-25 |
| T34 | Create tsconfig.mcp.json | mcp-server | 2026-03-25 |
| T35 | Create Claude Code config example | mcp-server | 2026-03-25 |
| T36 | Test all MCP tools | mcp-server | 2026-03-25 |
| T37 | Test all resources and error cases | mcp-server | 2026-03-25 |
| T38 | Initialize shadcn/ui and install components | web-frontend | 2026-03-25 |
| T39 | Create API client with fetch wrapper | web-frontend | 2026-03-25 |
| T40 | Set up TanStack Query provider in layout | web-frontend | 2026-03-25 |
| T41 | Implement TanStack Query CRUD hooks | web-frontend | 2026-03-25 |
| T42 | Implement meta data hooks | web-frontend | 2026-03-25 |
| T43 | Build TypeBadge component | web-frontend | 2026-03-25 |
| T44 | Define column configuration | web-frontend | 2026-03-25 |
| T45 | Build OpportunityTable with TanStack Table | web-frontend | 2026-03-25 |
| T46 | Build FilterBar with all filters | web-frontend | 2026-03-25 |
| T47 | Build SearchInput with debounce | web-frontend | 2026-03-25 |
| T48 | Set up URL state sync with nuqs | web-frontend | 2026-03-25 |
| T50 | Build CreateOpportunityDialog | web-frontend | 2026-03-25 |
| T51 | Build DeleteConfirmDialog | web-frontend | 2026-03-25 |
| T52 | Build OpportunityDetail expanded view | web-frontend | 2026-03-25 |
| T53 | Add loading skeletons | web-frontend | 2026-03-25 |
| T54 | Add empty state | web-frontend | 2026-03-25 |
| T55 | Add toast notifications | web-frontend | 2026-03-25 |
| T62 | Implement rate limiting middleware | deployment-and-polish | 2026-03-25 |
| T63 | Configure production CORS | deployment-and-polish | 2026-03-25 |
| T64 | Add security response headers | deployment-and-polish | 2026-03-25 |
| T65 | Security audit (all checks pass) | deployment-and-polish | 2026-03-25 |
| T67 | Build and test MCP server bundle | deployment-and-polish | 2026-03-25 |
| T68 | Create Claude Code config example | deployment-and-polish | 2026-03-25 |
| T69 | Set up GitHub Actions CI | deployment-and-polish | 2026-03-25 |
| T70 | Write README.md | deployment-and-polish | 2026-03-25 |
| T71 | Write API reference docs | deployment-and-polish | 2026-03-25 |
| T72 | Write MCP setup guide | deployment-and-polish | 2026-03-25 |
| T73 | Write deployment guide | deployment-and-polish | 2026-03-25 |

---

## How to Add a Task

Claude adds tasks using this format:

```
| T[N] | `[ ]` | [What needs to be done — specific and actionable] | [context/features/feature-name.md](../features/feature-name.md) | [any notes] |
```

Rules:
- One task = one clear, completable action
- Link to the feature file if the task belongs to a feature
- Tasks that span multiple features get a note explaining the dependency
- "Implement @auth" is too vague — "Build login form with email/password validation" is a task
- When a task is done, move it to Completed — never delete tasks

---

## Task States

Claude updates task status automatically as work progresses:

| Symbol | Meaning | When to use |
|--------|---------|-------------|
| `[ ]` | Todo | Not started |
| `[~]` | In progress | Currently being worked on |
| `[x]` | Done | Completed and verified |
| `[-]` | Blocked | Waiting on something else |
| `[>]` | Deferred | Decided to push to later phase |
