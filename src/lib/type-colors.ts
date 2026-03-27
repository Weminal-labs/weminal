import type { OpportunityType } from './types'

export const typeColors: Record<OpportunityType, { bg: string; text: string; dot: string }> = {
  hackathon: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500' },
  grant: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
  fellowship: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', dot: 'bg-purple-500' },
  bounty: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-500' },
  bootcamp: { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
}

export const statusColors: Record<string, string> = {
  discovered: 'bg-gray-100 text-gray-700',
  evaluating: 'bg-yellow-100 text-yellow-800',
  applying: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  submitted: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-500',
}
