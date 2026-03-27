# Feature: Deployment & Polish

> **Status:** `mostly-complete`
> **Phase:** v1 — Phase 4
> **Last updated:** 2026-03-26

---

## Summary

Deploy the complete application to Vercel, configure production environment, add rate limiting and security hardening, bundle MCP server for distribution, and write documentation. Application is live at weminal.vercel.app with web UI (/hack, /calendar, /), Hono REST API, HTTP MCP endpoint, and stdio MCP server. Manual `npx vercel --prod` deploy (not auto-deploy from git).

---

## Users

- **End users** — access production deployment
- **Developers** — use documentation to set up, contribute, or configure MCP
- **Ops** — monitor production health

---

## User Stories

- As a **user**, I want a deployed production URL so I can use the app
- As a **developer**, I want clear docs so I can set up the MCP server or contribute
- As a **user**, I want the app to be secure so my data is protected

---

## Behaviour

### Happy Path

1. Push to main → Vercel auto-deploys
2. Production URL serves web UI + API
3. MCP server bundle available for Claude Code configuration

### Edge Cases & Rules

- Rate limit exceeded → 429 with Retry-After header
- CORS violation → request blocked
- DB unreachable → health check returns 503
- Cold start on serverless → first request slower (acceptable for MVP)

---

## Connections

- **Depends on:** All previous phases (1, 2, 3)
- **Triggers:** Production availability, documentation

---

## Security Considerations

- All Vercel env vars encrypted at rest
- Rate limiting on all API endpoints (100 req/min per IP)
- Security headers on all responses (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- CORS restricted to production domain
- Security audit: verify no secrets in client bundle, no raw SQL, proper error responses

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T59 | `[x]` | Set up Vercel project and connect GitHub repo |
| T60 | `[x]` | Configure production environment variables in Vercel |
| T61 | `[x]` | Deploy initial build to Vercel and verify |
| T62 | `[x]` | Implement rate limiting middleware (100 req/min per IP) |
| T63 | `[x]` | Configure production CORS |
| T64 | `[x]` | Add security response headers middleware |
| T65 | `[x]` | Security audit (inputs, secrets, error messages, enum validation) |
| T66 | `[>]` | Performance review (Lighthouse, API latency, Supabase queries) | Deferred to v1.1 |
| T67 | `[x]` | Build and test MCP server bundle (esbuild → dist/mcp-server.mjs) |
| T68 | `[x]` | Create Claude Code config example for MCP |
| T69 | `[x]` | Set up GitHub Actions CI (lint + typecheck on PR) |
| T70 | `[x]` | Write README.md |
| T71 | `[x]` | Write API reference docs |
| T72 | `[x]` | Write MCP setup guide |
| T73 | `[x]` | Write deployment guide |
| T74 | `[>]` | End-to-end testing (web + MCP, all 4 types) | Deferred to v1.1 |
| T75 | `[>]` | Cross-browser testing (Chrome, Firefox, Safari, Edge) | Deferred to v1.1 |
| T76 | `[>]` | Mobile responsive testing | Deferred to v1.1 |
| T77 | `[ ]` | Run launch checklist | Pending |

---

## User Acceptance Tests

**UAT Status:** `pending`
**Last tested:** —
**Outcome:** —

## Open Questions

- [ ] Custom domain for production

---

## Notes

- Final phase — do not start until Phases 1-3 are complete
- In-memory rate limiter resets on cold start — acceptable for MVP

---

## Archive
