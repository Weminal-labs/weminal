'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowUpRight, ThumbsUp, TrendingUp, Users, Wrench } from 'lucide-react'
import type { Idea } from '@/lib/types'

type AccordionPanel = 'market' | 'community' | 'build' | null

type Props = {
  idea: Idea
  selectedChain: string
  onChainChange: (chain: string) => void
  onVote: () => void
  isVoting: boolean
}

const TRACK_COLORS: Record<string, string> = {
  defi: 'bg-blue-500/15 text-blue-400',
  'dev-tools': 'bg-violet-500/15 text-violet-400',
  infrastructure: 'bg-orange-500/15 text-orange-400',
  ai: 'bg-emerald-500/15 text-emerald-400',
  gaming: 'bg-pink-500/15 text-pink-400',
  refi: 'bg-teal-500/15 text-teal-400',
  consumer: 'bg-slate-500/15 text-slate-400',
}

const TRACK_LABELS: Record<string, string> = {
  defi: 'DeFi',
  'dev-tools': 'Dev Tools',
  infrastructure: 'Infrastructure',
  ai: 'AI',
  gaming: 'Gaming',
  refi: 'ReFi',
  consumer: 'Consumer',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/15 text-green-400',
  intermediate: 'bg-yellow-500/15 text-yellow-400',
  advanced: 'bg-red-500/15 text-red-400',
}

function verdictColor(verdict: string) {
  if (verdict === 'strong' || verdict === 'high') return 'text-emerald-400'
  if (verdict === 'moderate' || verdict === 'medium') return 'text-yellow-400'
  return 'text-red-400'
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  )
}

function AccordionSection({
  icon,
  label,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {isOpen ? <ChevronUp className="size-3.5 shrink-0" /> : <ChevronDown className="size-3.5 shrink-0" />}
      </button>
      {isOpen && (
        <div className="pb-2 pl-5 space-y-1.5">
          {children}
        </div>
      )}
    </div>
  )
}

