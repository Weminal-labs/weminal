# API Contracts

> Generated from PRD API specification.

## Conventions

- **Base URL:** `/api/v1`
- **Auth:** No auth in v1 — service_role key used server-side only
- **Content-Type:** `application/json`
- **Error format:** `{ "error": { "code": "...", "message": "...", "details": [] } }`
- **Pagination:** 1-indexed pages, default 50 per page, max 200

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### GET /opportunities

List opportunities with filtering, sorting, pagination.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Filter by opportunity type (hackathon, grant, fellowship, bounty) |
| `status` | string | Filter by status enum value |
| `organization` | string | Filter by organization name |
| `blockchain` | string | Filter by blockchain (array contains) |
| `tag` | string | Filter by tag (array contains) |
| `search` | string | Full-text search on name and description |
| `start_date_gte` | date | Start date >= value |
| `end_date_lte` | date | End date <= value |
| `sort_by` | string | Column to sort by (default: created_at) |
| `sort_order` | asc/desc | Sort direction (default: desc) |
| `page` | integer | Page number, 1-indexed (default: 1) |
| `per_page` | integer | Results per page (default: 50, max: 200) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "ETHGlobal Bangkok",
      "type": "hackathon",
      "description": "Build the future of Ethereum",
      "status": "discovered",
      "organization": "ETHGlobal",
      "website_url": "https://ethglobal.com/bangkok",
      "start_date": "2026-05-15",
      "end_date": "2026-05-17",
      "reward_amount": 500000.00,
      "reward_currency": "USD",
      "reward_token": null,
      "blockchains": ["Ethereum", "Polygon", "Arbitrum"],
      "tags": ["defi", "infrastructure"],
      "links": [
        { "label": "Discord", "url": "https://discord.gg/ethglobal" },
        { "label": "Twitter", "url": "https://x.com/ETHGlobal" }
      ],
      "notes": "Team interested, need to check dates",
      "created_at": "2026-03-20T10:00:00Z",
      "updated_at": "2026-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 127,
    "total_pages": 3
  }
}
```

---

### GET /opportunities/:id

**Response 200:** Single opportunity object (same shape as list item).

**Response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "Opportunity not found" } }
```

---

### POST /opportunities

**Required fields:** `name`, `type`

**Request Body:**
```json
{
  "name": "Gitcoin GG21",
  "type": "grant",
  "status": "evaluating",
  "organization": "Gitcoin",
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "reward_amount": 50000,
  "reward_currency": "USD",
  "reward_token": "USDC",
  "blockchains": ["Ethereum"],
  "tags": ["public-goods", "infrastructure"],
  "links": [{ "label": "Apply", "url": "https://gitcoin.co/grants" }]
}
```

**Response 201:** Created opportunity with generated `id`, `created_at`, `updated_at`.

