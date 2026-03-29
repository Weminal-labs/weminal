# Project Roadmap

**Project:** Crypto Opportunities Database
**Current Phase:** v1 Released, v1.1 Planning
**Timeline:** 4 weeks past (v1), 2 weeks upcoming (v1.1), 8 weeks (v2 design)
**Last Updated:** 2026-03-29

---

## v1 — Core (Released ✅)

### Phase 1: Database & API (Week 1) ✅
- ✅ Supabase PostgreSQL setup
  - opportunities table (single table design with type enum)
  - 4 initial statuses
  - GIN indexes on blockchains, tags
  - Full-text search index
  - RLS policies (service_role bypass)
- ✅ Hono REST API with full CRUD
- ✅ Zod validation schemas
- ✅ Dynamic query builder with filtering
- ✅ Meta endpoints (types, statuses, blockchains, tags)
- ✅ Health check endpoint
- ✅ Rate limiting middleware (100 req/min/IP)
- ✅ Error handling + request logging
- ✅ CORS + security headers
- ✅ Seed data (25+ opportunities)

### Phase 2: MCP Server (Week 2) ✅
- ✅ MCP server with @modelcontextprotocol/sdk
- ✅ 5 opportunity tools (list, get, create, update, delete)
- ✅ stdio transport for local Claude Code
- ✅ Response formatting with summaries
- ✅ Error handling for tool calls
- ✅ Build script (esbuild bundle)
- ✅ Claude Code configuration examples

### Phase 3: Web Frontend (Weeks 2-3) ✅
- ✅ Next.js 16 (App Router) + React 19
- ✅ shadcn/ui component setup
- ✅ TanStack Table + TanStack Query integration
- ✅ API client with fetch wrapper
- ✅ Type badges (blue/green/purple/orange)
- ✅ Opportunities table with columns (type, status, org, reward, dates)
- ✅ FilterBar (type, status, org, blockchain, tag, search)
- ✅ URL state sync with nuqs
- ✅ Inline cell editing with optimistic updates
- ✅ Create/edit/delete dialogs
- ✅ Detail view with type-specific labels
- ✅ Loading skeletons, empty states, toast notifications
- ✅ Responsive mobile layout (card view)
- ✅ Column visibility toggle

### Phase 4: Deployment & Polish (Week 4) ✅
- ✅ Vercel deployment configured
- ✅ Environment variables managed
- ✅ Rate limiting middleware
- ✅ Production CORS + security headers
- ✅ Security audit (inputs, secrets, error messages)
- ✅ Performance review (Lighthouse, latency)
- ✅ MCP server bundle + distribution
- ✅ GitHub Actions CI (lint + typecheck)
- ✅ Documentation (README, API reference, MCP setup)
- ✅ End-to-end testing (web + MCP)
- ✅ Cross-browser testing
- ✅ Live at weminal.vercel.app

### Phase 5: Hacker Calendar (1.5 weeks) ✅
- ✅ 3 new tables: calendar_blocks, milestones, proposals
- ✅ Calendar API (CRUD for blocks/milestones/proposals)
- ✅ 4 new MCP tools (milestone CRUD, proposal CRUD)
- ✅ Week view (7-column grid, AM/PM slots)
- ✅ Month view (4-month compact calendar)
- ✅ Drag-and-drop: opportunities → calendar blocks
- ✅ Block moving within calendar
- ✅ Detail panel with editing
- ✅ Milestone timeline strip
- ✅ Post-event notes (markdown, status)
- ✅ App header navigation (/hack ↔ /calendar)
- ✅ Homepage with navigation links
- ✅ Mobile card view for opportunities
- ✅ HTTP MCP endpoint at /api/mcp
- ✅ MCP usage dialog with snippets
- ✅ Charts: area, bar, line, funnel
- ✅ Weekly review with bento grid
- ✅ Card stack animations
- ✅ Rich popovers for notes

---

## v1.1 — Polish (Upcoming, 2 weeks)

### Priority 1: Keyboard Navigation
- [ ] Cmd+K global search across all opportunities
- [ ] Arrow keys to navigate table rows
- [ ] Escape to close dialogs/panels
- [ ] Enter to submit forms
- [ ] Tab navigation through form fields
- [ ] Space to toggle checkboxes/selections
- **Status:** Planned

### Priority 2: Table Enhancements
- [ ] Resizable columns (drag column borders)
- [ ] Column reordering (drag headers)
- [ ] Save column preferences to localStorage
- [ ] Type filter quick-toggle buttons (instead of dropdown)
- [ ] Row hover highlighting
- [ ] Better FTS with ILIKE fallback
- **Status:** Planned

### Priority 3: Animations & UX
- [ ] Smooth expand/collapse transitions
- [ ] Page transitions (Framer Motion)
- [ ] Loading state skeleton improvements
- [ ] Toast notifications stacking
- [ ] Hover effects on interactive elements
- **Status:** Planned

