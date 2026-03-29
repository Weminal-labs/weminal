# Project Overview & Product Development Requirements

**Project:** Weminal Labs Crypto Opportunities Database
**Status:** v1 Released, v1.1 in planning, v2 Roadmap created
**Last Updated:** 2026-03-29

---

## Executive Summary

A Notion-like structured database for tracking crypto opportunities (hackathons, grants, fellowships, bounties) with dual access: web UI for humans and MCP tools for AI agents. Single Hono REST API backend serves both. Deployed on Vercel + Supabase.

**Live:** https://weminal.vercel.app

---

## Problem Statement

### Current State
Crypto developers hunting opportunities face fragmentation:
- Opportunities scattered across Notion, Google Sheets, Discord, Twitter
- Four distinct opportunity types (hackathons, grants, fellowships, bounties) with no unified view
- No structured API — AI agents cannot programmatically access or update opportunity data
- Manual tracking across platforms → missed deadlines, lost applications, forgotten bounties
- Status updates isolated per spreadsheet/note — no cross-opportunity visibility
- Opportunity metadata not machine-readable

### Pain Points
- **Developers:** Duplicated effort checking multiple sources daily
- **Teams:** Lost context when team members forget deadlines
- **AI Agents:** Cannot query or update opportunity data systematically
- **Data Quality:** Stale information, incomplete details, no audit trail

---

## Solution Overview

A unified opportunity database with three access layers:

| Layer | User | Interface | Purpose |
|-------|------|-----------|---------|
| **Web UI** | Human | Notion-style table, filters, inline editing | Track, discover, update opportunities |
| **REST API** | System | Hono on /api/v1, Zod validation | Programmatic CRUD, filtering, search |
| **MCP Server** | Claude Agent | 16 tools + 4 resources, stdio + HTTP | Agent-driven CRUD, natural language queries |

All layers access a single Supabase PostgreSQL database with one `opportunities` table (enum-based type differentiation) + supporting tables (calendar_blocks, milestones, proposals).

---

## User Personas

### Primary: Web User (Opportunity Tracker)
- **Who:** Crypto developer, hackathon participant, grant seeker
- **Goal:** Unified view of all opportunities with ability to filter, track progress, and remember deadlines
- **Pain:** Manually checking Twitter, Discord, hackathon sites, grant platforms, bounty boards
- **Needs:** Notion-like experience (type badges, inline editing, quick filters, calendar view)
- **Success:** Find relevant opportunity in <2 min, apply/track status in app

### Secondary: Claude Agent (Automation User)
- **Who:** AI assistant operating via MCP tools
- **Goal:** Execute CRUD operations, answer queries across all 4 opportunity types, support user's workflow
- **Pain:** No structured API exists for cross-type opportunity data
- **Needs:** REST API endpoints + MCP tools with natural language semantics
- **Success:** Execute 10+ tool calls/session, respond to vague user queries ("any grants closing soon?")

### Tertiary: Analytics User (Future)
- **Who:** Hackathon organizer, grant program manager tracking applicant pipeline
- **Goal:** Understand trends in opportunity types, reward amounts, success rates
- **Needs:** Charts, exports, filtering by date ranges and categories
- **Success:** Generate report answering "which chain has most hackathons?"

---

## Opportunity Types

### Core Four (v1)

| Type | When | Duration | Reward Form | Unique Fields |
|------|------|----------|-------------|---------------|
| **Hackathon** | 1-3 days | Event dates | Prize pool | start_date, end_date, reward_amount |
| **Grant** | Rolling or annual | Application to payout | Amount | start_date (app open), end_date (deadline), reward_amount |
| **Fellowship** | 3-6 months | Program duration | Stipend | start_date, end_date, reward_amount |
| **Bounty** | Immediate | Until completed | Per-task | end_date (deadline), reward_amount |

### Future (v2): Bootcamp (v1.6)
- 4-12 week structured education + funding
- Parent hackathon link (bootcamp graduates often apply to related hackathons)
- Separate track in UI once user base justifies it

---

## Key Features

### v1 — Core (Shipped)
- Single-table DB design (type enum covers all 4 types)
- Web UI: Notion-style table with type badges, inline editing, filters, sorting, pagination
- REST API: Full CRUD, dynamic filtering (type, status, org, chain, tag, date, FTS), meta endpoints
- MCP Server: 16 tools (CRUD per resource type), 4 resources (types, statuses, blockchains, tags)
- Calendar: Week/month views, drag-drop time blocking, milestone tracking, proposal editor
- Analytics: Area, bar, line, funnel charts with hover tooltips
- Weekly Review: Bento grid with card animations, rich text notes
- Security: Rate limiting (100 req/min), CORS, security headers
- Deployment: Vercel + Supabase, GitHub Actions CI

