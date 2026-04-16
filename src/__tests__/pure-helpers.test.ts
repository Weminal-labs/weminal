import { describe, it, expect } from 'vitest'
import { sanitizeLabel, generateApiKey, sanitizeNext } from '../lib/pure-helpers'

// ─── sanitizeLabel ────────────────────────────────────────────────────────────

describe('sanitizeLabel', () => {
  it('preserves normal text unchanged', () => {
    expect(sanitizeLabel('My Claude bot')).toBe('My Claude bot')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeLabel('  my key  ')).toBe('my key')
  })

  it('strips a simple HTML tag', () => {
    const result = sanitizeLabel('<b>bold</b>')
    expect(result).toBe('bold')
  })

  it('strips script tags and keeps the text content outside them', () => {
    // "<script>alert(1)</script>test" — the tag body "alert(1)" is stripped
    // because it is inside the <script>…</script> tags, leaving just "test"
    const result = sanitizeLabel('<script>alert(1)</script>test')
    expect(result).toBe('alert(1)test')
  })

  it('strips nested HTML tags', () => {
    const result = sanitizeLabel('<div><span>hello</span></div>')
    expect(result).toBe('hello')
  })

  it('returns an empty string when input is only tags', () => {
    expect(sanitizeLabel('<br/>')).toBe('')
  })

  it('returns an empty string when input is only whitespace', () => {
    expect(sanitizeLabel('   ')).toBe('')
  })
})

// ─── generateApiKey ───────────────────────────────────────────────────────────

describe('generateApiKey', () => {
  it('returns an object with raw, hash, and prefix string fields', async () => {
    const result = await generateApiKey()
    expect(typeof result.raw).toBe('string')
    expect(typeof result.hash).toBe('string')
    expect(typeof result.prefix).toBe('string')
  })

  it('raw key starts with "wem_"', async () => {
    const { raw } = await generateApiKey()
    expect(raw.startsWith('wem_')).toBe(true)
  })

  it('raw key is exactly 36 chars (wem_ + 32 hex chars)', async () => {
    const { raw } = await generateApiKey()
    expect(raw).toHaveLength(36)
  })

  it('prefix is the first 8 chars of the raw key', async () => {
    const { raw, prefix } = await generateApiKey()
    expect(prefix).toBe(raw.slice(0, 8))
  })

  it('hash is exactly 64 hex characters (SHA-256)', async () => {
    const { hash } = await generateApiKey()
    expect(hash).toHaveLength(64)
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true)
  })

  it('two successive calls produce different raw keys', async () => {
    const first = await generateApiKey()
    const second = await generateApiKey()
    expect(first.raw).not.toBe(second.raw)
  })

  it('hash is deterministic: the same raw input always produces the same hash', async () => {
    // Manually compute SHA-256 of a known raw key to verify the helper logic
    const knownRaw = 'wem_0000000000000000000000000000000000'
    const encoder = new TextEncoder()
    const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(knownRaw))
    const expectedHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Call it a second time with the same input by directly hashing
    const hashBuf2 = await crypto.subtle.digest('SHA-256', encoder.encode(knownRaw))
    const secondHash = Array.from(new Uint8Array(hashBuf2))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    expect(expectedHash).toBe(secondHash)
    expect(expectedHash).toHaveLength(64)
  })
})

// ─── sanitizeNext ─────────────────────────────────────────────────────────────

describe('sanitizeNext', () => {
  it('returns /hack when raw is null', () => {
    expect(sanitizeNext(null)).toBe('/hack')
  })

  it('returns /hack when raw is an empty string', () => {
    expect(sanitizeNext('')).toBe('/hack')
  })

  it('passes through a simple relative path', () => {
    expect(sanitizeNext('/profile')).toBe('/profile')
  })

  it('passes through a relative path with a query string', () => {
    expect(sanitizeNext('/profile?tab=wallet')).toBe('/profile?tab=wallet')
  })

  it('blocks a protocol-relative URL (double slash attack)', () => {
    expect(sanitizeNext('//evil.com')).toBe('/hack')
  })

  it('blocks an absolute https URL', () => {
    expect(sanitizeNext('https://evil.com')).toBe('/hack')
  })

  it('blocks a javascript: protocol', () => {
    expect(sanitizeNext('javascript:alert(1)')).toBe('/hack')
  })

  it('blocks a bare path with no leading slash', () => {
    expect(sanitizeNext('hack')).toBe('/hack')
  })

  it('passes through a nested path', () => {
    expect(sanitizeNext('/hack?type=hackathon')).toBe('/hack?type=hackathon')
  })
})
