# Feature: Hacker Calendar

> **Status:** `complete`
> **Phase:** v1.1 — Phase 5
> **Last updated:** 2026-03-25

---

## Summary

A visual time-blocking calendar view for crypto hackers. Drag opportunities from a sidebar onto a weekly/monthly calendar to plan your hacking schedule. Adds 3 new Supabase tables (calendar_blocks, milestones, proposals) that reference the existing `opportunities` table. Inspired by Timeslice's UI patterns but with Supabase persistence instead of localStorage.

---

## Users

- **Crypto developer** — plans their hackathon/grant/bounty schedule visually
- **Claude agent** — queries milestones, manages proposals via MCP tools

---

## User Stories

- As a **hacker**, I want to drag opportunities onto a weekly calendar so I can plan which hackathons to attend
- As a **grant applicant**, I want to see all deadlines on a calendar so I don't miss submission dates
- As a **hacker**, I want to add milestones (office hours, deadlines) to opportunities so I can track key dates
- As a **hacker**, I want to draft proposals linked to opportunities so everything is in one place
- As a **hacker**, I want to mark completed blocks with notes and learnings for future reference
- As a **Claude agent**, I want to list upcoming milestones so I can remind the user about deadlines

---

## Behaviour

### Happy Path

1. User navigates to /calendar
2. Week view shows current week with AM/PM slots
3. Sidebar lists opportunities from Supabase, grouped by type
4. User drags "ETHGlobal Bangkok" onto Thursday AM → POST creates calendar_block
5. User clicks block → detail panel opens with notes, milestones, proposal editor
6. User adds milestone "Registration deadline" → saved to milestones table
7. After hackathon, user marks block as "done" with notes about results

### Edge Cases & Rules

- Custom events (no opportunity_id) appear in Slate-400 outlined blocks
- Completed/skipped blocks show muted styling (opacity-50 or strikethrough)
- Moving a block (drag within calendar) → PATCH updates date + slot
- Deleting an opportunity cascades to its blocks, milestones, and proposal

---

## Connections

- **Depends on:** Database & API (Phase 1), Web Frontend (Phase 3)
- **Extends:** opportunities table (FK references), existing Hono API, MCP server
- **New tables:** calendar_blocks, milestones, proposals
- **Navigation:** /hack ↔ /calendar (tab navigation in header)

---

## MVP vs Full Version

| Aspect | MVP (Phase 5) | Full Version |
|--------|---------------|--------------|
| Views | Week + Month | + Day view, hourly slots |
| DnD | Native HTML5 | + touch support, auto-scroll |
| Calendar sync | None | Google Calendar .ics export |
| Collaboration | Single user | Team calendars (needs auth) |
| Suggestions | None | AI recommends which hacks to prioritize |
| Reminders | None | Browser notifications for milestones |

---

## Security Considerations

- Same RLS strategy as opportunities (service_role only, no anon)
- Zod validation on all new endpoints
- UUID validation on all path params
- CASCADE deletes — deleting opportunity removes linked blocks/milestones/proposals

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T78 | `[x]` | Create migration: calendar_blocks table + indexes + trigger + RLS |
| T79 | `[x]` | Create migration: milestones table + indexes + trigger + RLS |
| T80 | `[x]` | Create migration: proposals table + indexes + trigger + RLS |
| T81 | `[x]` | Seed milestones for existing opportunities |
| T82 | `[x]` | Zod schemas for blocks, milestones, proposals |
| T83 | `[x]` | API routes: /calendar/blocks CRUD with date range filter |
| T84 | `[x]` | API routes: /opportunities/:id/milestones CRUD + /milestones date range |
| T85 | `[x]` | API routes: /opportunities/:id/proposal GET/PUT/DELETE |
| T86 | `[x]` | MCP tools: milestone_list, milestone_create |
| T87 | `[x]` | MCP tools: proposal_get, proposal_update |
| T88 | `[x]` | Install date-fns |
| T89 | `[x]` | CalendarPage /calendar route with header + view toggle + navigation |
| T90 | `[x]` | WeekView — 7-column CSS grid with AM/PM slots |
| T91 | `[x]` | MonthView — 4-month compact grid |
| T92 | `[x]` | BlockCard component with type-colored styling |
| T93 | `[x]` | OpportunitySidebar (draggable cards, type filter, search) |
| T94 | `[x]` | Drag & Drop: sidebar → calendar (POST new block) |
| T95 | `[x]` | Drag & Drop: calendar → calendar (PATCH move block) |
| T96 | `[x]` | DetailPanel with block editing (hours, notes, status) |
| T97 | `[x]` | MilestoneList + AddMilestoneForm per opportunity |
| T98 | `[x]` | MilestoneTimeline strip below calendar |
| T99 | `[x]` | ProposalEditor — markdown textarea, status, links |
| T100 | `[x]` | App header navigation: /hack ↔ /calendar tabs |
| T101 | `[x]` | TanStack Query hooks for blocks, milestones, proposals |
| T102 | `[x]` | Empty states + loading skeletons for calendar |
| T103 | `[x]` | Post-event re-noting (done/skipped status, muted styling) |

---

## User Acceptance Tests

**UAT Status:** `pending`
**Last tested:** —
**Outcome:** —

## Open Questions

- [ ] Should month view show 4 months or 3 months?
- [ ] Touch device DnD — defer or build with fallback?

---

## Notes

- Timeslice repo for reference: github.com/Shpigford/timeslice
- No calendar library needed — CSS grid + date-fns is sufficient
- Route at /calendar, table stays at /hack

---

## Archive
