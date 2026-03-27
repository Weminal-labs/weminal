# Feature: Bootcamp Type

> **Status:** `draft`
> **Phase:** v1
> **Last updated:** 2026-03-26

---

## Summary

Bootcamp is a 5th opportunity type for educational or intensive training programs. Bootcamps can be linked to a parent hackathon, establishing a hierarchical relationship. Users can filter bootcamps by their parent hackathon and see the parent hackathon name in the UI.

---

## Users

- **Hackers** — searching for bootcamps related to specific hackathons they're attending
- **Calendar users** — organizing training programs alongside hackathon participation
- **Agents** — creating bootcamp opportunities and linking them to hackathons programmatically

---

## User Stories

- As a **hacker**, I want to **create a bootcamp and link it to a hackathon** so that **I can track training for that specific event**
- As a **hacker**, I want to **see which hackathon a bootcamp belongs to** so that **I can understand the context and relationship**
- As a **calendar user**, I want to **filter bootcamps by parent hackathon** so that **I can find all training programs for one event**
- As an **agent**, I want to **create bootcamps linked to hackathons** so that **I can programmatically organize training opportunities**
- As an **agent**, I want to **list all bootcamps for a hackathon** so that **I can retrieve related opportunities**

---

## Behaviour

### Happy Path

1. User creates a new opportunity with type = "bootcamp"
2. System shows a "Parent Hackathon" dropdown (optional)
3. User selects a hackathon from the list (or leaves blank)
4. System creates the bootcamp with `parent_hackathon_id` set
5. In the opportunities table, a "Parent Hackathon" column displays the parent's name (if linked)
6. User can filter the table to show only bootcamps for a specific hackathon
7. The bootcamp appears with a teal badge to distinguish it from other types

### Edge Cases & Rules

- A bootcamp's `parent_hackathon_id` can only reference opportunities with type = 'hackathon'
- The `parent_hackathon_id` is nullable — bootcamps don't require a parent
- Deleting a hackathon sets `parent_hackathon_id` to NULL on any linked bootcamps (no cascade delete)
- Only bootcamp type can have a `parent_hackathon_id` — attempting to set it on other types is rejected
- The "Parent Hackathon" column is hidden by default but can be toggled visible
- TypeBadge uses teal (`bg-teal-100 text-teal-800`) for bootcamp type

---

## Connections

- **Depends on:** database-and-api (migration, Zod schemas, query builder)
- **Shares data with:** web-frontend (TypeBadge, TypeFilter, dialogs, table columns), mcp-server (tool args, resources)
- **Triggers:** calendar feature for bootcamp scheduling

---

## MVP vs Full Version

| Aspect | MVP (v1) | Full Version (v2+) |
|--------|----------|-------------------|
| Parent hackathon link | Single hackathon per bootcamp | Multiple linked opportunities per bootcamp |
| Bootcamp filtering | By parent_hackathon_id only | By parent_hackathon_id + tags + blockchain |
| Cascade behavior | SET NULL on delete | Configurable soft delete with archive |
| UI display | Column + filter | Dashboard card grouping bootcamps by hackathon |

---

## Security Considerations

- Input validation: `parent_hackathon_id` must be a valid UUID and reference an existing hackathon opportunity (via FK constraint)
- Type constraint: database-level CHECK ensures `parent_hackathon_id IS NULL OR type = 'bootcamp'`
- No auth required: same as all v1 opportunities (no user-level RLS)

---

## Tasks

> Granular implementation steps for this feature.
> Each task has a global T-number that matches TASK-LIST.md.
> Keep status here in sync with the central task list.
>
> Status: [ ] todo  [~] in progress  [x] done  [-] blocked  [>] deferred

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T111 | `[x]` | Migration: add 'bootcamp' to opportunity_type enum |
| T112 | `[x]` | Migration: add parent_hackathon_id column with FK, constraint, index |
| T113 | `[x]` | Update Zod schemas for bootcamp type + parent_hackathon_id validation |
| T114 | `[x]` | Update query builder for parent_hackathon_id filter + joined query |
| T115 | `[x]` | Update API responses to include parent_hackathon_name |
| T116 | `[x]` | Update MCP tools for bootcamp type + parent_hackathon_id args |
| T117 | `[x]` | Add bootcamp to TypeBadge (teal) and TypeFilter |
| T118 | `[x]` | Add HackathonSelect to CreateOpportunityDialog (type = bootcamp) |
| T119 | `[x]` | Add ParentHackathonChip to table rows + togglable column |
| T120 | `[>]` | Update MCP Usage dialog / docs for bootcamp |

---

## User Acceptance Tests

> Plain-English browser tests generated after this feature is built.
> The full interactive checklist lives in bootcamp-type-uat.md once generated.
>
> UAT status: `pending` | `in-progress` | `passed` | `failed` | `partial`

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

---

## Open Questions

- [ ] Should bootcamps also have start/end dates (training dates) in addition to parent hackathon link?
- [ ] Should we allow a bootcamp to be the parent of another bootcamp (nested bootcamps)?
- [ ] Should filtering by parent_hackathon_id be available in the API but hidden from the UI type filter?

---

## Notes

From PRD:
- W13: Create a bootcamp linked to a hackathon (user story)
- W14: See which hackathon a bootcamp belongs to (user story)
- A8: Agent creates bootcamp linked to hackathon (user story)
- A9: Agent lists all bootcamps for a hackathon (user story)

---

## Archive

<!-- Outdated content goes here — never delete, just move down -->
