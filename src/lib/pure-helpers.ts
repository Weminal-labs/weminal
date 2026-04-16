/**
 * Pure helper functions shared across API routes and components.
 * No external dependencies — safe to import in tests without mocking anything.
 */

// ─── Label sanitization ───────────────────────────────────────────────────────

/** Strip HTML tags and trim whitespace from a label string. */
export function sanitizeLabel(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

// ─── API key generation ───────────────────────────────────────────────────────

export async function generateApiKey(): Promise<{ raw: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const raw = `wem_${hex}`
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // "wem_" + first 4 hex chars = 8 chars total
  const prefix = raw.slice(0, 8)
  return { raw, hash, prefix }
}

// ─── Avatar URL sizing ───────────────────────────────────────────────────────

/**
 * Add a size hint to avatar URLs from providers that honour it.
 * Prevents fuzzy downscaling — GitHub serves 460px by default.
 * Returns the original URL unchanged if unknown or already sized.
 */
export function sizedAvatarUrl(url: string | null | undefined, pxSize: number): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    // GitHub: ?s=<size>
    if (u.hostname.endsWith('githubusercontent.com') && !u.searchParams.has('s')) {
      u.searchParams.set('s', String(pxSize * 2))  // retina
      return u.toString()
    }
    // Google usercontent: =s<size>-c suffix in pathname
    if (u.hostname.endsWith('googleusercontent.com') && !u.pathname.includes('=s')) {
      return `${url}${url.includes('=') ? '' : '=s'}${pxSize * 2}-c`
    }
    return url
  } catch {
    return url
  }
}

// ─── Login redirect sanitization ─────────────────────────────────────────────

const DEFAULT_REDIRECT = '/hack'

/**
 * Sanitize the ?next= query parameter on the login page.
 * Only allows same-origin relative paths (must start with '/' but NOT '//').
 * Absolute URLs, protocol-relative URLs, and bare paths without a leading slash
 * all fall back to the default redirect.
 */
export function sanitizeNext(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return DEFAULT_REDIRECT
}