### Priority 4: Testing
- [ ] Unit tests for utility functions
- [ ] Integration tests for API routes (Jest + Supertest)
- [ ] Component tests for table + filters (Vitest + Testing Library)
- [ ] E2E tests for critical flows (Playwright)
- [ ] MCP tool tests (mock Supabase client)
- [ ] Target 70%+ code coverage
- **Status:** Planned

### Priority 5: Docs & Maintenance
- [ ] Add JSDoc comments to exported functions
- [ ] Create troubleshooting guide
- [ ] Document common workflows
- [ ] Update deployment guide with v1.1 changes
- [ ] Create contributor guide
- **Status:** Planned

---

## v2 — Expansion (8 weeks, post-PMF)

### Phase 1: Authentication (2 weeks)
- [ ] Supabase Auth setup (GitHub OAuth)
- [ ] User profile page (/profile)
- [ ] Team management
- [ ] Permission system (viewer, editor, admin)
- [ ] Logout functionality
- [ ] Invite team members via email
- **Impact:** Enable private data per user, soft delete archived opportunities

### Phase 2: Row-Level Security (RLS) (1 week)
- [ ] Enable RLS on all tables
- [ ] Policy: users see only their own data
- [ ] Policy: admins see team data
- [ ] Supabase Auth integration with RLS
- [ ] Remove service_role bypass dependency
- **Impact:** Multi-tenant ready, production security

### Phase 3: Data Management (2 weeks)
- [ ] Soft deletes + deleted_at column
- [ ] Archive view (see deleted opportunities)
- [ ] Restore deleted records
- [ ] Audit logging for sensitive operations
- [ ] Data export (CSV, JSON)
- [ ] Data import from CSV
- **Impact:** Data governance, compliance, safety net for users

### Phase 4: Real-Time & Webhooks (2 weeks)
- [ ] Supabase Realtime for live table updates
- [ ] WebSocket subscription to opportunities
- [ ] Discord webhooks (status change, deadline approaching)
- [ ] Slack webhooks (integrations)
- [ ] Email notifications (daily digest, deadline reminders)
- [ ] Webhook delivery retry logic
- **Impact:** Automation, team collaboration, external integrations

### Phase 5: Advanced Features (2 weeks)
- [ ] Submission tracking (linked to opportunities)
- [ ] Deliverable milestones (auto-generated from types)
- [ ] Success/failure outcome tracking
- [ ] Kanban view (group by status or type)
- [ ] Analytics dashboard (reward trends, success rates)
- [ ] Calendar export (.ics, Google Calendar sync)
- **Impact:** Full lifecycle tracking, insights

### Phase 6: Community & Scaling (Ongoing)
- [ ] User-submitted opportunities (with moderation queue)
- [ ] Upvote/downvote opportunities (sorting signal)
- [ ] Mark as stale / out of date
- [ ] Comments on opportunities
- [ ] User reputation system
- [ ] API key auth for third-party consumers
- [ ] Persistent rate limiting (Upstash Redis)
- **Impact:** Network effects, data quality, monetization ready

---

## v3+ — SaaS & Scale (Post-v2 success)

### v3: White-Label & Monetization
- [ ] SaaS pricing tiers (Freemium, Pro, Enterprise)
- [ ] Stripe integration for payments
- [ ] Usage metering (API calls, tool calls)
- [ ] Branded instances for hackathon platforms
- [ ] Custom domain support
- [ ] API key management dashboard
- [ ] Premium analytics reports

### v4: Mobile & Expansion
- [ ] Mobile-native app (iOS + Android)
- [ ] Offline mode (local storage sync)
- [ ] Push notifications for deadlines
- [ ] Mobile calendar widget
- [ ] Multi-tenancy (support for organizations)

### v5+: AI & Discovery
- [ ] Opportunity recommendations (ML-based)
- [ ] Auto-discovery (scrape aggregator sites)
- [ ] Similarity search (find similar opportunities)
- [ ] Opportunity sentiment analysis
- [ ] AI-powered deadline reminders
- [ ] Claude integration for opportunity summaries

---

## Feature Dependencies

```
v1 (Released)
  ├─ Phase 1: Database & API
  ├─ Phase 2: MCP Server (depends on API)
  ├─ Phase 3: Web Frontend (depends on API)
  ├─ Phase 4: Deployment (depends on 1-3)
  └─ Phase 5: Calendar (depends on 1)

v1.1 (Upcoming)
  ├─ Keyboard Navigation (independent)
  ├─ Table Enhancements (depends on frontend)
  ├─ Animations (independent)
  ├─ Testing (depends on code)
  └─ Docs (independent)

v2 (Planned)
  ├─ Phase 1: Auth
  ├─ Phase 2: RLS (depends on Phase 1)
  ├─ Phase 3: Data Management (independent)
  ├─ Phase 4: Webhooks (depends on Phase 1)
  └─ Phase 5: Advanced (depends on all phases)
```

---

## Success Metrics by Phase

### v1 (Released)
| Metric | Target | Status |
|--------|--------|--------|
| API response time (p95) | <200ms | ✅ ~80-100ms |
| MCP tool execution | <500ms | ✅ ~200-300ms |
| Web table render (100 rows) | <1s | ✅ ~800ms |
| Database query time | <50ms | ✅ ~40-50ms |
| Uptime | 99.5% | ✅ 99.9% |

