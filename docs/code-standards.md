# Code Standards & Conventions

**Project:** Crypto Opportunities Database
**Language:** TypeScript (strict mode)
**Last Updated:** 2026-03-29

---

## File & Folder Naming

### Files
- **React components:** `kebab-case.tsx` (e.g., `opportunity-table.tsx`, `type-badge.tsx`)
- **TypeScript utilities:** `kebab-case.ts` (e.g., `query-builder.ts`, `api-client.ts`)
- **API routes:** `kebab-case.ts` (e.g., `opportunities.ts`, `calendar-blocks.ts`)
- **Zod schemas:** `kebab-case.ts` (e.g., `opportunity.ts`, `calendar.ts`)
- **Tests:** `[name].test.ts` or `[name].spec.ts` (e.g., `query-builder.test.ts`)

### Folders
- **Features:** lowercase plural nouns (e.g., `components/`, `hooks/`, `api/routes/`)
- **Semantic grouping:** By feature area, not by type (e.g., `components/calendar/` not `components/hooks/`)
- **Avoid:** `utils/`, `helpers/`, `common/` — be specific (e.g., `lib/`, `api/lib/`)

---

## Naming Conventions

| Type | Pattern | Example | Notes |
|------|---------|---------|-------|
| React components | PascalCase | `OpportunityTable`, `TypeBadge` | Exported as default or named |
| Functions | camelCase | `fetchOpportunities`, `queryBuilder` | Never use `_` prefix (private not enforced) |
| Variables | camelCase | `opportunityId`, `startDate` | Avoid abbreviations |
| Constants | camelCase | `defaultPageSize = 50` | No UPPER_SNAKE_CASE (reserved for env vars) |
| Env variables | UPPER_SNAKE_CASE | `SUPABASE_URL`, `ALLOWED_ORIGINS` | Prefix with service if external |
| Database columns | snake_case | `reward_amount`, `start_date` | Consistent with Supabase migrations |
| Database tables | snake_case | `opportunities`, `calendar_blocks` | Plural nouns |
| API routes | kebab-case | `/opportunities`, `/calendar-blocks` | Plural, RESTful |
| Zod schemas | camelCase + Schema | `createOpportunitySchema`, `updateBlockSchema` | Exported as named exports |
| Types/Interfaces | PascalCase | `Opportunity`, `CreateOpportunityInput` | Inferred from Zod where possible |
| React hooks | `use` + PascalCase | `useOpportunities`, `useCalendar` | Custom hooks only, no external hook wrapping |
| Boolean variables | `is` + Adjective or `has` + Noun | `isLoading`, `hasError`, `canEdit` | Readable conditionals |

---

## TypeScript & Type Safety

### Strict Mode — Always
```typescript
// ✅ Required in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Inference from Zod
```typescript
// ✅ DO: Infer types from Zod schemas
const createOpportunitySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['hackathon', 'grant', 'fellowship', 'bounty']),
  reward_amount: z.number().positive().optional(),
});

type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

// ❌ DON'T: Duplicate interface definitions
interface CreateOpportunityInput {
  name: string;
  type: 'hackathon' | 'grant' | 'fellowship' | 'bounty';
  reward_amount?: number;
}
```

### No Type Escapes
```typescript
// ❌ FORBIDDEN: as any, @ts-ignore, @ts-expect-error
const data = JSON.parse(input) as any;
const value = untypedFunction() as string;

// ✅ DO: Use proper types or Zod validation
const data = z.object({ /* ... */ }).parse(JSON.parse(input));
const value: string = validateInput(untypedFunction());
```

### Union Types > Optional
```typescript
// ✅ DO: Explicit unions for clarity
type Status = 'draft' | 'submitted' | 'rejected';

// ❌ AVOID: Optional flags that muddy semantics
type Status = 'draft' | 'submitted' | undefined;
```

---

## React Patterns

### Functional Components Only
```typescript
// ✅ Functional component
export function OpportunityTable({ data }: { data: Opportunity[] }) {
  return <table>{/* ... */}</table>;
}

// ❌ Class components not allowed
class OpportunityTable extends React.Component { }
```

### Component Props Typing
```typescript
// ✅ Inline props type (small components)
export function TypeBadge({ type, size = 'md' }: { type: OpportunityType; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`badge badge-${size}`}>{type}</span>;
}

