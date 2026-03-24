# Testing Strategy

> Pragmatic testing for MVP — manual + automated where it matters most.

## Philosophy

For v1/MVP, focus on:
- Manual API testing for all endpoints
- TypeScript type checking as a first line of defense
- Zod validation as runtime type safety
- Manual browser testing for UI

Automated testing can be added in v1.1 for regression prevention.

## Unit Tests

Priority targets (when added):
- Zod schema validation (edge cases, invalid inputs)
- Query builder (filter combinations, pagination math)
- Type color mapping utility

## Integration Tests

Priority targets (when added):
- API CRUD endpoints (all 4 types)
- Filter combinations (type + status + chain)
- Pagination with various page sizes
- Error responses (400, 404)

## Manual Testing

### API (Phase 1)
- Test all CRUD endpoints with curl / Hoppscotch
- Test type filter (single type, verify correct results)
- Test filter combinations (type + status, type + chain, etc.)
- Test edge cases (empty arrays, null dates, invalid type)
- Verify error responses for invalid inputs
- Check pagination math

### MCP (Phase 2)
- Test each tool via Claude Code across all 4 types
- Test resource reads
- Test error cases (invalid UUID, missing required fields, invalid type)

### Web UI (Phase 3)
- Create opportunity (each type) via web
- Verify type badges display correct colors
- Test all filters (type, status, org, chain, tag, search)
- Test inline editing with optimistic update
- Test responsive layout on mobile
- Cross-browser: Chrome, Firefox, Safari, Edge

### End-to-End (Phase 4)
- Create via web -> verify via MCP tool
- Create via MCP -> verify in web table
- Type filter consistency between web and MCP

## Coverage Goals

- v1: No automated coverage target — focus on shipping
- v1.1: Add tests for API layer, target 80% coverage on API routes
- v2: Add E2E tests with Playwright for critical paths