### v1.1 — Polish (Upcoming)
- Keyboard navigation (Cmd+K search, arrow keys in table)
- Resizable columns
- Type filter quick-toggle buttons
- Smooth animations + transitions
- Row hover highlighting
- Better FTS with ILIKE fallback

### v2 — Expansion (Backlog)
- User auth (Supabase Auth + GitHub OAuth)
- Row-level security (RLS) per user
- Soft deletes + archive view
- Real-time updates (Supabase Realtime)
- Submission/deliverable tracking
- Discord/Slack webhooks for deadlines
- Analytics dashboard (reward trends, success rates)
- Kanban view (group by status/type)
- Persistent rate limiting (Upstash Redis)
- Mobile-native app
- Multi-tenancy

---

## Success Metrics

### Performance
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API response time (p95) | <200ms | ~80-100ms | PASS |
| MCP tool execution | <500ms | ~200-300ms | PASS |
| Web table render (100 rows) | <1s | ~800ms | PASS |
| Database query (filtered) | <50ms | ~40-50ms | PASS |
| Uptime | 99.5% | 99.9% | PASS |

### Adoption
| Metric | Target (6 months) |
|--------|------------------|
| Monthly active users | 500+ |
| Opportunities tracked | 10,000+ |
| Opportunities created via web | 500/month |
| MCP tool calls (claude.com) | 100+/month |

### Quality
| Metric | Target |
|--------|--------|
| Code coverage | 70%+ (v1.1) |
| Lighthouse score | 90+ |
| Bug resolution time | <24h critical, <1 week standard |
| Documentation completeness | 100% (API, MCP, deployment) |

---

## Scope Definition

### In Scope (v1)
- Single-tenant access (no auth)
- Four opportunity types (hackathon, grant, fellowship, bounty)
- CRUD operations (create, read, update, delete)
- Filtering by type, status, organization, blockchain, tag, date, full-text search
- Pagination (50 per page default, max 200)
- Calendar time-blocking (date + half-day slots)
- Milestones (key deadlines)
- Proposals (markdown draft/submission per opportunity)
- Charts: area, bar, line, funnel (static data)
- Weekly review: bento grid with notes
- Rate limiting (100 req/min per IP)
- Hard deletes only
- Stateless API (no sessions)

### Out of Scope (v1)
- User authentication
- Row-level security
- Soft deletes
- Real-time updates
- Submission tracking (linked to opportunities)
- Auto-discovery (scraping aggregators)
- Calendar export (Google Calendar, .ics)
- Third-party webhooks (Discord, Slack)
- Analytics dashboard (custom reports)
- Kanban/board view
- Mobile app
- Multi-tenancy

### Intentional Non-Goals (v1-v2)
- Community/social features (comments, likes, sharing)
- Opportunity recommendations (ML-based)
- Price negotiations (out of scope — apply externally)
- KYC/identity verification
- Escrow payments
- Portfolio tracking (separate product)

---

## Differentiators

1. **Dual-Interface:** Both human (web table) and AI (MCP tools) access to same data — unique in crypto opportunity space
2. **Single Table Design:** No joins needed; type enum covers all 4 types elegantly
3. **Agent-Friendly API:** Claude can query, create, update, delete via natural language through MCP tools
4. **Notion UX:** Data-dense table familiar to crypto builders; not another Discord bot
5. **Calendar Integration:** Time-blocking + milestones tied to opportunities (most tools miss this)
6. **Structured Data:** Full-text search, filtering by chain, tag, org — enables discovery at scale

---

## Technical Constraints

### Database
- PostgreSQL (Supabase free tier: 500MB storage)
- Service role key only (no anon access) — prepared for RLS in v2
- No transactions between services (single table design avoids this)

### API
- Hono mounted in Next.js catch-all route (single deployment)
- No connection pooling needed (serverless)
- Query builder handles dynamic filters without SQL injection risk

### Frontend
- Next.js App Router (strict TypeScript, no dynamic routes until needed)
- TanStack Table (headless — full control over rendering)
- shadcn/ui (copy-paste components, no CSS-in-JS)
- Tailwind CSS (utility-first, easy theming for opportunity types)

### MCP Server
- Stdio transport only in v1 (HTTP transport added v1.1)
- 50KB response limit (summary strategy works)
- Python not supported (TypeScript only)

---

## Architecture Decisions