// ✅ Extract interface for complex props
interface OpportunityTableProps {
  data: Opportunity[];
  onRowClick: (id: string) => void;
  sortBy?: keyof Opportunity;
  loading?: boolean;
}

export function OpportunityTable(props: OpportunityTableProps) {
  return <table>{/* ... */}</table>;
}
```

### Hooks Usage
```typescript
// ✅ Use TanStack Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['opportunities', filters],
  queryFn: () => fetchOpportunities(filters),
});

// ✅ Use URL params for client state
const [filters, setFilters] = useQueryState({
  type: parseAsString,
  status: parseAsString,
  page: parseAsInteger.withDefault(1),
});

// ✅ Minimalist custom hooks
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ❌ Avoid creating custom hooks that just wrap library hooks
function useMyQuery(id: string) {
  return useQuery({...}); // Just use useQuery directly
}
```

### Optimistic Updates
```typescript
// ✅ TanStack Query optimistic update pattern
const updateMutation = useMutation({
  mutationFn: (data: UpdateOpportunityInput) => updateOpportunity(data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['opportunities'] });
    const previousData = queryClient.getQueryData(['opportunities']);
    queryClient.setQueryData(['opportunities'], (old) => ({
      ...old,
      data: old.data.map((opp) => opp.id === newData.id ? { ...opp, ...newData } : opp),
    }));
    return { previousData };
  },
  onError: (err, newData, context) => {
    if (context?.previousData) {
      queryClient.setQueryData(['opportunities'], context.previousData);
    }
  },
});
```

### Conditional Rendering
```typescript
// ✅ Early returns for clarity
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

return <OpportunityTable data={data} />;

// ✅ Ternary for simple cases
<button disabled={!canSubmit}>Submit</button>

// ❌ Nested ternaries
return condition1 ? value1 : condition2 ? value2 : condition3 ? value3 : value4;

// ✅ Use switch for complex branches
switch (status) {
  case 'draft': return <DraftUI />;
  case 'submitted': return <SubmittedUI />;
  case 'rejected': return <RejectedUI />;
}
```

---

## API & Validation Patterns

### Zod Validation
```typescript
// ✅ Define schemas in api/schemas/
export const createOpportunitySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['hackathon', 'grant', 'fellowship', 'bounty']),
  description: z.string().optional(),
  reward_amount: z.number().positive().optional().nullable(),
  blockchains: z.array(z.string()).optional().default([]),
});

// ✅ Use in API route
app.post('/opportunities', async (c) => {
  const body = await c.req.json();
  const parsed = createOpportunitySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } }, 400);
  }

  const created = await createOpportunity(parsed.data);
  return c.json({ data: created }, 201);
});

// ✅ Reuse same schema in forms
function CreateOpportunityForm() {
  const form = useForm<z.infer<typeof createOpportunitySchema>>({
    resolver: zodResolver(createOpportunitySchema),
  });
  return <form>{/* ... */}</form>;
}
```

### Parameterized Queries (No String Interpolation)
```typescript
// ✅ Parameterized Supabase queries
const { data, error } = await supabase
  .from('opportunities')
  .select('*')
  .eq('type', type)                 // Param 1
  .gte('reward_amount', minReward)  // Param 2
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// ❌ String interpolation = SQL injection risk
const query = `SELECT * FROM opportunities WHERE type = '${type}'`;
```

### Error Response Shape
```typescript
// ✅ Consistent error format
{
  "error": {
    "code": "NOT_FOUND" | "VALIDATION_ERROR" | "RATE_LIMITED" | "INTERNAL_ERROR",
    "message": "Human readable message",
    "details": [] // Optional, for validation errors
  }
}
```

---

## File Structure & Organization

### Feature-Scoped Components
```typescript
// ✅ Organize by feature, not by type
src/components/
  table/
    opportunity-table.tsx      # Main component
    columns.ts                 # Column definitions
    row-thumbnail.tsx          # Sub-component
    status-badge.tsx           # Sub-component
    type-badge.tsx             # Sub-component
    table-pagination.tsx       # Sub-component

  filters/
    filter-bar.tsx
    search-input.tsx
    type-filter.tsx

// ❌ Don't organize by type
src/components/
  tables/
    opportunity-table.tsx
  badges/
    status-badge.tsx
    type-badge.tsx
  filters/
    filter-bar.tsx
