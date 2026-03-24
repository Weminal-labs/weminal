# Feature: Database & API

> **Status:** `draft`
> **Phase:** v1 — Phase 1
> **Last updated:** 2026-03-25

---

## Summary

Set up Supabase PostgreSQL database with the `opportunities` table, two enum types, indexes, and RLS. Build Hono REST API with full CRUD, filtering by type/status/organization/chain, search, pagination. Validate all inputs with Zod. This is the core backend that both MCP server and web UI consume.

---

## Users

- **Web UI** — consumes the REST API for all data operations
- **MCP Server** — shares Supabase client and Zod schemas, queries database directly
- **Developer** — uses seed data and health check during development

---

## User Stories

- As a **web user**, I want to browse opportunities filtered by type so that I can focus on hackathons, grants, fellowships, or bounties separately
- As a **web user**, I want to search opportunities by name and description so that I can find specific ones quickly
- As a **Claude agent**, I want to query opportunities with structured filters so that I can answer natural language questions about the pipeline
- As a **developer**, I want validated API responses with consistent error format so that I can build reliable consumers

---

## Behaviour

### Happy Path

1. Client sends GET /api/v1/opportunities?type=grant&status=evaluating
2. Hono route parses query with Zod listQuerySchema
3. Query builder constructs Supabase query with type and status filters
4. Supabase returns paginated results
5. API returns `{ data: [...], pagination: {...} }`

### Edge Cases & Rules

- Missing required fields on POST → 400 with Zod error details
- Invalid type or status enum value → 400 with clear error message
- Non-existent UUID on GET/PATCH/DELETE → 404
- Empty filter values → return all results (no filter applied)
- Empty blockchains/tags arrays → valid, stored as `{}`
- Null dates → valid, dates are optional for all types
- FTS on short names may be imprecise → supplement with ILIKE fallback if needed

---

## Connections

- **Depends on:** Supabase project (external)
- **Consumed by:** Web frontend (Phase 3), MCP server (Phase 2)
- **Shares code with:** MCP server (Supabase client, Zod schemas, query builder)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Deletes | Hard delete | Soft delete with deleted_at |
| Auth | service_role only | User auth with RLS per user |
| Rate limiting | In-memory | Redis-backed (Upstash) |
| Real-time | None | Supabase Realtime subscriptions |

---

## Security Considerations

- All inputs validated with Zod before reaching Supabase
- Supabase JS client uses parameterized queries (no raw SQL)
- RLS enabled with no anon policies
- service_role key in .env only, never committed
- CORS restricted to known origins
- Type and status enums enforced at both Zod and database level
- Error responses don't expose internal details

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T1 | `[x]` | Init Next.js project with TypeScript, Tailwind, pnpm; install hono, @supabase/supabase-js, zod |
| T2 | `[x]` | Create .env.example with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY |
| T3 | `[x]` | Set up directory structure (src/api/, src/app/api/[...route]/, supabase/) |
| T4 | `[x]` | Write migration SQL: enums + opportunities table + indexes + trigger + RLS |
| T5 | `[x]` | Create Supabase client singleton (service_role key) |
| T6 | `[x]` | Define Zod schemas (createOpportunitySchema, updateOpportunitySchema, listQuerySchema, linkSchema) |
| T7 | `[x]` | Build dynamic query builder with all filters (type, status, org, chain, tag, date, FTS, sort, pagination) |
| T8 | `[x]` | Implement GET /opportunities (list with filters + pagination) |
| T9 | `[x]` | Implement GET /opportunities/:id |
| T10 | `[x]` | Implement POST /opportunities (name + type required) |
| T11 | `[x]` | Implement PATCH /opportunities/:id |
| T12 | `[x]` | Implement DELETE /opportunities/:id |
| T13 | `[x]` | Implement meta endpoints (types, statuses, blockchains, tags, organizations) |
| T14 | `[x]` | Implement GET /health endpoint |
| T15 | `[x]` | Add error handling middleware (Zod errors, Supabase errors, unknown errors) |
| T16 | `[x]` | Add request logger middleware |
| T17 | `[x]` | Add CORS middleware |
| T18 | `[x]` | Mount Hono app in Next.js catch-all route |
| T19 | `[x]` | Write seed data SQL (25-30 opportunities across all 4 types) |
| T20 | `[x]` | Manual API testing (all endpoints, filters, error cases) |

---

## User Acceptance Tests

**UAT Status:** `pending`
**Last tested:** —
**Outcome:** —

## Open Questions

- [ ] Whether to use ILIKE fallback for short FTS queries

---

## Notes

- Phase 1 is the foundation — Phase 2 (MCP) and Phase 3 (Web) both depend on it
- Supabase project needs to be created manually (or via CLI) before running migrations

---

## Archive
