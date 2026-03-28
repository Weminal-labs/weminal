import type { OpportunityType } from './types'

export const typeColors: Record<OpportunityType, { bg: string; text: string; dot: string }> = {
  hackathon: { bg: 'bg-gray-900', text: 'text-white', dot: 'bg-gray-900' },
  grant: { bg: 'bg-gray-700', text: 'text-white', dot: 'bg-gray-700' },
  fellowship: { bg: 'bg-gray-500', text: 'text-white', dot: 'bg-gray-500' },
  bounty: { bg: 'bg-gray-400', text: 'text-white', dot: 'bg-gray-400' },
  bootcamp: { bg: 'bg-gray-300', text: 'text-gray-800', dot: 'bg-gray-300' },
}

export const statusColors: Record<string, string> = {
  discovered: 'bg-gray-100 text-gray-500',
  evaluating: 'bg-gray-200 text-gray-600',
  applying: 'bg-gray-300 text-gray-700',
  accepted: 'bg-gray-800 text-white',
  in_progress: 'bg-gray-700 text-white',
  submitted: 'bg-gray-600 text-white',
  completed: 'bg-gray-900 text-white',
  rejected: 'bg-gray-200 text-gray-400',
  cancelled: 'bg-gray-100 text-gray-400',
}