**Response 400:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": [...] } }
```

---

### PATCH /opportunities/:id

Partial update — only provided fields are changed.

**Request Body:** Any subset of opportunity fields.

**Response 200:** Updated opportunity object.

---

### DELETE /opportunities/:id

Hard delete.

**Response 200:**
```json
{ "success": true, "deleted_id": "550e8400-e29b-41d4-a716-446655440000" }
```

---

### GET /meta/types

```json
{ "data": ["hackathon", "grant", "fellowship", "bounty"] }
```

### GET /meta/statuses

```json
{ "data": ["discovered", "evaluating", "applying", "accepted", "in_progress", "submitted", "completed", "rejected", "cancelled"] }
```

### GET /meta/blockchains

Returns distinct blockchains used across all opportunities.

### GET /meta/tags

Returns distinct tags used across all opportunities.

### GET /meta/organizations

Returns distinct organizations across all opportunities.

### GET /health

```json
{ "status": "ok", "db": "connected", "timestamp": "2026-03-24T10:00:00Z" }
```

Returns 503 if database is unreachable.

### POST /calendar/blocks

Create a calendar block (opportunity time slot).

**Request Body:**
```json
{
  "opportunity_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-04-15",
  "slot": "morning",
  "hours": 4,
  "notes": "Focus on UI design"
}
```

**Response 201:** Created block with `id`, `created_at`, `updated_at`.

### GET /calendar/blocks

List calendar blocks with date range filter.

**Query Parameters:**
- `start_date`: ISO date (inclusive)
- `end_date`: ISO date (inclusive)
- `opportunity_id`: Filter by opportunity (optional)

**Response 200:** Array of blocks.

### PATCH /calendar/blocks/:id

Update block (move to different date/slot, change notes, mark done/skipped).

**Response 200:** Updated block.

### DELETE /calendar/blocks/:id

Delete block.

**Response 200:** `{ "success": true, "deleted_id": "..." }`

### POST /opportunities/:id/milestones

Create milestone for opportunity.

**Request Body:**
```json
{
  "title": "Registration deadline",
  "date": "2026-05-10",
  "notes": "Team roster due"
}
```

**Response 201:** Created milestone.

### GET /opportunities/:id/milestones

List milestones for opportunity.

### PATCH /milestones/:id

Update milestone.

### DELETE /milestones/:id

Delete milestone.

### GET /milestones

List all milestones with optional date range filter.

**Query Parameters:**
- `start_date`: ISO date (inclusive)
- `end_date`: ISO date (inclusive)

### GET /opportunities/:id/proposal

Get proposal for opportunity.

### POST /opportunities/:id/proposal

Create or update proposal for opportunity.

**Request Body:**
```json
{
  "content": "Markdown proposal text",
  "status": "draft",
  "links": [{ "label": "Submission", "url": "https://..." }]
}
```

### PATCH /proposals/:id

Update proposal.

### DELETE /proposals/:id

Delete proposal.

---

## HTTP MCP Endpoint

**Base URL:** `/api/mcp`

**Transport:** JSON-RPC 2.0 over HTTP POST. GET returns server info.

### Authentication

- **Public read tools:** `opportunity_list`, `opportunity_get`, `block_list`, `milestone_list`, `proposal_get`
- **Authenticated write tools:** all `_create`, `_update`, `_delete` operations
- **Header:** `Authorization: Bearer <MCP_API_KEY>` (required for write)

### POST /api/mcp

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "opportunity_list",
    "arguments": { "type": "grant" }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "..." }]
  }
}
```

Also supports:
- `initialize` — get protocol version and capabilities
- `tools/list` — list available tools
- `resources/list` — list available resources
- `resources/read` — read a resource by URI
- `notifications/initialized` — acknowledge initialization

### GET /api/mcp

Returns server info, auth scheme, available tools, and Claude Code configuration example.

---

## MCP Tools (16 total)

### Opportunity Tools (5)
| Tool | Auth | Description |
|------|------|-------------|
| `opportunity_list` | public | List opportunities with filters |
| `opportunity_get` | public | Get single opportunity by ID |
| `opportunity_create` | auth | Create new opportunity |
| `opportunity_update` | auth | Update existing opportunity |
| `opportunity_delete` | auth | Delete opportunity by ID |

### Calendar Block Tools (6)
| Tool | Auth | Description |
|------|------|-------------|
| `block_list` | public | List blocks with date range filter |
| `block_get` | public | Get block by ID |
| `block_create` | auth | Create calendar block |
| `block_update` | auth | Update/move block |
| `block_delete` | auth | Delete block |

### Milestone Tools (4)
| Tool | Auth | Description |
|------|------|-------------|
| `milestone_list` | public | List milestones with date range filter |
| `milestone_get` | public | Get milestone by ID |
| `milestone_create` | auth | Create milestone |
| `milestone_update` | auth | Update milestone |
| `milestone_delete` | auth | Delete milestone |

### Proposal Tools (2)
| Tool | Auth | Description |
|------|------|-------------|
| `proposal_get` | public | Get proposal by ID or opportunity_id |
| `proposal_update` | auth | Update proposal |

## MCP Resources

| URI | Description |
|-----|-------------|
| `opportunity://meta/types` | Valid type enum values |
| `opportunity://meta/statuses` | Valid status enum values |
| `opportunity://meta/blockchains` | Distinct blockchains in database |
| `opportunity://meta/tags` | Distinct tags in database |
| `opportunity://calendar/upcoming-milestones` | Milestones in next 30 days |
| `opportunity://calendar/blocks-by-week` | Blocks grouped by week |
