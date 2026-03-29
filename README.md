# Crypto Opportunities Database

A Notion-like structured database for tracking crypto opportunities with dual access: web UI for humans and MCP tools for AI agents. Built by Weminal Labs.

**Live:** https://weminal.vercel.app

---

## What It Is

Unified opportunity tracker for crypto developers:
- **4 opportunity types:** Hackathons, grants, fellowships, bounties
- **Web UI:** Notion-style table with filters, inline editing, calendar, charts
- **AI Access:** Claude Code integration via MCP tools (16 tools, stdio + HTTP)
- **Single Source of Truth:** Hono REST API backed by Supabase PostgreSQL

## Quick Facts

| Fact | Value |
|------|-------|
| **Status** | v1 Released, v1.1 Upcoming |
| **Tech** | Next.js 16, React 19, Hono, Supabase, TypeScript |
| **Features** | CRUD, filtering, calendar, charts, weekly review |
| **API Response Time (p95)** | ~80-100ms |
| **MCP Tool Execution** | ~200-300ms |
| **Uptime** | 99.9% |

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10.28
- Supabase account (free tier)

### Setup (5 minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd weminal
pnpm install

# 2. Create Supabase project and get credentials
# Sign up at supabase.com, create project, copy URL + service role key

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local, add:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 4. Run database migrations
# Go to Supabase SQL Editor, paste supabase/migrations/001_create_opportunities.sql
# Repeat for migrations 002, 003, 004

# 5. Seed sample data (optional)
# Paste supabase/seed.sql in SQL Editor

# 6. Start development
pnpm dev
# Visit http://localhost:3000/hack
```

## Features

### Web UI (`/hack`)
- Notion-style table with type badges (blue/green/purple/orange)
- Filters: type, status, organization, blockchain, tag, full-text search
- Inline editing with optimistic updates
- Create/edit/delete dialogs
- Responsive mobile layout (card view)
- Loading states, empty states, notifications

### Calendar (`/calendar`)
- Week view (7-day grid, AM/PM slots)
- Month view (compact 4-month calendar)
- Drag-and-drop: opportunities → calendar blocks
- Milestone timeline
- Proposal editor (markdown)
- Detail panel with editing

### Charts (`/charts`)
- Area chart: reward trends over time
- Bar chart: opportunities per type
- Line chart: status progression
- Funnel chart: pipeline visualization

### Weekly Review (`/review`)
- Bento grid layout with card animations
- Rich text notes with popovers
- Weekly summary

### API Endpoints

Base URL: `/api/v1`

**CRUD:** `/opportunities`, `/calendar-blocks`, `/milestones`, `/proposals`
**Meta:** `/meta/types`, `/meta/statuses`, `/meta/blockchains`, `/meta/tags`
**Health:** `/health`

See [API Reference](docs/api-reference.md) for full documentation.

### MCP Server (Claude Integration)

16 tools + 4 resources for Claude Code:

**Tools:** opportunity CRUD (5), calendar CRUD (5), milestone CRUD (3), proposal CRUD (2)
**Resources:** types, statuses, blockchains, tags

Example:
```
Claude: "List all grants due this month"
→ MCP tool call: opportunity_list(type=grant, end_date_lte=2026-04-30)
→ Returns: JSON + human-readable summary
```

Setup: See [MCP Setup Guide](docs/mcp-setup.md)

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | Next.js 16, React 19 | App Router, client components |
| **UI Components** | shadcn/ui, Radix, Tailwind CSS 4 | Copy-paste, zero vendor lock-in |
| **Table** | TanStack Table v8 | Headless, full render control |
| **State** | TanStack Query, nuqs | Server + URL state |
| **API** | Hono | Lightweight, edge-compatible |
| **Validation** | Zod 4 | Runtime + TypeScript types |
| **Database** | Supabase (PostgreSQL) | Managed, JS client, RLS-ready |
| **Deployment** | Vercel | Serverless functions, CDN |
| **Package Manager** | pnpm 10.28 | Fast, strict, disk-efficient |

## Project Structure

```
src/
  app/               # Next.js pages
    hack/            # Opportunities table
    calendar/        # Calendar view
    charts/          # Analytics
    review/          # Weekly review
  api/               # Hono REST API
    routes/          # CRUD endpoints
    schemas/         # Zod validation
  components/        # React components (feature-scoped)
    table/           # Table + columns + badges
    calendar/        # Calendar views
    charts/          # Charts
  mcp/               # MCP server (separate entry)
  lib/               # Shared utilities
supabase/
  migrations/        # SQL migrations (4 tables)
  seed.sql           # Sample data
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [Project Overview & PDR](docs/project-overview-pdr.md) | Problem, solution, users, success metrics |
| [System Architecture](docs/system-architecture.md) | Deployment, data flow, security, scaling |
| [Code Standards](docs/code-standards.md) | Naming, patterns, error handling, testing |
| [Design Guidelines](docs/design-guidelines.md) | Colors, typography, components, accessibility |
| [API Reference](docs/api-reference.md) | Endpoint details, parameters, examples |
| [Deployment Guide](docs/deployment.md) | Vercel + Supabase setup |
| [MCP Setup](docs/mcp-setup.md) | Claude Code configuration |
| [Roadmap](docs/project-roadmap.md) | v1.1, v2, v3 plans |
| [Codebase Summary](docs/codebase-summary.md) | File tree, modules, data flow |

## Scripts

```bash
pnpm dev              # Start Next.js dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Run production server
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript type check
pnpm mcp:dev          # MCP server watch mode
pnpm mcp:build        # Bundle MCP server (dist/mcp.js)
```

## Environment Variables

```bash
SUPABASE_URL                  # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY     # Service role key (server-side only)
ALLOWED_ORIGINS               # Production CORS origins (comma-separated)
```

## Roadmap

### v1 ✅ Released
- Database + API with CRUD
- Web UI table with filters
- Calendar with time-blocking
- Charts and analytics
- MCP server integration
- Deployed on Vercel + Supabase

### v1.1 (2 weeks)
- Keyboard navigation (Cmd+K, arrow keys)
- Resizable columns
- Automated tests (unit + integration + E2E)
- Performance optimizations

### v2 (8 weeks, post-PMF)
- User authentication (GitHub OAuth)
- Row-level security (RLS)
- Soft deletes + archive
- Real-time updates (Supabase Realtime)
- Webhooks (Discord, Slack)
- Advanced analytics + kanban view

See [full roadmap](docs/project-roadmap.md).

## Contributing

This is an open-source project. Contributions welcome!

1. Read [Code Standards](docs/code-standards.md) and [Code Review Checklist](docs/code-standards.md#code-review-checklist)
2. Create feature branch (`git checkout -b feature/name`)
3. Make changes (follow conventions)
4. Run tests + linting (`pnpm lint && pnpm typecheck`)
5. Commit with clear message (`feat: add X`, `fix: resolve Y`)
6. Push and create PR

## Support

- **Issues:** GitHub Issues (bugs, feature requests)
- **Discussions:** GitHub Discussions (questions, ideas)
- **Twitter:** [@weminal_labs](https://twitter.com/weminal_labs)

## License

MIT — open source, use freely.

---

**Built by [Weminal Labs](https://github.com/weminal-labs) | [Live Demo](https://weminal.vercel.app)**
