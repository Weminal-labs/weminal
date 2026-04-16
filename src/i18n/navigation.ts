import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware wrappers for Link, redirect, usePathname, useRouter.
// Import these instead of the ones from next/link / next/navigation.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
