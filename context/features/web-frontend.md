# Feature: Web Frontend

> **Status:** `in-progress`
> **Phase:** v1 — Phase 3
> **Last updated:** 2026-03-25

---

## Summary

Notion-like web table interface for browsing, filtering, creating, editing, and deleting crypto opportunities. Uses TanStack Table for headless table logic, shadcn/ui for components, TanStack Query for server state. Features type badges with color coding, type/status/organization filters, inline editing, URL-persisted filters, and responsive design.

---

## Users

- **Crypto developer** — browses, filters, creates, edits opportunities via the web table
- Primarily desktop users, with mobile support for quick lookups

---

## User Stories

- As a **user**, I want to view all opportunities in a table with type badges so I can see the full pipeline at a glance
- As a **user**, I want to filter by type (hackathon/grant/fellowship/bounty) so I can focus on one category
- As a **user**, I want to filter by status, organization, blockchain, and tags so I can narrow results
- As a **user**, I want to search by name so I can find specific opportunities quickly
- As a **user**, I want to create new opportunities with a type selector so I can add any type
- As a **user**, I want to edit cells inline so I can update data without leaving the table
- As a **user**, I want filters to persist in the URL so I can share or bookmark views
- As a **user**, I want a card layout on mobile so I can browse on my phone

---

## Behaviour

### Happy Path

1. User loads page — table shows all opportunities sorted by created_at desc
2. User clicks Type filter, selects "grant" — table shows only grants
3. User clicks column header to sort by reward_amount
4. User clicks a cell to edit, changes status to "applying", blurs to save
5. Toast confirms update

### Edge Cases & Rules

- No data: show empty state with create CTA
- Filter returns no results: show "No [type] found matching your filters"
- Inline edit fails (network error): rollback optimistic update, show error toast
- Mobile viewport: switch from table to card layout
- URL params invalid: ignore and show unfiltered view

---

## Connections

- **Depends on:** Database & API (Phase 1) — consumes REST endpoints
- **Shares data with:** MCP server (same database)

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version |
|--------|----------|--------------|
| Layout | Single table page | Multi-view (table, kanban, calendar) |
| Editing | Inline cells | Full edit dialog |
| Columns | Fixed set | User-customizable column order |
| Selection | None | Row selection for bulk ops |
| Real-time | Poll on window focus | Supabase Realtime |

---

## Security Considerations

- No secrets in frontend code (API calls to same-origin /api/v1)
- Zod validation on form inputs (client-side defense in depth)
- No dangerouslySetInnerHTML — React handles escaping
- External links open in new tab with rel="noopener noreferrer"

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T38 | `[x]` | Initialize shadcn/ui and install components (Table, Button, Dialog, Select, Input, Badge, Skeleton, AlertDialog, Sonner, DropdownMenu, Popover, Command) |
| T39 | `[x]` | Create API client with fetch wrapper (all endpoints) |
| T40 | `[x]` | Set up TanStack Query provider in layout |
| T41 | `[x]` | Implement TanStack Query hooks for CRUD (useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity) |
| T42 | `[x]` | Implement meta data hooks (useMeta for types, statuses, blockchains, tags, organizations) |
| T43 | `[x]` | Build TypeBadge component with color mapping |
| T44 | `[x]` | Define column configuration (type, organization, status, dates, reward, chains, tags, actions) |
| T45 | `[x]` | Build OpportunityTable with TanStack Table (server-side sorting + pagination) |
| T46 | `[x]` | Build FilterBar with TypeFilter (prominent), StatusFilter, OrganizationFilter, BlockchainFilter, TagFilter |
| T47 | `[x]` | Build SearchInput with useDebounce (300ms) |
| T48 | `[x]` | Set up URL state sync with nuqs (type[], status, org, chain[], tag[], search, sort, page) |
| T49 | `[>]` | Build EditableCell component (click to edit, blur to save, optimistic update) |
| T50 | `[x]` | Build CreateOpportunityDialog with type selector as first field |
| T51 | `[x]` | Build DeleteConfirmDialog (shows name and type) |
| T52 | `[x]` | Build OpportunityDetail expanded view with type-specific labels |
| T53 | `[x]` | Add loading skeletons |
| T54 | `[x]` | Add empty state (generic and per-type) |
| T55 | `[x]` | Add toast notifications for all CRUD operations |
| T56 | `[>]` | Implement responsive card layout for mobile (with type badge) |
| T57 | `[>]` | Add column visibility toggle |
| T58 | `[>]` | Match Figma design tokens |

---

## User Acceptance Tests

**UAT Status:** `pending`
**Last tested:** —
**Outcome:** —

## Open Questions

- [ ] Tabs vs. multi-select for type filter UX
- [ ] Expandable row vs. side panel for detail view

---

## Notes

- Can run in parallel with Phase 2 (MCP) after Phase 1 completes
- Figma: https://www.figma.com/design/6XUmigbtgLSSnTrKVsh6JY/weminal?node-id=250-1070

---

## Archive
