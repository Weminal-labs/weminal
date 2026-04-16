'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, Trash2, Plus, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { signOut } from '@/lib/auth-client'

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface ApiKey {
  id: string
  label: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ user, size = 'lg' }: { user: User; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-xs'
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover border border-white/20`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#5b21ff] to-[#3c00ff] flex items-center justify-center font-bold text-white border border-white/10`}
    >
      {initials}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

// ─── GenerateKeyDialog ────────────────────────────────────────────────────────

function GenerateKeyDialog({ onCreated }: { onCreated: (key: ApiKey) => void }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleClose() {
    setOpen(false)
    // Reset after close animation
    setTimeout(() => {
      setLabel('')
      setRawKey(null)
      setCopied(false)
    }, 300)
  }

  async function handleGenerate() {
    if (!label.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/v1/me/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() }),
      })
      if (!res.ok) throw new Error('Failed to generate key')
      const json = await res.json()
      const { key, ...apiKey } = json.data
      setRawKey(key)
      onCreated(apiKey as ApiKey)
    } catch {
      toast.error('Failed to generate API key')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!rawKey) return
    try {
      await navigator.clipboard.writeText(rawKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — please copy manually')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-[#5b21ff] text-white text-sm font-medium hover:bg-[#6d35ff] transition-colors">
          <Plus className="size-4" aria-hidden="true" />
          Generate new key
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-white">
              {rawKey ? 'Key generated' : 'Generate API key'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {!rawKey ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="key-label" className="text-sm font-medium text-gray-300">
                  Label
                </label>
                <input
                  id="key-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. MCP client, CI bot"
                  className="h-9 rounded-lg border border-white/10 bg-gray-800/60 px-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5b21ff]/60"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !label.trim()}
                className="h-9 rounded-lg bg-[#5b21ff] text-white text-sm font-medium hover:bg-[#6d35ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
                <p className="text-sm text-amber-400 font-medium">
                  This key will not be shown again. Copy it now.
                </p>
              </div>
              <div className="relative">
                <code className="block w-full rounded-lg border border-white/10 bg-gray-800/80 px-3 py-3 text-sm text-green-400 font-mono break-all pr-10">
                  {rawKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Copy key"
                >
                  {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                </button>
              </div>
              <button
                onClick={handleClose}
                className="h-9 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── RevokeKeyDialog ──────────────────────────────────────────────────────────

function RevokeKeyButton({ keyId, onRevoked }: { keyId: string; onRevoked: () => void }) {
  const [revoking, setRevoking] = useState(false)

  async function handleRevoke() {
    setRevoking(true)
    try {
      const res = await fetch(`/api/v1/me/keys/${keyId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to revoke')
      onRevoked()
      toast.success('API key revoked')
    } catch {
      toast.error('Failed to revoke key')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          aria-label="Revoke key"
        >
          <Trash2 className="size-4" />
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
          <AlertDialog.Title className="text-base font-semibold text-white mb-2">
            Revoke API key?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-400 mb-5">
            This key will stop working immediately. Any services using it will lose access.
          </AlertDialog.Description>
          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button className="px-4 h-9 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {revoking ? 'Revoking…' : 'Revoke'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// ─── Builder Activity types ───────────────────────────────────────────────────

interface ActivityOpportunity {
  id: string
  title: string
  type: string
  status: string
  created_at: string
}

interface ActivityIdea {
  id: string
  title: string
  slug: string
  votes: number
  created_at: string
}

interface ActivityHackathon {
  id: string
  title: string
  deadline: string | null
  prize_pool: number | null
  prize_currency: string | null
  created_at: string
}

interface ActivityData {
  opportunities: { total: number; items: ActivityOpportunity[] }
  ideas: { total: number; items: ActivityIdea[] }
  hackathons: { total: number; items: ActivityHackathon[] }
}

// ─── Builder Activity section ─────────────────────────────────────────────────

function ActivitySubsection({
  title,
  count,
  children,
  emptyMessage,
  ctaHref,
  ctaLabel,
  isEmpty,
}: {
  title: string
  count: number
  children: React.ReactNode
  emptyMessage: string
  ctaHref: string
  ctaLabel: string
  isEmpty: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-between w-full text-left group md:cursor-default"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">{title}</span>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-[#5b21ff]/30 text-[#a78bfa]">
            {count}
          </span>
        </div>
        <span className="text-gray-600 group-hover:text-gray-400 transition-colors md:hidden">
          {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </span>
      </button>

      <div className={`${collapsed ? 'hidden md:block' : ''}`}>
        {isEmpty ? (
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3">
            <p className="text-sm text-gray-600">{emptyMessage}</p>
            <a
              href={ctaHref}
              className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
            >
              {ctaLabel}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function BuilderActivity() {
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/me/activity')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setActivity(json.data ?? json))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  const opps = activity?.opportunities ?? { total: 0, items: [] }
  const ideas = activity?.ideas ?? { total: 0, items: [] }
  const hacks = activity?.hackathons ?? { total: 0, items: [] }

  return (
    <div className="flex flex-col gap-5">
      {/* Opportunities */}
      <ActivitySubsection
        title="Opportunities Created"
        count={opps.total}
        isEmpty={opps.items.length === 0}
        emptyMessage="No opportunities yet."
        ctaHref="/hack"
        ctaLabel="Add one"
      >
        <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/5 overflow-hidden">
          {opps.items.map((opp) => (
            <a
              key={opp.id}
              href={`/hack?search=${encodeURIComponent(opp.title)}`}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-white truncate">{opp.title}</span>
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                  {opp.type}
                </span>
              </div>
              <span className="shrink-0 text-[11px] text-gray-500 ml-2">{opp.status}</span>
            </a>
          ))}
        </div>
      </ActivitySubsection>

      {/* Ideas */}
      <ActivitySubsection
        title="Ideas Submitted"
        count={ideas.total}
        isEmpty={ideas.items.length === 0}
        emptyMessage="No ideas submitted yet."
        ctaHref="/ideas"
        ctaLabel="Submit one"
      >
        <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/5 overflow-hidden">
          {ideas.items.map((idea) => (
            <a
              key={idea.id}
              href={`/ideas`}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm text-white truncate">{idea.title}</span>
              <span className="shrink-0 text-[11px] text-[#a78bfa] ml-2">
                {idea.votes} {idea.votes === 1 ? 'vote' : 'votes'}
              </span>
            </a>
          ))}
        </div>
      </ActivitySubsection>

      {/* Hackathons */}
      <ActivitySubsection
        title="Hackathons Entered"
        count={hacks.total}
        isEmpty={hacks.items.length === 0}
        emptyMessage="No hackathons entered yet."
        ctaHref="/hack?type=hackathon"
        ctaLabel="Find one"
      >
        <div className="flex flex-col divide-y divide-white/5 rounded-lg border border-white/5 overflow-hidden">
          {hacks.items.map((hack) => (
            <a
              key={hack.id}
              href={`/hack?search=${encodeURIComponent(hack.title)}`}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm text-white truncate">{hack.title}</span>
              <div className="shrink-0 flex flex-col items-end gap-0.5 ml-2">
                {hack.deadline && (
                  <span className="text-[11px] text-gray-500">
                    {new Date(hack.deadline).toLocaleDateString()}
                  </span>
                )}
                {hack.prize_pool != null && (
                  <span className="text-[11px] text-green-400">
                    {hack.prize_pool.toLocaleString()} {hack.prize_currency ?? ''}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </ActivitySubsection>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileClient({ user }: { user: User }) {
  const router = useRouter()

  // API keys state
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [keysLoading, setKeysLoading] = useState(true)

  // Sign out
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch {
      toast.error('Failed to sign out')
      setSigningOut(false)
    }
  }

  // Load API keys
  useEffect(() => {
    fetch('/api/v1/me/keys')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((json) => setKeys(Array.isArray(json.data) ? json.data : []))
      .catch(() => {})
      .finally(() => setKeysLoading(false))
  }, [])

  function handleKeyCreated(newKey: ApiKey) {
    setKeys((prev) => [newKey, ...prev])
  }

  function handleKeyRevoked(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const MAX_KEYS = 10

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, wallets, and API keys.</p>
        </div>

        {/* ── Section 1: Account ── */}
        <Section title="Account">
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div className="flex flex-col gap-0.5">
              <p className="text-base font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-4 h-9 rounded-lg border border-white/10 text-gray-300 text-sm hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </Section>

        {/* ── Section 2: API Keys ── */}
        <Section title="API Keys">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {keys.length}/{MAX_KEYS} keys
            </p>
            {keys.length < MAX_KEYS && (
              <GenerateKeyDialog onCreated={handleKeyCreated} />
            )}
            {keys.length >= MAX_KEYS && (
              <p className="text-xs text-amber-400">Maximum of {MAX_KEYS} keys reached</p>
            )}
          </div>

          {keysLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">
              No API keys yet. Generate one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 font-medium px-1">Label</th>
                    <th className="pb-2 font-medium px-1">Prefix</th>
                    <th className="pb-2 font-medium px-1 hidden sm:table-cell">Created</th>
                    <th className="pb-2 font-medium px-1 hidden md:table-cell">Last used</th>
                    <th className="pb-2 px-1" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {keys.map((k) => (
                    <tr key={k.id} className="group">
                      <td className="py-2.5 px-1 text-white font-medium">{k.label}</td>
                      <td className="py-2.5 px-1">
                        <code className="text-xs text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {k.key_prefix}…
                        </code>
                      </td>
                      <td className="py-2.5 px-1 text-gray-500 hidden sm:table-cell">
                        {new Date(k.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-1 text-gray-500 hidden md:table-cell">
                        {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-2.5 px-1 text-right">
                        <RevokeKeyButton
                          keyId={k.id}
                          onRevoked={() => handleKeyRevoked(k.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ── Section 3: Builder Activity ── */}
        <Section title="Builder Activity">
          <BuilderActivity />
        </Section>
      </div>
    </main>
  )
}
