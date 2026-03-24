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

---

## MCP Tools

| Tool | Description | Required Params |
|------|-------------|-----------------|
| `opportunity_list` | List opportunities with filters | none (all optional) |
| `opportunity_get` | Get single opportunity by ID | `id` (UUID) |
| `opportunity_create` | Create new opportunity | `name`, `type` |
| `opportunity_update` | Update existing opportunity | `id` (UUID) |
| `opportunity_delete` | Delete opportunity by ID | `id` (UUID) |

## MCP Resources

| URI | Description |
|-----|-------------|
| `opportunity://meta/types` | Valid type enum values |
| `opportunity://meta/statuses` | Valid status enum values |
| `opportunity://meta/blockchains` | Distinct blockchains in database |
| `opportunity://meta/tags` | Distinct tags in database |
