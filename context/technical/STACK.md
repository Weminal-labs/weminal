# Tech Stack

> Generated from architecture document and plan.

## Frontend

| Technology | Purpose |
|-----------|---------|
| **Next.js** (App Router) | React framework, API route hosting, Vercel-native deployment |
| **TanStack Table v8** | Headless table — sorting, filtering, pagination with full render control |
| **TanStack Query** | Server state management, caching, optimistic updates |
| **shadcn/ui** | Copy-paste UI components (Table, Button, Dialog, Select, Input, Badge, etc.) |
| **Tailwind CSS** | Utility-first styling |
| **nuqs** | Type-safe URL search params for filter state persistence |
| **date-fns** | Date/time utilities (calendar math, formatting) |
| **Zod** | Client-side form validation (shared schemas with API) |

## Backend

| Technology | Purpose |
|-----------|---------|
| **Hono** | Lightweight API framework, mounted in Next.js catch-all route |
| **Zod** | Input validation, TypeScript type inference |
| **@modelcontextprotocol/sdk** | Official MCP TypeScript SDK for Claude tool integration |

## Database

| Technology | Purpose |
|-----------|---------|
| **Supabase** (PostgreSQL) | Managed Postgres with JS client, free tier, future auth/realtime ready |
| Access model | `service_role` key only — no anon access, server-side only |

## Auth

**Better Auth** (`better-auth` + Cloudflare adapter) — role-based:
- `admin` (Weminal team): full read/write/delete on all records
- `member` (Weminal community): can create records and edit/delete their own
- Anonymous: read-only; CTAs prompt login for write actions

Session management via Better Auth. Delegate API keys (`wem_` prefix, sha256-hashed) for agent/service access. See `context/features/auth-better-auth.md`.

## Infrastructure

| Service | Purpose | Tier |
|---------|---------|------|
| **Cloudflare Pages** | Hosting (Next.js + API, edge runtime) | Free |
| **Supabase** | Database | Free tier (500MB storage, 2GB bandwidth) |
| **GitHub** | Source control + CI | Free |

> Edge runtime note: Cloudflare Workers requires edge-compatible APIs. Supabase connection must use the Transaction pooler URL (port 6543, `?pgbouncer=true`) — not the default 5432.

## Key Third-Party Services

| Service | Purpose |
|---------|---------|
| **esbuild** | Bundling MCP server for distribution |
| **ESLint** | Code linting |
| **TypeScript** | Type checking |

## Package Manager

**pnpm** — fast, disk-efficient, strict dependency resolution.

## Rationale

- **Hono over Express:** Edge-compatible, lighter, better middleware, mounts cleanly inside Next.js
- **TanStack Table over AG Grid:** Headless = full render control for Notion-like UX. AG Grid too opinionated.
- **shadcn/ui over MUI/Chakra:** Copy-paste components, zero vendor lock-in, Tailwind-native
- **Supabase over raw Postgres:** Managed hosting, JS client with parameterized queries, free tier, auth/realtime ready for v2
- **Single deploy (Hono in Next.js):** One Vercel project serves both API and frontend. No CORS between services.
- **nuqs over manual URL parsing:** Type-safe, avoids boilerplate, works with App Router