| Decision | Rationale | Alternative Rejected |
|----------|-----------|----------------------|
| Single `opportunities` table with type enum | Simpler queries, no joins, single migration | Separate tables per type (complex queries, risk of skew) |
| Hono in Next.js catch-all | One Vercel project, no CORS between services | Separate Express server (extra infrastructure) |
| service_role key only | Simpler implementation for v1, prepared for RLS in v2 | Supabase Auth now (adds complexity before product/market fit) |
| TanStack Table (headless) | Full render control for Notion UX | AG Grid (opinionated, heavyweight) |
| Zod schemas as source of truth | Infer TS types, runtime validation, no duplication | Separate types + validators (maintenance burden) |
| Supabase over raw Postgres | Managed hosting, JS client, auth/realtime ready | Raw EC2 + psql (DevOps overhead) |

---

## Revenue Model (Future)

**v1-v2:** Free, open-source (MIT license)

**v3+ (post-PMF):**
- **Freemium:** Core CRUD free, premium tier for analytics + webhooks
- **API Pricing:** Per-request or per-tool-call for external consumers
- **White-label:** Hackathon platforms embed Weminal's opportunities database
- **SaaS:** Hosted version with auth, analytics, team collaboration ($49-299/mo)

---

## Go-to-Market

### Phase 1: Founder-Led (Weeks 1-4)
- Target: crypto hackathon participants + grant seekers
- Channels: Twitter, Discord (builder communities), ETHGlobal
- Message: "Never miss a crypto opportunity again"
- Goal: 50 signups, 1000 opportunities seeded

### Phase 2: Partnership (Months 2-3)
- Integrate into: hackathon platforms (ETHGlobal, Buildspace), grant portals (Optimism Grants)
- Develop: API partnerships for data feed
- Goal: 500 monthly active users

### Phase 3: Community (Months 4-6)
- Hackathon-sponsored features (branded opportunities)
- Community contributions (user-submitted opportunities)
- Goal: 1000+ monthly active users, sustainable organic growth

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Data quality (stale info) | Users lose trust | Medium | Community upvotes, mark-as-stale feature, v2 webhooks |
| Low adoption | Can't sustain | Medium | Focus on hackathon communities first, word-of-mouth |
| Database scaling | >500MB storage | Low (6+ months) | v2 migration plan to Postgres shared/dedicated |
| MCP deprecation | Tools break | Low | Maintain backward compatibility, add HTTP transport option |
| Competitive entry | Market consolidation | Medium | Network effects (more users = better data) + dual interface moat |

---

## Success Criteria for Product Release

✅ = Shipped

- ✅ Database: 4 tables with proper indexes, RLS ready
- ✅ API: All CRUD endpoints + filtering + pagination
- ✅ MCP: 16 tools, stdio + HTTP transports
- ✅ Web UI: Notion-style table, inline editing, filters
- ✅ Calendar: Week/month views, drag-drop blocks, milestones, proposals
- ✅ Charts: Area, bar, line, funnel
- ✅ Weekly Review: Bento grid, card animations, notes
- ✅ Deployment: Live on Vercel + Supabase
- ✅ Documentation: README, API reference, MCP setup, deployment guide
- ✅ CI: GitHub Actions (lint + typecheck)
- ✅ Security: Rate limiting, CORS, security headers
- ✅ Seed data: 25+ opportunities across all 4 types

---

## Dependency Map

```
Frontend (Next.js + React 19)
  ↓
Hono REST API + MCP Server
  ↓
Supabase (PostgreSQL)
  ↓
GitHub (source control + CI)
  ↓
Vercel (hosting)
```

**Deployment Dependency:** Vercel → Supabase connectivity must be tested pre-deploy.

---

## Known Issues & Backlog

### v1.1 Priority
- [ ] Keyboard navigation (Cmd+K, arrow keys)
- [ ] Resizable columns
- [ ] Type filter toggles
- [ ] Automated tests (unit + integration + E2E)
- [ ] Performance review (Lighthouse, API latency)

### v2 Priority
- [ ] User authentication (Supabase Auth)
- [ ] Row-level security
- [ ] Soft deletes
- [ ] Real-time updates
- [ ] Submission tracking
- [ ] Webhooks (Discord, Slack)
- [ ] Analytics dashboard
- [ ] HTTP MCP transport

### Technical Debt
- No automated tests (added v1.1)
- Comments sparse (follow project convention — only for WHY)
- Mobile UX is card-based (acceptable, not primary use case)
- MCP response size limited to 50KB (summary strategy sufficient)

---

## Handoff

**Deployed by:** Weminal Labs team
**Maintained by:** Community + Weminal core
**License:** MIT (open source)
**Repository:** https://github.com/weminal-labs/crypto-opportunities-db

For detailed documentation, see:
- API Reference: `docs/api-reference.md`
- MCP Setup: `docs/mcp-setup.md`
- Deployment: `docs/deployment.md`
- Code Standards: `docs/code-standards.md`
- System Architecture: `docs/system-architecture.md`
