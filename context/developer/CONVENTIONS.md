# Code Conventions

> Claude follows these on every task without being reminded.

## Naming

- **Files:** kebab-case (`opportunity-table.tsx`, `query-builder.ts`)
- **React components:** PascalCase (`OpportunityTable`, `TypeBadge`)
- **Functions/variables:** camelCase (`fetchOpportunities`, `queryBuilder`)
- **Constants:** UPPER_SNAKE_CASE for env vars, camelCase for everything else
- **Types/interfaces:** PascalCase (`Opportunity`, `CreateOpportunityInput`)
- **Zod schemas:** camelCase with `Schema` suffix (`createOpportunitySchema`)
- **API routes:** kebab-case, plural nouns (`/opportunities`, `/meta/blockchains`)
- **Database columns:** snake_case (`reward_amount`, `start_date`, `website_url`)

## File & Folder Structure

```
src/
  app/          # Next.js pages and layouts
  api/          # Hono API (routes, middleware, schemas, lib)
  components/   # React components grouped by feature area
    table/
    filters/
    forms/
    detail/
    ui/         # shadcn auto-generated components
  mcp/          # MCP server (separate entry point)
    tools/
    resources/
  hooks/        # React hooks
  lib/          # Shared utilities and types
supabase/
  migrations/   # SQL files
  seed.sql
```

## Patterns

### Data Fetching
- TanStack Query for all server state
- Query keys include all filter/pagination params
- Mutations invalidate relevant queries on success
- Optimistic updates for inline editing

### Validation
- Zod schemas are the single source of truth for both API and form validation
- Schemas defined once in `api/schemas/`, imported by both API routes and frontend forms
- Never validate manually — always parse through Zod

### Components
- Prefer composition over inheritance
- shadcn/ui components used as-is where possible, customized when needed
- Feature components import from shadcn, not the other way around

### Error Handling
- API errors formatted as `{ error: { code, message, details? } }`
- Zod errors caught and formatted by error handler middleware
- Frontend: toast for mutation errors, inline for form validation

### Types
- Infer TypeScript types from Zod schemas where possible
- Shared types in `lib/types.ts`
- Database row type from Supabase client

## Comments

- Only comment non-obvious logic
- No "this function does X" comments — the name should say that
- TODO comments are acceptable for known future work

## Formatting

- TypeScript strict mode
- ESLint with Next.js + TypeScript config
- Tailwind CSS for styling (no CSS modules, no styled-components)
- 2-space indentation
- Single quotes for strings
- No semicolons (or use consistent style from project init)
