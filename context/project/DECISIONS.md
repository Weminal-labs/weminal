# Architecture Decision Log

> Log significant decisions here as they are made.
> Never delete entries — add a "superseded by" note instead.

---

## D1: Single table with type enum over separate tables per type

**Decision:** Use one `opportunities` table with an `opportunity_type` enum (`hackathon`, `grant`, `fellowship`, `bounty`) rather than separate tables.
**Date:** 2026-03-24
**Context:** Need to store 4 opportunity types with mostly overlapping fields.
**Options Considered:** (A) One table with type enum, (B) Separate table per type, (C) Table inheritance
**Rationale:** All 4 types share 95%+ of fields. Single table avoids JOINs, simplifies API, and enables cross-type queries. Type-specific semantics (what dates/rewards mean) handled at the application layer via labels.
**Consequences:** Adding a new type requires `ALTER TYPE ADD VALUE` migration. No type-specific columns — all types use the same schema.

---

## D2: Hono API mounted inside Next.js App Router

**Decision:** Use Hono as the API framework, mounted via a catch-all route in Next.js.
**Date:** 2026-03-24
**Context:** Need a REST API that deploys alongside the frontend.
**Options Considered:** (A) Hono in Next.js catch-all, (B) Separate Express server, (C) Next.js API routes directly
**Rationale:** Single deployment to Cloudflare Pages. Hono is lightweight, edge-compatible (critical for Cloudflare Workers runtime), and has better middleware than raw Next.js API routes. Well-documented pattern.
**Consequences:** API and frontend share the same Cloudflare Pages project and domain. Hono handles all `/api/v1/*` routing.

## D2a: Cloudflare Pages over Vercel

**Decision:** Deploy to Cloudflare Pages instead of Vercel.
**Date:** 2026-04-08 (migrated)
**Context:** Project started targeting Vercel but migrated to Cloudflare Pages for edge performance and cost.
**Options Considered:** (A) Cloudflare Pages + `@cloudflare/next-on-pages`, (B) Vercel
**Rationale:** Cloudflare Pages free tier is more generous, edge runtime is globally distributed, and aligns with the crypto/Web3 audience. Uses `@cloudflare/next-on-pages` adapter.
**Consequences:** All API routes must use edge-compatible APIs (no Node.js built-ins). Supabase connection must use Transaction pooler (port 6543, `?pgbouncer=true`) not the default 5432.

---

## D3: Supabase with service_role key only (no anon access)

**Decision:** Use Supabase JS client with `service_role` key server-side only. No anon key exposed.
**Date:** 2026-03-24
**Context:** No user auth in v1 — single-tenant, trusted access.
**Options Considered:** (A) service_role only, (B) Anon key with permissive RLS
**Rationale:** Simplest security model for MVP. RLS enabled with no policies = no anon access. service_role bypasses RLS automatically. No risk of accidental data exposure.
**Consequences:** All database access must go through server-side API. No direct client-to-Supabase queries. Auth story requires revisiting this in v2.

---

## D4: JSONB for links as [{label, url}] array

**Decision:** Store links as JSONB array of `{label, url}` objects.
**Date:** 2026-03-24
**Context:** Opportunities have 2-5 related links (Discord, Twitter, application form, docs).
**Options Considered:** (A) JSONB array, (B) Separate `opportunity_links` table, (C) TEXT[] of URLs
**Rationale:** Low cardinality (2-5 links), no need for relational queries on links, JSONB preserves structure. Validated at API layer via Zod.
**Consequences:** No JOIN needed. GIN index on links column. Label information preserved alongside URL.

---

## D5: TanStack Table + shadcn/ui over AG Grid

**Decision:** Use TanStack Table v8 (headless) with shadcn/ui components.
**Date:** 2026-03-24
**Context:** Need a Notion-like table with inline editing, sorting, filtering.
**Options Considered:** (A) TanStack Table + shadcn, (B) AG Grid, (C) Custom table from scratch
**Rationale:** TanStack Table is headless — full rendering control for Notion-like UX. shadcn components are copy-paste and fully customizable. AG Grid has too many opinions about rendering.
**Consequences:** More custom code for table UI, but full control over design and behavior.

---

## D6: Type badge color system

**Decision:** hackathon=blue, grant=green, fellowship=purple, bounty=orange.
**Date:** 2026-03-24
**Context:** Need visual differentiation for the 4 opportunity types.
**Options Considered:** Various color combinations.
**Rationale:** Distinct hues, accessible contrast ratios, consistent with common crypto/tech UI patterns.
**Consequences:** Color mapping defined centrally in `type-colors.ts`. Used in table cells, cards, detail views, create form.

---

## D7: stdio MCP transport for v1

**Decision:** Use stdio transport only for the MCP server.
**Date:** 2026-03-24
**Context:** MCP server needs to work with Claude Code.
**Options Considered:** (A) stdio, (B) HTTP/SSE, (C) Both
**Rationale:** stdio is simplest for dev — Claude Code spawns the server as a child process. No network exposure, no auth needed. HTTP/SSE deferred to v2.
**Consequences:** MCP server runs locally only. Remote agent access requires v2 transport upgrade.

---

## D8: Hard deletes in v1

**Decision:** Use hard deletes (actual row deletion) in MVP.
**Date:** 2026-03-24
**Context:** Need delete functionality.
**Options Considered:** (A) Hard delete, (B) Soft delete with deleted_at
**Rationale:** Simplest implementation for MVP. No audit trail needed yet. Soft deletes add complexity (filtering, UI for archive, undelete).
**Consequences:** Deleted data is unrecoverable. Soft deletes planned for v2.

---

## D9: Status workflow generic across all types

**Decision:** Use a single status enum that applies to all opportunity types: discovered, evaluating, applying, accepted, in_progress, submitted, completed, rejected, cancelled.
**Date:** 2026-03-24
**Context:** Different opportunity types could have different workflows.
**Options Considered:** (A) Shared status enum, (B) Type-specific status sets
**Rationale:** The pipeline concept (discover -> evaluate -> apply -> work -> submit -> complete) applies to all 4 types. Keeps the UI and API simple. Some statuses may not apply to all types (e.g., bounties rarely have "applying") but this is handled by convention, not enforcement.
**Consequences:** No database-level enforcement of which statuses are valid for which types.

---

## D10: URL-persisted filters via nuqs

**Decision:** Use the `nuqs` library for type-safe URL search params.
**Date:** 2026-03-24
**Context:** Filter state should be shareable and survive page reloads.
**Options Considered:** (A) nuqs, (B) next/router searchParams manually, (C) Client-only state
**Rationale:** nuqs provides type-safe URL param parsing, works with Next.js App Router, and avoids boilerplate for syncing URL <-> component state.
**Consequences:** All filter state (including type[]) reflected in URL. Views are bookmarkable and shareable.

---
