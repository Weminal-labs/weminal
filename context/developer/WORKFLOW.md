# Development Workflow

> Small team / solo developer workflow.

## Branch Strategy

- `main` — production, auto-deploys to Cloudflare Pages via GitHub Actions
- `dev` — integration branch (optional for solo)
- Feature branches: `feat/opportunity-crud`, `feat/mcp-tools`, `feat/type-filter`, etc.
- PR required for merging to `main` (can be self-merged for solo dev)

### Branch Naming

- `feat/[feature-name]` — new features
- `fix/[bug-name]` — bug fixes
- `chore/[task]` — maintenance, deps, config

## Commit Style

Conventional commits:

```
feat: add type filter to FilterBar
fix: handle null organization in query builder
chore: update Supabase SDK to v2.x
refactor: extract TypeBadge component from columns
```

Keep commits focused — one logical change per commit.

## PR / Review Process

- Use code-reviewer agent before merging significant features
- Self-merge for solo work after review pass
- Test PRs locally (`pnpm dev`) before merging — no automatic preview deploys

## Local Development

### First Time Setup

1. Clone repo
2. `pnpm install`
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
4. Run Supabase migration (or apply SQL via dashboard)
5. `pnpm dev` — starts Next.js dev server at localhost:3000

### Daily Development

```
pnpm dev          # Next.js dev server (API + frontend)
pnpm mcp:dev      # MCP server in dev mode (tsx watch)
pnpm lint         # ESLint + TypeScript check
pnpm build        # Production build
```

### Database

```
pnpm db:migrate   # Run Supabase migrations
pnpm db:seed      # Seed development data
```

### MCP Development

```
pnpm mcp:dev      # Watch mode (tsx)
pnpm mcp:build    # Bundle for distribution (esbuild)
```