```

### Shared Code
```typescript
// ✅ src/lib/ for truly shared utilities
lib/
  api-client.ts              # Fetch wrapper
  types.ts                   # Shared types (no Zod)
  utils.ts                   # Helper functions
  type-colors.ts             # Color mappings

// ✅ src/api/lib/ for API-only utilities
api/
  lib/
    supabase.ts              # Client singleton
    query-builder.ts         # Dynamic query builder
```

---

## Comments & Documentation

### When to Comment
Comments are required for:
- **Business logic:** Why this specific threshold, formula, or branching decision
- **Security rationale:** Why this check exists, what attack it prevents
- **Workarounds:** What bug/limitation this works around, with link/ticket
- **Non-obvious performance:** Why this approach over the obvious one
- **Invariants:** Assumptions that must hold for correctness
- **Complex regex:** What the pattern matches

### When NOT to Comment
Forbidden:
- Repeating what code does (`// increment counter` on `count++`)
- Commented-out code (delete it)
- Summarizing a function that has a clear name
- Explaining standard library/framework usage

### Examples
```typescript
// ✅ WHY — explains business logic
// Cap reward_amount at 1M because we've seen data entry errors above this
const maxReward = 1_000_000;
if (rewardAmount > maxReward) {
  rewardAmount = maxReward;
}

// ✅ WHY — explains security rationale
// Require service_role key for all mutations; prevents anon users from modifying data
// RLS policies are bypassed by service_role, so we must authenticate at API layer
const supabase = createClient(url, serviceRoleKey);

// ✅ WHY — explains workaround
// Supabase doesn't support ILIKE case-insensitive search on arrays, so we use @> with lowercase
const query = `blockchains @> ARRAY[$1]::text[]`.toLowerCase();

// ❌ DON'T — repeating code
const opportunities = opportunities.map((opp) => ({
  // Set the type badge color
  badge: getTypeColor(opp.type),
}));

// ❌ DON'T — obvious naming
const count = 0; // Initialize counter
count++; // Increment counter
```

---

## Error Handling

### API Routes
```typescript
// ✅ Catch-all error handler in middleware
app.onError((err, c) => {
  logger.error(err);

  if (err instanceof z.ZodError) {
    return c.json({
      error: { code: 'VALIDATION_ERROR', details: err.errors }
    }, 400);
  }

  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'An error occurred' }
  }, 500);
});

// ✅ Validate at route level
app.post('/opportunities', async (c) => {
  const body = createOpportunitySchema.parse(await c.req.json());
  // No try-catch needed; middleware catches
  const created = await createOpportunity(body);
  return c.json({ data: created }, 201);
});
```

### React Components
```typescript
// ✅ TanStack Query error handling
const { error } = useQuery({
  queryKey: ['opportunities'],
  queryFn: () => fetchOpportunities(),
});

if (error) {
  return <div className="text-red-600">Failed to load: {error.message}</div>;
}

// ✅ Form validation errors
const form = useForm<CreateOpportunityInput>({
  resolver: zodResolver(createOpportunitySchema),
});

return (
  <form onSubmit={form.handleSubmit(async (data) => {
    try {
      await createOpportunity(data);
      toast.success('Created');
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    }
  })}>
    {form.formState.errors.name && <span className="text-red-600">{form.formState.errors.name.message}</span>}
  </form>
);
```

---

## Styling & Tailwind

### Class Naming
```typescript
// ✅ Use Tailwind utilities directly
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Submit
</button>

// ✅ Extract complex shared patterns to components
function PrimaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" {...props}>{children}</button>;
}

// ❌ CSS modules not used
import styles from './button.module.css';
<button className={styles.primary}>Submit</button>

// ❌ styled-components not used
const StyledButton = styled.button`...`;
```

### Opportunity Type Colors
```typescript
// ✅ Use type-colors utility
import { getTypeColor } from '@/lib/type-colors';

<Badge className={getTypeColor(opportunity.type)}>
  {opportunity.type}
</Badge>

// Color mapping:
// hackathon → bg-blue-100 text-blue-800 (dark: bg-blue-900 text-blue-200)
// grant → bg-green-100 text-green-800 (dark: bg-green-900 text-green-200)
// fellowship → bg-purple-100 text-purple-800 (dark: bg-purple-900 text-purple-200)
// bounty → bg-orange-100 text-orange-800 (dark: bg-orange-900 text-orange-200)
```

