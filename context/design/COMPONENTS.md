# Component Inventory

> Populate as components are built.

## Layout

| Component | Purpose | Location |
|-----------|---------|----------|
| RootLayout | App shell with providers (QueryClient, ThemeProvider) | `app/layout.tsx` |
| MainPage | Table page layout with header, filters, table | `app/page.tsx` |

## Common UI (shadcn)

Components to install from shadcn/ui:
- Table, Button, Dialog, Select, Input, Badge
- Skeleton, AlertDialog, Sonner (toasts)
- DropdownMenu, Popover, Command (for combobox)

## Feature-Specific

### Table Components

| Component | Purpose | File |
|-----------|---------|------|
| OpportunityTable | TanStack Table wrapper | `components/table/opportunity-table.tsx` |
| columns | Column definitions (type, org, etc.) | `components/table/columns.tsx` |
| TypeBadge | Colored badge for opportunity type | `components/table/type-badge.tsx` |
| EditableCell | Inline editing cell | `components/table/editable-cell.tsx` |
| TablePagination | Pagination controls | `components/table/table-pagination.tsx` |
| ColumnVisibility | Column toggle dropdown | `components/table/column-visibility.tsx` |

### Filter Components

| Component | Purpose | File |
|-----------|---------|------|
| FilterBar | Filter container | `components/filters/filter-bar.tsx` |
| TypeFilter | Type multi-select | `components/filters/type-filter.tsx` |
| StatusFilter | Status dropdown | `components/filters/status-filter.tsx` |
| OrganizationFilter | Org autocomplete | `components/filters/organization-filter.tsx` |
| BlockchainFilter | Chain multi-select | `components/filters/blockchain-filter.tsx` |
| TagFilter | Tag multi-select | `components/filters/tag-filter.tsx` |
| SearchInput | Debounced search | `components/filters/search-input.tsx` |

### Form Components

| Component | Purpose | File |
|-----------|---------|------|
| CreateOpportunityDialog | Create form in dialog | `components/forms/create-opportunity-dialog.tsx` |
| OpportunityForm | Shared form fields | `components/forms/opportunity-form.tsx` |

### Detail Components

| Component | Purpose | File |
|-----------|---------|------|
| OpportunityDetail | Expanded detail view | `components/detail/opportunity-detail.tsx` |

### Hooks

| Hook | Purpose | File |
|------|---------|------|
| useOpportunities | TanStack Query CRUD hooks | `hooks/use-opportunities.ts` |
| useMeta | TanStack Query meta hooks | `hooks/use-meta.ts` |
| useDebounce | Debounce utility | `hooks/use-debounce.ts` |

### Utilities

| Utility | Purpose | File |
|---------|---------|------|
| api-client | Fetch wrapper | `lib/api-client.ts` |
| type-colors | Type -> color mapping | `lib/type-colors.ts` |
| columns-config | Default column visibility | `lib/columns-config.ts` |