export function IdeaCard({ idea, selectedChain, onChainChange, onVote, isVoting }: Props) {
  const [openPanel, setOpenPanel] = useState<AccordionPanel>(null)

  const togglePanel = (panel: AccordionPanel) => {
    setOpenPanel(openPanel === panel ? null : panel)
  }

  const chainOverride = idea.chain_overrides?.[selectedChain]
  const buildGuide = idea.build_guide

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-zinc-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 ${
        idea.is_featured
          ? 'border-violet-500/30 shadow-md shadow-violet-900/20'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Badge className={TRACK_COLORS[idea.track] ?? 'bg-zinc-700 text-zinc-300'}>
          {TRACK_LABELS[idea.track] ?? idea.track}
        </Badge>
        <Badge className={DIFFICULTY_COLORS[idea.difficulty] ?? 'bg-zinc-700 text-zinc-300'}>
          {idea.difficulty}
        </Badge>
        {idea.is_featured && (
          <Badge className="bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
            ★ Featured
          </Badge>
        )}
      </div>

      {/* Title + tagline */}
      <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{idea.title}</h3>
      <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">{idea.tagline}</p>

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {idea.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {tag}
            </span>
          ))}
          {idea.tags.length > 5 && (
            <span className="text-[10px] text-zinc-600">+{idea.tags.length - 5}</span>
          )}
        </div>
      )}

      {/* Source */}
      {idea.source_author && (
        <p className="text-[10px] text-zinc-600 mb-3">
          via {idea.source_author}
          {idea.source_url && (
            <a
              href={idea.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-zinc-500 hover:text-zinc-400 inline-flex items-center"
            >
              <ArrowUpRight className="size-2.5" />
            </a>
          )}
        </p>
      )}

      {/* Accordion panels */}
      <div className="flex-1 border-t border-zinc-800 pt-2 space-y-0.5">
        <AccordionSection
          icon={<TrendingUp className="size-3.5" />}
          label="Is this idea good?"
          isOpen={openPanel === 'market'}
          onToggle={() => togglePanel('market')}
        >
          {idea.market_signal?.verdict && (
            <p className="text-xs font-medium text-zinc-300">
              Verdict:{' '}
              <span className={verdictColor(idea.market_signal.verdict)}>
                {idea.market_signal.verdict}
              </span>
            </p>
          )}
          {idea.market_signal?.reasoning && (
            <p className="text-xs text-zinc-400 leading-relaxed">{idea.market_signal.reasoning}</p>
          )}
          {idea.market_signal?.signals?.map((s, i) => (
            <p key={i} className="text-[11px] text-zinc-500 pl-2 border-l border-zinc-700">
              <span className="text-zinc-400 font-medium">{s.type}:</span> {s.text}
            </p>
          ))}
        </AccordionSection>

        <AccordionSection
          icon={<Users className="size-3.5" />}
          label="Do people want this?"
          isOpen={openPanel === 'community'}
          onToggle={() => togglePanel('community')}
        >
          {idea.community_signal?.verdict && (
            <p className="text-xs font-medium text-zinc-300">
              Demand:{' '}
              <span className={verdictColor(idea.community_signal.verdict)}>
                {idea.community_signal.verdict}
              </span>
            </p>
          )}
          {idea.community_signal?.reasoning && (
            <p className="text-xs text-zinc-400 leading-relaxed">{idea.community_signal.reasoning}</p>
          )}
          {idea.community_signal?.signals?.map((s, i) => (
            <p key={i} className="text-[11px] text-zinc-500 pl-2 border-l border-zinc-700">
              <span className="text-zinc-400 font-medium">{s.type}:</span> {s.text}
            </p>
          ))}
        </AccordionSection>

        <AccordionSection
          icon={<Wrench className="size-3.5" />}
          label="How would I build this?"
          isOpen={openPanel === 'build'}
          onToggle={() => togglePanel('build')}
        >
          {/* Chain selector */}
          {idea.supported_chains.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {idea.supported_chains.map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChainChange(chain) }}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    selectedChain === chain
                      ? 'bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          )}

          {buildGuide?.overview && (
            <p className="text-xs text-zinc-400 leading-relaxed">{buildGuide.overview}</p>
          )}
          {chainOverride?.note && (
            <p className="text-[11px] text-violet-400/80 italic">{chainOverride.note}</p>
          )}
          {buildGuide?.steps && buildGuide.steps.length > 0 && (
            <ol className="space-y-1.5">
              {buildGuide.steps.map((step) => (
                <li key={step.order} className="text-[11px]">
                  <span className="text-zinc-300 font-medium">{step.order}. {step.title}</span>
                  <p className="text-zinc-500 pl-3 leading-relaxed">{step.description}</p>
                </li>
              ))}
            </ol>
          )}
          {(chainOverride?.stack_override || buildGuide?.stack_suggestion) && (
            <p className="text-[10px] text-zinc-500">
              Stack:{' '}
              <span className="text-zinc-400 font-mono">
                {chainOverride?.stack_override ?? buildGuide?.stack_suggestion}
              </span>
            </p>
          )}
          {buildGuide?.time_estimate && (
            <p className="text-[10px] text-zinc-500">Time: {buildGuide.time_estimate}</p>
          )}
          {buildGuide?.hackathon_fit && (
            <p className="text-[10px] text-zinc-500 italic">{buildGuide.hackathon_fit}</p>
          )}
        </AccordionSection>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onVote() }}
          disabled={isVoting}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 transition-colors disabled:opacity-40"
          aria-label="Upvote idea"
        >
          <ThumbsUp className="size-3.5" />
          <span className="tabular-nums">{idea.votes}</span>
        </button>

        <a
          href={`mailto:team@weminal.com?subject=I want to build: ${encodeURIComponent(idea.title)}`}
          className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors"
        >
          I want to build this <ArrowUpRight className="size-3" />
        </a>
      </div>
    </div>
  )
}