### v1.1 (Upcoming)
| Metric | Target |
|--------|--------|
| Code coverage | 70%+ |
| Lighthouse score | 90+ |
| Bug resolution time | <24h critical |
| Keyboard nav coverage | 90%+ of flows |

### v2 (Future)
| Metric | Target |
|--------|--------|
| Time-to-first-byte (auth required) | <500ms |
| RLS query overhead | <10% |
| Email delivery success | 99%+ |
| Webhook retry success | 95%+ |

---

## Known Issues & Backlog

### Critical (Fix in v1.1)
- [ ] Type filter dropdown UX (switch to buttons)
- [ ] Mobile calendar view is card-based (acceptable for v1)
- [ ] No undo for delete operations (require confirmation)

### High Priority (v1.1)
- [ ] Add automated tests (unit + integration + E2E)
- [ ] Keyboard navigation for accessibility
- [ ] Resizable/reorderable columns
- [ ] Search performance for 10K+ opportunities

### Medium Priority (v2)
- [ ] Soft deletes for safety
- [ ] User authentication
- [ ] Real-time updates
- [ ] Webhooks for automation

### Low Priority (Backlog)
- [ ] Mobile app
- [ ] Multi-tenancy
- [ ] Advanced analytics
- [ ] ML recommendations

---

## Dependencies & Constraints

### External Services
| Service | Version | Constraint |
|---------|---------|-----------|
| Supabase | Latest | Free tier: 500MB storage, 2GB bandwidth |
| Vercel | Latest | Hobby tier: 100GB bandwidth/month |
| GitHub | N/A | Public repo, CI/CD via Actions |

### Technology Constraints
| Tech | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | Vercel default |
| TypeScript | 6 | Strict mode required |
| React | 19 | App Router (Next.js 16) |
| Next.js | 16 | Vercel native |
| Hono | Latest | API framework |
| Zod | 4 | Validation |

### Adoption Constraints
| Factor | Impact | Mitigation |
|--------|--------|-----------|
| User authentication missing (v1) | Only trusted teams can use | v2: Add auth |
| Hard deletes only | No undo possible | v2: Add soft deletes |
| No real-time updates | Polling required | v2: Add Realtime |
| MCP 50KB response limit | Agents see summaries only | Strategy: works fine for MVP |

---

## Go-to-Market Timeline

### Phase 1: Founder-Led (Weeks 1-4)
- Target: crypto hackathon participants + grant seekers
- Channels: Twitter, Discord, ETHGlobal, Buildspace
- Message: "Never miss a crypto opportunity again"
- Goal: 50 signups, 1000 opportunities seeded

### Phase 2: Partnership (Months 2-3)
- Integrate into hackathon platforms (ETHGlobal, Buildspace)
- Develop API partnerships for data feed
- Goal: 500 monthly active users

### Phase 3: Community (Months 4-6)
- Hackathon-sponsored features
- Community-contributed opportunities
- Goal: 1000+ monthly active users

### Phase 4: Scale (Months 7-12)
- v2 release (auth, webhooks, analytics)
- Premium tier rollout
- Goal: 5000+ monthly active users

---

## Roadmap Timeline (Gantt View)

```
Week 1-4:   v1 Development and Launch
            [████████████████████]

Weeks 5-10: v1.1 Polish & Testing
                      [██████████████]

Weeks 11-18: v2 Expansion (Post-PMF)
                              [████████████████████████████]

Months 6+:  v3+ Scale & Monetization
                                                    [████████]

Timeline:   ├──────────────────────────────────────────────────┤
            0     2 weeks      4 weeks      8 weeks      12 weeks
```

---

## Decision Log

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Single table (type enum) | v1 | Simpler queries, no joins, single migration |
| Hono in Next.js | v1 | One Vercel project, no CORS between services |
| service_role key only (v1) | v1 | Simpler implementation, RLS prepared for v2 |
| No auth (v1) | v1 | Faster MVP, trusted team access only |
| Hard deletes (v1) | v1 | Minimal complexity, soft deletes in v2 |
| GitHub OAuth (v2) | v2 | Lower friction than email, crypto builders use GitHub |
| Stripe (v3) | v3 | Standard payment processor, good crypto community support |

---

## Handoff Notes

- **v1 is production-ready** — live at weminal.vercel.app
- **v1.1 focus:** keyboard nav, tests, resizable columns
- **v2 requires auth:** design RLS policies carefully
- **Keep backward compatibility:** API versioning if needed
- **Monitor adoption:** decide v2 timeline based on user metrics
- **Community feedback:** prioritize most-requested features

For detailed implementation guidance, see:
- `docs/code-standards.md` — Coding conventions
- `docs/system-architecture.md` — Technical design
- `docs/api-reference.md` — API endpoints
- `docs/mcp-setup.md` — MCP integration
- `context/project/TASK-LIST.md` — Detailed tasks
