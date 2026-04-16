# Feature: Auth — Better Auth Integration

> **Status:** `draft`
> **Phase:** v2 (accelerated to current)
> **Last updated:** 2026-04-08

---

## Summary

Integrate Better Auth (https://better-auth.com) as the authentication and session management layer for Weminal. This replaces the current fully-open, single-tenant access model with a proper multi-user system. Users log in via GitHub OAuth (with Google and Twitter as later additions for the crypto audience). After authenticating, users get access to their personal opportunity data, idea pool write operations, and an on-chain profile linking their Solana/EVM wallet address to their Weminal account. The system also supports delegate/API keys — user-scoped tokens that external services and Claude agents can use to call the Weminal API on behalf of a user without exposing the session cookie. The implementation must run entirely on Cloudflare Pages edge runtime using Better Auth's Cloudflare adapter and Supabase PostgreSQL as the auth database.

---

## Users & Roles

**Weminal Admin** (`role: admin` — Weminal team accounts): Full access — can create, edit, and delete any record regardless of who created it.

**Weminal Member** (`role: member` — community contributors): Can create new records and edit/delete records they created. Cannot touch other users' data.

**Logged-in visitor** (authenticated, no role assigned): Read-only. Can view all public data, vote on ideas (future). Cannot create or edit records.

**Anonymous visitor**: Read-only access to all public endpoints. Sees CTAs prompting login wherever a write action is available (create button, vote button, edit controls).

**Claude agent / external service (API key holder):** Holds a user-generated delegate key. Inherits the key owner's role — an admin's key has admin-level access, a member's key has member-level access.

---

## User Stories

- As a **crypto developer**, I want to log in with GitHub so that I can securely access my personal opportunity tracking data without managing a password.
- As a **logged-in user**, I want to generate an API key so that I can let my Claude agent create and update opportunities on my behalf without sharing my session.
- As a **logged-in user**, I want to link my Solana or EVM wallet address to my profile so that my on-chain identity is tied to my Weminal account.
- As a **Claude agent**, I want to pass a delegate API key in the `Authorization` header so that I can perform write operations on the MCP HTTP endpoint without a browser session.
- As an **anonymous visitor**, I want to read all public opportunity and idea data so that I don't need an account just to browse.

---

## Behaviour

### Happy Path — OAuth Login

1. User clicks "Sign in with GitHub" on the login page (`/login`).
2. Browser is redirected to GitHub's OAuth consent screen.
3. User authorises the Weminal app on GitHub.
4. GitHub redirects to Better Auth's callback URL (`/api/auth/callback/github`).
5. Better Auth looks up or creates a `users` record, creates an `accounts` record (linked OAuth provider), and sets a secure session cookie.
6. User is redirected to `/hack` (or the originally requested page).
7. Session cookie is present; all protected routes now return data.

### Happy Path — API Key Generation

1. Logged-in user navigates to `/profile` → "API Keys" section.
2. User clicks "Generate new key", optionally enters a label (e.g. "Claude agent — laptop").
3. System generates a cryptographically random key, hashes it with sha256, and stores the hash + metadata in `api_keys` table (linked to user ID).
4. The raw key is shown once in a copy-to-clipboard dialog. It is never shown again.
5. User copies the key and pastes it into their Claude config as `Authorization: Bearer <key>`.
6. Subsequent API requests with that key header are validated: hash the provided key, look up the hash in `api_keys`, confirm it belongs to an active key and not expired/revoked.
7. User can see a list of their keys (label, created date, last used date, revoke button). Raw key value is never displayed after initial creation.

### Happy Path — Wallet Linking

1. Logged-in user navigates to `/profile` → "Wallet" section.
2. User pastes a Solana address (base58, 44 chars) or an EVM address (0x…, 42 chars) into the input field.
3. Frontend validates format client-side; server validates again.
4. Address is stored in `user_profiles.solana_wallet` or `user_profiles.evm_wallet` (no on-chain transaction required at this stage).
5. Profile page shows linked addresses.

### Happy Path — Protected API Request (API Key)

1. Claude agent sends `POST /api/mcp` with `Authorization: Bearer wem_<key>` header.
2. MCP route extracts the header, hashes the key, queries `api_keys` for a matching active row.
3. If found: resolves the owning user, proceeds with the tool call as that user.
4. If not found or revoked: returns 403 `{"error": "Invalid or revoked API key"}`.

### Edge Cases & Rules

**Session rules:**
- Sessions expire after 30 days of inactivity. Better Auth handles rotation automatically.
- Logout invalidates the session server-side — clearing the cookie alone is not enough.
- If a user logs in with GitHub and later logs in with Google using the same email, Better Auth links both providers to the same user account (account linking).

**API key rules:**
- Keys are prefixed `wem_` for easy identification in logs and config files.
- Keys are stored as sha256 hashes — the raw key is never stored or retrievable.
- A user can have at most 10 active API keys simultaneously (prevent key sprawl).
- Keys have no expiry by default but can be manually revoked at any time.
- Revoked keys are soft-deleted (set `revoked_at`) so the audit trail is preserved.
- `last_used_at` is updated on every successful validation (max once per minute to avoid write amplification).
- A revoked key returns 403 immediately — same error as an invalid key (do not reveal the distinction).

**Wallet linking rules:**
- Solana address: must pass base58 validation and be exactly 32 bytes decoded (44-char base58).
- EVM address: must match regex `^0x[0-9a-fA-F]{40}$`.
- One Solana address and one EVM address per user. Update replaces the previous value.
- Wallet addresses are not unique constraints across users (same wallet can be listed on multiple accounts — we do not enforce on-chain ownership at this stage).

**Public vs protected routes (with role enforcement):**

| Route | Anonymous | Logged-in (no role) | Member | Admin |
|-------|-----------|---------------------|--------|-------|
| `GET /api/v1/opportunities` | ✅ read | ✅ read | ✅ read | ✅ read |
| `GET /api/v1/opportunities/:id` | ✅ read | ✅ read | ✅ read | ✅ read |
| `POST /api/v1/opportunities` | ❌ 401 | ❌ 403 | ✅ own | ✅ any |
| `PATCH /api/v1/opportunities/:id` | ❌ 401 | ❌ 403 | ✅ own only | ✅ any |
| `DELETE /api/v1/opportunities/:id` | ❌ 401 | ❌ 403 | ✅ own only | ✅ any |
| `GET /api/v1/ideas` | ✅ read | ✅ read | ✅ read | ✅ read |
| `POST /api/v1/ideas/:slug/vote` | ❌ 401 | ✅ vote | ✅ vote | ✅ vote |
| `POST /api/v1/ideas` | ❌ 401 | ❌ 403 | ✅ own | ✅ any |
| Milestone/proposal write routes | ❌ 401 | ❌ 403 | ✅ own only | ✅ any |
| `GET /api/mcp` (info) | ✅ | ✅ | ✅ | ✅ |
| MCP read tools | ✅ | ✅ | ✅ | ✅ |
| MCP write tools | ❌ 403 | ❌ 403 | ✅ own | ✅ any |
| `/api/auth/*` | ✅ (handled by Better Auth) | ✅ | ✅ | ✅ |

> "own only" = `created_by = current_user_id`. Admin bypass: skip ownership check entirely.

**Deployment / edge runtime:**
- The Next.js app runs on Cloudflare Pages via `@cloudflare/next-on-pages`. Better Auth must use its Cloudflare adapter.
- The `better-auth` package's `next` plugin handles the catch-all `[...all]` route at `/api/auth/[...all]/route.ts`.
- Better Auth requires `DATABASE_URL` (a standard Postgres connection string). Supabase provides this via "Transaction" pooler (port 6543) for edge environments.
- Node.js crypto APIs (`crypto.subtle`) are available on Cloudflare Workers/Pages — use web-standard crypto, not Node `crypto` module.

**Error states:**
- GitHub OAuth failure (user denies, network error) → redirect to `/login?error=oauth_failed` with a toast.
- Session expired mid-session → 401 response, frontend redirects to `/login`.
- API key validation failure → 403 with `{"error": "Invalid or revoked API key"}` — no extra detail.
- Wallet address format error → 400 with field-level validation message.
- Concurrent login (same user, different device) → both sessions remain valid (Better Auth allows multiple sessions).

---

## Connections

- **Depends on:** Supabase (PostgreSQL) for auth tables; Better Auth package + Cloudflare adapter
- **Affects:** `src/api/index.ts` — add auth middleware for protected routes
- **Affects:** `src/app/api/mcp/route.ts` — upgrade from static `MCP_API_KEY` to per-user delegate keys
- **Affects:** `src/app/api/[...route]/route.ts` — no change (Hono handles its own auth middleware)
- **New routes:** `src/app/api/auth/[...all]/route.ts` — Better Auth handler
- **New pages:** `src/app/login/page.tsx`, `src/app/profile/page.tsx`
- **Shares data with:** `opportunities`, `ideas`, `milestones`, `proposals` tables (user ownership columns added)
- **Shares data with:** `user_profiles` table (new, defined below)

---

## MVP vs Full Version

| Aspect | MVP (this implementation) | Full Version |
|--------|--------------------------|--------------|
| OAuth providers | GitHub only | GitHub + Google + Twitter (X) |
| Wallet linking | Paste address, store as text | Wallet-sign challenge (on-chain ownership proof) |
| API key expiry | None (manual revoke only) | Optional expiry date per key |
| API key scopes | Full write access | Granular scopes (read-only, specific resource types) |
| User ownership on records | Optional `created_by` user_id FK | Full RLS policies per user (data isolation) |
| Idea voting auth | Any logged-in user can vote once | Vote deduplication enforced at DB level with unique constraint |
| Admin role | Not enforced in v1 (trust model) | Role-based access control (admin, member) |
| Profile page | Wallet linking + API key management | Avatar, display name, notification prefs |
| Session management | Single active session list (view only) | Revoke individual sessions per device |
| MCP auth | API key via Bearer header | OAuth PKCE flow for MCP HTTP (future MCP spec) |

---

## Security Considerations

Based on `context/developer/SECURITY.md`:

**Secrets:**
- `BETTER_AUTH_SECRET` (signing key) — env var only, never committed. Rotate on suspected compromise.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — env vars only. Client secret never exposed to browser.
- `DATABASE_URL` — Supabase Postgres connection string, server-side only. Never prefix with `NEXT_PUBLIC_`.
- Existing `SUPABASE_SERVICE_ROLE_KEY` — unchanged, still server-side only.

**Auth checks:**
- All protected Hono routes validate the request server-side before any DB query.
- Auth middleware validates session cookie OR API key header — if neither is present and valid, return 401/403 before the route handler runs.
- `Authorization` header value is never logged — log only "API key present: yes/no".
- Session tokens expire (30-day rolling window, server-side invalidation on logout).

**API key security:**
- Raw key is shown only once at creation time and never stored. Only the sha256 hash is persisted.
- Key prefix `wem_` appears in stored hashes' context but is not used to derive uniqueness — the full hashed value is the unique identifier.
- Constant-time comparison when validating API keys (already implemented in MCP route — extend this pattern to Hono middleware).
- `last_used_at` must not be logged with the key value — log the key ID (UUID) only.

**Input validation:**
- Wallet addresses validated server-side with regex/format checks before storage.
- API key label: max 100 chars, strip HTML, no special meaning.
- All Better Auth inputs pass through Better Auth's own validation — do not bypass.

**Rate limiting:**
- Apply existing rate limiter to `/api/auth/*` endpoints (login, OAuth callback).
- API key validation does not add a separate rate limit — the existing 100 req/min per IP applies.

**Sensitive data:**
- Email addresses from OAuth providers are stored in Better Auth's `users` table — treat as sensitive, never log.
- Wallet addresses are pseudonymous but still PII-adjacent — do not log them.
- Never include raw API key values in error responses, logs, or analytics.

**CORS:**
- `/api/auth/*` routes need to allow the app's own origin for cookie setting — handled by Better Auth's built-in CORS config.
- Hono CORS config (already in `src/api/index.ts`) already restricts to `ALLOWED_ORIGINS` — no change needed for API routes.

---

## Database Schema Additions

Better Auth requires specific tables. These must be created via a SQL migration run in Supabase dashboard before deployment.

### `users` table (Better Auth core)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Better Auth user ID (nanoid) |
| `name` | TEXT | NOT NULL | Display name from OAuth provider |
| `email` | TEXT | NOT NULL, UNIQUE | Email from OAuth provider |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Whether email is verified |
| `image` | TEXT | nullable | Avatar URL from OAuth provider |
| `created_at` | TIMESTAMPTZ | NOT NULL | Account creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update time |

### `sessions` table (Better Auth core)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Session ID |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiry |
| `token` | TEXT | NOT NULL, UNIQUE | Session token |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |
| `ip_address` | TEXT | nullable | IP at login |
| `user_agent` | TEXT | nullable | Browser UA at login |
| `user_id` | TEXT | NOT NULL, FK → users.id | Owning user |

### `accounts` table (Better Auth core)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Account ID |
| `account_id` | TEXT | NOT NULL | Provider's user ID |
| `provider_id` | TEXT | NOT NULL | e.g. "github" |
| `user_id` | TEXT | NOT NULL, FK → users.id | Owning user |
| `access_token` | TEXT | nullable | OAuth access token |
| `refresh_token` | TEXT | nullable | OAuth refresh token |
| `id_token` | TEXT | nullable | OIDC id token |
| `access_token_expires_at` | TIMESTAMPTZ | nullable | Token expiry |
| `refresh_token_expires_at` | TIMESTAMPTZ | nullable | Refresh expiry |
| `scope` | TEXT | nullable | Granted scopes |
| `password` | TEXT | nullable | For email/password (not used) |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update |

### `verifications` table (Better Auth core)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Verification ID |
| `identifier` | TEXT | NOT NULL | e.g. email address |
| `value` | TEXT | NOT NULL | Verification token/code |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Expiry |
| `created_at` | TIMESTAMPTZ | nullable | Creation time |
| `updated_at` | TIMESTAMPTZ | nullable | Last update |

### `api_keys` table (custom — delegate keys)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Key identifier |
| `user_id` | TEXT | NOT NULL, FK → users.id ON DELETE CASCADE | Owning user |
| `label` | TEXT | NOT NULL | Human-readable name (e.g. "Claude agent") |
| `key_hash` | TEXT | NOT NULL, UNIQUE | sha256 hash of the raw key |
| `key_prefix` | TEXT | NOT NULL | First 8 chars of raw key (e.g. "wem_abc1") for display |
| `last_used_at` | TIMESTAMPTZ | nullable | When last validated |
| `revoked_at` | TIMESTAMPTZ | nullable | Null = active; set = revoked |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |

Indexes: `idx_api_keys_user_id` on `(user_id)`, `idx_api_keys_key_hash` on `(key_hash)`.

### `user_roles` table (custom — role assignments)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Row ID |
| `user_id` | TEXT | NOT NULL, UNIQUE, FK → users.id ON DELETE CASCADE | One role per user |
| `role` | TEXT | NOT NULL, CHECK IN ('admin','member') | Role name |
| `granted_by` | TEXT | nullable, FK → users.id | Admin who granted the role |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | When role was granted |

> Users with no row in `user_roles` are treated as logged-in read-only visitors.
> Admins can assign roles from a future admin panel. For MVP, insert rows directly in Supabase dashboard.

### `created_by` column (added to existing tables)

Add `created_by TEXT REFERENCES users(id)` (nullable — existing rows have no owner) to:
- `opportunities`
- `ideas`
- `milestones`
- `proposals`

The auth middleware uses this column to enforce member-level ownership checks on PATCH/DELETE.

### `user_profiles` table (custom — extended user data)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Profile ID |
| `user_id` | TEXT | NOT NULL, UNIQUE, FK → users.id ON DELETE CASCADE | One profile per user |
| `solana_wallet` | TEXT | nullable | Solana wallet address (base58) |
| `evm_wallet` | TEXT | nullable | EVM wallet address (0x…) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update (auto-trigger) |

---

## Better Auth Configuration

### Package installation

```
pnpm add better-auth
pnpm add @better-auth/cloudflare  # Cloudflare adapter
```

### Auth instance (`src/lib/auth.ts`)

Configure Better Auth with:
- `database`: Postgres adapter using `DATABASE_URL`
- `secret`: `BETTER_AUTH_SECRET` env var
- `baseURL`: `BETTER_AUTH_URL` env var (e.g. `https://weminal.pages.dev`)
- `socialProviders.github`: client ID + secret from env vars
- `session`: `expiresIn` 30 days, `updateAge` 1 day (rolling)

### Next.js route handler (`src/app/api/auth/[...all]/route.ts`)

```ts
export const runtime = 'edge'
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

### New environment variables required

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Random 32+ char signing secret. Generate with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL` | Full base URL of the app (e.g. `https://weminal.pages.dev`) |
| `DATABASE_URL` | Supabase Postgres connection string — use Transaction pooler URL (port 6543) from Supabase dashboard > Settings > Database > Connection string |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App settings |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App settings |

---

## Hono Auth Middleware

Add a new middleware at `src/api/middleware/auth.ts` that:

1. Checks for `Authorization: Bearer <key>` header first (API key path).
2. If present: hash the key, query `api_keys` table. If found and not revoked, attach user ID to context. If not found/revoked, return 403.
3. If no API key header: check for Better Auth session cookie using `auth.api.getSession()`.
4. If valid session: attach user ID to context.
5. If neither: return 401 with `{"error": "Authentication required"}`.

Usage on protected routes: wrap individual route groups rather than applying globally so public GET endpoints remain unaffected.

```ts
// Example: protect write routes only
opportunities.post('/', authMiddleware, createOpportunityHandler)
opportunities.patch('/:id', authMiddleware, updateOpportunityHandler)
opportunities.delete('/:id', authMiddleware, deleteOpportunityHandler)
```

---

## MCP Auth Upgrade

The current MCP route at `src/app/api/mcp/route.ts` uses a single static `MCP_API_KEY` env var for all write operations. This must be upgraded to validate against per-user API keys from the `api_keys` table.

Changes required:
1. Replace the static `API_KEY` comparison with a database lookup (hash the provided key, query `api_keys` where `key_hash = hash AND revoked_at IS NULL`).
2. On success, attach the resolved `user_id` to the tool call context (for future audit logging).
3. The `MCP_API_KEY` env var can be removed once all users have migrated — keep it as a fallback during transition if needed, clearly documented as deprecated.
4. The GET info endpoint at `/api/mcp` updates its `auth` description to reflect per-user keys.

---

## UI Requirements

### `/login` page

- Single centered card: "Sign in to Weminal"
- "Continue with GitHub" button (GitHub logo + text)
- Brief tagline: "Track crypto opportunities. Use your account to create, update, and manage your pipeline."
- No email/password form — OAuth only for MVP
- Error state: show error message if `?error=oauth_failed` in query string

### `/profile` page (requires auth — redirect to `/login` if not authenticated)

Four sections:

**1. Account**
- Avatar (from GitHub), display name, email (read-only, sourced from OAuth)
- "Sign out" button

**2. Wallet Linking**
- Two input fields: "Solana Address" and "EVM Address"
- Each has a Save button and a Clear button
- Shows current linked address if set
- Format validation on blur (client-side), server-side on save

**3. API Keys**
- Table: Label | Prefix | Created | Last Used | Actions (Revoke)
- "Generate new key" button → dialog: "Label" input → "Generate" button
- On generation: show raw key in a code block with copy button and warning "This key won't be shown again"
- Revoke: confirmation dialog "Revoke this key? Any agents using it will lose access immediately."
- Max 10 keys notice when at limit

**4. Builder Activity** (read-only, sourced from GET /api/v1/me/activity)
- **Opportunities created** — count badge + compact list (title, type badge, status, created date). Links to /hack with filter pre-applied.
- **Ideas submitted** — count badge + compact list (title, votes, created date). Links to /ideas.
- **Hackathons entered** — count badge + compact list of opportunities where `type = 'hackathon'` and `created_by = user_id` (title, deadline, prize). Links to individual opportunity.
- Empty state for each subsection: "No opportunities yet — [Add one →]", etc.
- Section is collapsed by default on mobile, expanded on desktop.

### GET /api/v1/me/activity

New protected route (requires auth middleware). Returns:

```ts
{
  opportunities: { total: number, items: Array<{ id, title, type, status, created_at }> },
  ideas: { total: number, items: Array<{ id, title, slug, votes, created_at }> },
  hackathons: { total: number, items: Array<{ id, title, deadline, prize_pool, created_at }> }
}
```

- `opportunities`: all records where `created_by = user_id`, ordered by `created_at DESC`, limit 10
- `ideas`: all records where `created_by = user_id`, ordered by `created_at DESC`, limit 10
- `hackathons`: subset of opportunities where `type = 'hackathon'` and `created_by = user_id`, ordered by `deadline ASC` (upcoming first), limit 5

### Login CTA (call to action for anonymous users)

Anywhere a write action exists but the user is not authenticated, replace the action with a login prompt:

- **Create opportunity button** → shows "Sign in to add opportunities" with a GitHub login button
- **Edit / delete controls on table rows** → hidden entirely for anonymous users
- **Idea vote button** → replaced with "Sign in to vote" text link
- **Idea create** → "Sign in to submit an idea"
- On click of any such CTA: redirect to `/login?next=[current-page]` so the user lands back where they were after authenticating

**Login prompt component:** A small inline card or tooltip (not a full-page interruption) that says:
> "You need a Weminal account to do this. [Sign in with GitHub →]"

This component is reused everywhere a CTA appears. Logged-in users with no `member`/`admin` role see: "Ask a Weminal admin to grant you access."

### Nav menu update

- Add "Profile" link (user avatar when logged in, "Sign in" link when not)
- Profile link visible only when session is present
- "Sign in" button in nav always visible to anonymous users — prominent, not hidden

---

## Implementation Phases

### Phase A — Foundation (auth tables + Better Auth setup)

Install Better Auth, configure Cloudflare adapter, create SQL migration for all 5 auth tables, add Next.js route handler, set env vars, test OAuth flow end-to-end.

Tasks: T135–T139

### Phase B — API protection (Hono middleware + MCP upgrade)

Write auth middleware for Hono, apply to write routes, upgrade MCP endpoint from static key to per-user key lookup.

Tasks: T140–T143

### Phase C — Delegate key system (API key CRUD)

Build API endpoints for key generation, listing, and revocation. Implement key validation logic in middleware.

Tasks: T144–T147

### Phase D — UI (login, profile, nav)

Build `/login` page, `/profile` page with four sections (Account, Wallet, API Keys, Builder Activity), update nav menu. Builder Activity pulls from GET /api/v1/me/activity.

Tasks: T148–T155

---

## Tasks

| Task # | Status | What needs to be done |
|--------|--------|-----------------------|
| T135 | `[ ]` | Install better-auth and Cloudflare adapter; configure auth instance at `src/lib/auth.ts` |
| T136 | `[ ]` | SQL migration: create users, sessions, accounts, verifications, api_keys, user_profiles tables |
| T137 | `[ ]` | Add Better Auth Next.js route handler at `src/app/api/auth/[...all]/route.ts` |
| T138 | `[ ]` | Add all required env vars (BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) to .env.example and ENVIRONMENT.md |
| T139 | `[ ]` | Test GitHub OAuth flow end-to-end (login → session cookie → /hack redirect) |
| T140 | `[ ]` | Build Hono auth middleware at `src/api/middleware/auth.ts` (API key + session cookie validation) |
| T141 | `[ ]` | Apply auth middleware to opportunity write routes (POST, PATCH, DELETE) |
| T142 | `[ ]` | Apply auth middleware to ideas write routes (vote, create) and milestone/proposal write routes |
| T143 | `[ ]` | Upgrade MCP HTTP route to validate per-user API keys via database lookup (replace static MCP_API_KEY) |
| T144 | `[ ]` | Build API key generation logic: random key generation, `wem_` prefix, sha256 hashing, insert to api_keys table |
| T145 | `[ ]` | Add Hono routes for API key management: POST /api/v1/me/keys, GET /api/v1/me/keys, DELETE /api/v1/me/keys/:id |
| T146 | `[ ]` | Add user profile routes: GET /api/v1/me/profile, PATCH /api/v1/me/profile (wallet address update) |
| T147 | `[ ]` | Wire key validation into auth middleware (hash lookup against api_keys table with constant-time comparison) |
| T148 | `[ ]` | Build `/login` page: GitHub OAuth button, error state for failed OAuth |
| T149 | `[ ]` | Build `/profile` page: Account section (avatar, name, email, sign out) |
| T150 | `[ ]` | Build `/profile` page: Wallet linking section (Solana + EVM inputs with validation) |
| T151 | `[ ]` | Build `/profile` page: API keys section (table, generate dialog, revoke confirmation) |
| T152 | `[ ]` | Update nav menu: "Sign in" link when unauthenticated, user avatar + "Profile" link when authenticated |
| T153 | `[ ]` | Add route protection to /profile (redirect to /login if no session); add post-login redirect back to intended page |
| T154 | `[ ]` | Add GET /api/v1/me/activity route — created opportunities, submitted ideas, hackathon entries (limit 10/10/5, auth required) |
| T155 | `[ ]` | Build /profile page: Builder Activity section — opportunities, ideas, hackathons with counts, compact lists, empty states |

---

## User Acceptance Tests

> UAT status: `pending`

**UAT Status:** `pending`

**Last tested:** —

**Outcome:** —

---

## Open Questions

- [x] **Cloudflare Pages vs Vercel:** Resolved — Cloudflare Pages is canonical. All context files updated. Better Auth uses Cloudflare adapter + Supabase Transaction pooler.
- [ ] **DATABASE_URL pooler mode:** Confirm the Supabase Transaction pooler is enabled for this project. Get the URL from Supabase dashboard → Settings → Database → "Transaction" tab. Format: `postgresql://postgres.xxx:pass@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true`
- [x] **Existing MCP_API_KEY migration:** Resolved — hard cut-over. The static key is removed. Anyone with an existing Claude config re-generates a personal `wem_` key from `/profile`. No fallback period needed at this stage.
- [ ] **Ideas vote deduplication:** Deferred. Add per-user vote tracking as a follow-up after auth is stable. Current vote counter increment stays for now.
- [x] **Record ownership:** Resolved — role-based model:
  - `admin`: edit/delete any record
  - `member`: create + edit/delete own records only (`created_by` FK enforced server-side)
  - No role / logged-in: read-only
  - `created_by` user_id FK will be added to `opportunities`, `ideas`, `milestones`, `proposals` tables as part of Phase A SQL migration.

---

## Notes

- Better Auth documentation: https://better-auth.com/docs
- Better Auth Cloudflare adapter: https://better-auth.com/docs/deployment/cloudflare
- Better Auth Postgres adapter: `@better-auth/pg` or the built-in `postgres` adapter with `DATABASE_URL`
- The existing MCP route already has constant-time comparison logic (`checkAuth` function) — reuse this pattern in the new API key middleware
- API key format: `wem_` prefix + 32 random hex chars = `wem_` + 32 chars = 36 chars total. Example: `wem_a3f9d2e1b8c4...`
- RLS on auth tables: Better Auth manages its own tables. Set `service_role` access only (same as other tables). Do not enable anon access to `users`, `sessions`, `accounts`, or `api_keys`.

---

## Archive

<!-- Outdated content goes here — never delete, just move down -->
