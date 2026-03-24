# Project Overview

> Generated from project planning documents (proposal, PRD, architecture).

## What It Is

A Notion-like structured database for crypto opportunities — hackathons, grants, fellowships, and bounties — with dual access: a web UI and Claude agent via MCP (Model Context Protocol). A single Hono REST API backend serves both consumers. Built by Weminal Labs.

**Figma:** https://www.figma.com/design/6XUmigbtgLSSnTrKVsh6JY/weminal?node-id=250-1070

## The Problem

Crypto opportunity tracking is fragmented. Opportunities are spread across Notion, Google Sheets, Discord, and Twitter — causing duplicated effort and stale information. There is no structured API for opportunity metadata, so AI agents cannot query or update it. Manual status tracking across hackathons, grants, fellowships, and bounties means teams miss deadlines, lose grant applications, and forget bounty submissions. There is no unified view across all four opportunity types.

## The Solution

A unified opportunity database with three access layers:

1. **Web UI** — Notion-style table (TanStack Table + shadcn/ui) with type badges, inline editing, filters, sorting
2. **MCP Server** — 5 tools + 4 resources for Claude Code / AI agents via stdio transport
3. **REST API** — Hono on Vercel with full CRUD, filtering, search, Zod validation

All three layers talk to a single Supabase PostgreSQL database with one `opportunities` table covering all four types via a `type` enum.

## The User

**Primary: Web User (Opportunity Tracker)**
- Crypto developer tracking hackathons, grants, fellowships, and bounties
- Wants Notion-like experience — type badges, inline editing, quick filters
- Pain: manually checking Twitter, Discord, hackathon sites, grant platforms, bounty boards

**Secondary: Claude Agent**
- AI assistant operating via MCP tools
- Executes CRUD operations, answers natural language queries across all 4 types
- Pain: no structured API exists for cross-type opportunity data

## Opportunity Types

| Type | Description | Key Fields |
|------|-------------|------------|
| Hackathon | Competitive building events | start/end = event dates, reward = prize pool |
| Grant | Funding programs for projects | start = app open, end = deadline, reward = grant amount |
| Fellowship | Structured development programs | start/end = program dates, reward = stipend |
| Bounty | Task-based rewards | end = deadline, reward = bounty amount |

## Differentiator

- Dual-interface: both human (web table) and AI (MCP tools) access to the same data
- Single table design covering all 4 opportunity types with type-specific semantics
- Agent-friendly: Claude can query, create, update, and delete opportunities via natural language

## Success Metrics

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| MCP tool execution time | < 500ms |
| Web table render (100 rows) | < 1s |
| Database query time (filtered) | < 50ms |
| Uptime | 99.5% |
| Time from idea to deployed MVP | 4 weeks |
