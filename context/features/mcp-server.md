# Feature: MCP Server

> **Status:** `complete`
> **Phase:** v1 — Phase 2 + Phase 5 (HTTP endpoint, 16 tools)
> **Last updated:** 2026-03-26

---

## Summary

MCP server exposing 16 tools for opportunity, calendar block, milestone, and proposal CRUD. Supports lookup data as 6 resources. Two transports: stdio for local Claude Code integration, HTTP at `/api/mcp` for remote Claude Desktop access with Bearer token auth. Shares Supabase client and Zod schemas from Phase 1. Public read tools (list/get), authenticated write tools (create/update/delete).

---

## Users

- **Claude Code agent** — primary consumer, queries and manages opportunities via natural language
- **Developer** — tests MCP tools, configures Claude Code

---

## User Stories

- As a **Claude agent**, I want to list opportunities filtered by type so that I can answer "show me active grants on Ethereum"
- As a **Claude agent**, I want to create opportunities with type and name so that users can add new entries via chat
- As a **Claude agent**, I want to see valid types/statuses via MCP resources so that I know what enum values are allowed
- As a **developer**, I want clear Claude Code config examples so that I can set up the MCP server quickly

---

## Behaviour

### Happy Path

1. Claude Code spawns MCP server as stdio child process
2. User says "show me all grants in evaluating status"
3. Claude calls opportunity_list tool with type=grant, status=evaluating
4. Tool handler parses args with Zod, queries Supabase, formats response
5. Claude presents results in natural language

### Edge Cases & Rules

- Invalid type value → clear error: "Invalid type. Must be one of: hackathon, grant, fellowship, bounty"
- Response > 50KB → truncated with warning message
- Invalid UUID → "Opportunity with ID xxx not found"
- Missing required fields on create → Zod validation error
- Long descriptions in list results → truncated to first 200 chars

---

## Connections

- **Depends on:** Database & API (Phase 1) — shares Supabase client, Zod schemas, query builder
- **Shares data with:** Web frontend (same database)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Transport | stdio + HTTP/JSON-RPC | WebSocket, SSE |
| Auth | HTTP Bearer token | OAuth, JWT, webhook signatures |
| Rate limiting | None (stdio), global quota per IP (HTTP) | Per-user rate limiting with Upstash |
| Tools | 16 | + batch operations, search, export |

---

## Security Considerations

- service_role key from environment variable only
- No shell execution, no file system access from tools
- Zod validation on all tool inputs
- Tool responses limited to 50KB max
- No internal error details exposed in tool responses
- Type and status enums validated before query execution

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T21 | `[x]` | Install @modelcontextprotocol/sdk |
| T22 | `[x]` | Create MCP server entry point with stdio transport |
| T23 | `[x]` | Define all 5 tool schemas (list, get, create, update, delete) |
| T24 | `[x]` | Implement opportunity_list tool handler |
| T25 | `[x]` | Implement opportunity_get tool handler |
| T26 | `[x]` | Implement opportunity_create tool handler |
| T27 | `[x]` | Implement opportunity_update tool handler |
| T28 | `[x]` | Implement opportunity_delete tool handler |
| T29 | `[x]` | Implement response formatting (pretty-print, summaries, 50KB limit) |
| T30 | `[x]` | Implement error handling for all tool calls |
| T31 | `[x]` | Define 4 MCP resources (types, statuses, blockchains, tags) |
| T32 | `[x]` | Implement resource handlers |
| T33 | `[x]` | Add build script (esbuild bundle) and dev script (tsx watch) |
| T34 | `[x]` | Create tsconfig.mcp.json for MCP build |
| T35 | `[x]` | Create Claude Code config example |
| T36 | `[x]` | Test all tools via Claude Code (across all 4 types) |
| T37 | `[x]` | Test all resources and error cases |
| T104 | `[x]` | MCP HTTP endpoint at /api/mcp (POST JSON-RPC, GET info) |

---

## User Acceptance Tests

**UAT Status:** `pending`
**Last tested:** —
**Outcome:** —

## Open Questions

- [ ] Whether to use esbuild CJS or ESM output for the MCP bundle

---

## Notes

- Can run in parallel with Phase 3 (Web Frontend) after Phase 1 completes
- Tool descriptions must mention all 4 types so Claude knows when to use them

---

## Archive