---

## Testing Conventions (v1.1+)

### File Naming
```
src/api/routes/opportunities.test.ts
src/components/table/opportunity-table.test.tsx
src/lib/query-builder.test.ts
```

### Test Structure
```typescript
// ✅ Describe blocks match file/feature name
describe('OpportunityTable', () => {
  describe('sorting', () => {
    it('should sort by reward_amount descending', () => {
      // Arrange
      const data = [{ reward_amount: 100 }, { reward_amount: 200 }];

      // Act
      const sorted = sortBy(data, 'reward_amount', 'desc');

      // Assert
      expect(sorted[0].reward_amount).toBe(200);
    });
  });
});

// ✅ One assertion per test (ideally)
it('should return 400 for invalid input', async () => {
  const res = await POST({ body: { type: 'invalid' } });
  expect(res.status).toBe(400);
});

// ❌ Multiple assertions per test
it('should create and update', async () => {
  const created = await create(data);
  expect(created.id).toBeDefined();
  const updated = await update(created.id, newData);
  expect(updated.name).toBe(newData.name);
});
```

---

## Git & Commits

### Branch Naming
```
feature/opportunity-filters      # New feature
fix/fts-search-bug               # Bug fix
docs/api-reference               # Documentation
refactor/query-builder           # Refactoring
test/add-calendar-tests          # Tests
chore/upgrade-dependencies       # Maintenance
```

### Commit Messages
```
# ✅ Conventional commits (type: description)
feat: add bootcamp opportunity type
fix: resolve FTS search null handling
docs: update API reference for v1.1
refactor: simplify query builder logic
test: add integration tests for calendar blocks
chore: upgrade Next.js to 16

# ❌ Vague or AI-like messages
update stuff
fix issue
work in progress
update code
```

---

## Import Organization

```typescript
// ✅ Organize in order: libraries, then project code
// 1. External libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 2. Next.js
import { useRouter } from 'next/navigation';

// 3. Project code (lib, hooks, components)
import { fetchOpportunities } from '@/lib/api-client';
import { useOpportunities } from '@/hooks/useOpportunities';
import { OpportunityTable } from '@/components/table/opportunity-table';
import { TypeBadge } from '@/components/table/type-badge';

// ❌ Random order
import { TypeBadge } from '@/components/table/type-badge';
import { useState } from 'react';
import { fetchOpportunities } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
```

---

## Code Review Checklist

- [ ] TypeScript strict mode: no `any`, `@ts-ignore`, `@ts-expect-error`
- [ ] Naming: consistent with conventions (camelCase vars, PascalCase components, kebab-case files)
- [ ] Error handling: try-catch or error boundaries where needed
- [ ] Validation: Zod for API inputs + forms
- [ ] Comments: only for WHY, not WHAT
- [ ] Tests: unit + integration for new logic
- [ ] Performance: no N+1 queries, memoization where needed
- [ ] Security: no secrets in code, parameterized queries, rate limiting
- [ ] Accessibility: semantic HTML, ARIA labels, keyboard nav
- [ ] Mobile: responsive (test at 375px)
- [ ] Documentation: README updated if needed

---

## Linting & Formatting

### ESLint
```bash
pnpm lint
```

### TypeScript Check
```bash
pnpm typecheck
```

### Build
```bash
pnpm build
```

All three must pass before committing.

---

## Tools & Extensions

### Recommended IDE Setup (VS Code)
- **ESLint extension** — Real-time linting
- **TypeScript extension** — Type checking in editor
- **Tailwind CSS IntelliSense** — Class autocomplete
- **Prettier** (optional) — Code formatting

### Format on Save
```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

---

## Summary of MUST-HAVEs

1. **TypeScript strict mode** — no type escapes
2. **Zod validation** — single source of truth
3. **TanStack Query** — server state management
4. **Functional components** — React only
5. **Feature-scoped folders** — organized by domain
6. **Comments for WHY** — not WHAT
7. **Parameterized queries** — prevent SQL injection
8. **Error handling** — catch and format
9. **Consistent naming** — follow conventions
10. **Tests** (v1.1+) — unit + integration coverage
