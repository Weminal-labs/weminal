# API Reference

Base URL: `/api/v1`

## Endpoints

### GET /opportunities

List opportunities with filtering, sorting, and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | — | hackathon, grant, fellowship, bounty |
| status | string | — | discovered, evaluating, applying, accepted, in_progress, submitted, completed, rejected, cancelled |
| organization | string | — | Filter by organization name |
| blockchain | string | — | Filter by blockchain (array contains) |
| tag | string | — | Filter by tag (array contains) |
| search | string | — | Full-text search on name + description |
| start_date_gte | date | — | Start date >= value (YYYY-MM-DD) |
| end_date_lte | date | — | End date <= value (YYYY-MM-DD) |
| sort_by | string | created_at | Column to sort by |
| sort_order | asc/desc | desc | Sort direction |
| page | integer | 1 | Page number (1-indexed) |
| per_page | integer | 50 | Results per page (max 200) |

**Example:**
```
GET /api/v1/opportunities?type=grant&status=evaluating&sort_by=reward_amount&sort_order=desc
```

**Response 200:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "per_page": 50, "total": 8, "total_pages": 1 }
}
```

### GET /opportunities/:id

Get a single opportunity by UUID.

**Response 404:**
```json
{ "error": { "code": "NOT_FOUND", "message": "Opportunity not found" } }
```

### POST /opportunities

Create a new opportunity. `name` and `type` are required.

**Request Body:**
```json
{
  "name": "ETHGlobal Bangkok",
  "type": "hackathon",
  "organization": "ETHGlobal",
  "reward_amount": 500000,
  "blockchains": ["Ethereum", "Polygon"]
}
```

**Response 201:** Created opportunity with generated id.

### PATCH /opportunities/:id

Partial update — only provided fields are changed.

### DELETE /opportunities/:id

Hard delete. Returns `{ "success": true, "deleted_id": "..." }`.

### Meta Endpoints

| Endpoint | Returns |
|----------|---------|
| GET /meta/types | `["hackathon", "grant", "fellowship", "bounty"]` |
| GET /meta/statuses | All 9 status enum values |
| GET /meta/blockchains | Distinct blockchains in database |
| GET /meta/tags | Distinct tags in database |
| GET /meta/organizations | Distinct organizations |

### GET /health

```json
{ "status": "ok", "db": "connected", "timestamp": "..." }
```

Returns 503 if database unreachable.

## Error Format

All errors use this shape:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | RATE_LIMITED | INTERNAL_ERROR",
    "message": "Human readable message",
    "details": []
  }
}
```

## Rate Limiting

100 requests per minute per IP. Exceeding returns 429 with `Retry-After` header.
