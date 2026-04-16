'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { X, Menu } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

const ITEMS = [
  { label: 'Opportunities', href: '/hack' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Weekly Review', href: '/review' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit:  { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const item = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

function UserAvatar({ image, name, size = 'sm' }: { image?: string | null; name: string; size?: 'sm' | 'xs' }) {
  const sizeClass = size === 'xs' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-white/20 flex-shrink-0`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#5b21ff] to-[#3c00ff] flex items-center justify-center font-bold text-white flex-shrink-0`}
    >
      {initials}
    </span>
  )
}

export function NavMenu() {
  const [open, setOpen] = useState(false)
  const { data: session, isPending } = useSession()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* Hamburger trigger — shows avatar when authenticated */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-5 right-5 z-40 flex items-center justify-center gap-2 px-3 h-10 rounded-full bg-gray-900/80 text-white backdrop-blur-sm hover:bg-gray-700 transition-colors shadow-lg"
      >
        {!isPending && session?.user && (
          <UserAvatar image={session.user.image} name={session.user.name} size="xs" />
        )}
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md"
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Staggered items */}
            <motion.nav
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col items-center gap-7"
            >
              {ITEMS.map((i) => (
                <motion.div key={i.href} variants={item}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className="block text-4xl sm:text-5xl font-bold text-white hover:text-gray-400 transition-colors tracking-tight leading-none"
                  >
                    {i.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth item — appended after main items */}
              {!isPending && (
                <motion.div variants={item}>
                  {session ? (
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 text-4xl sm:text-5xl font-bold text-white hover:text-gray-400 transition-colors tracking-tight leading-none"
                    >
                      <UserAvatar
                        image={session.user.image}
                        name={session.user.name}
                        size="sm"
                      />
                      Profile
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block text-2xl sm:text-3xl font-medium text-gray-500 hover:text-gray-300 transition-colors tracking-tight leading-none"
                    >
                      Sign in
                    </Link>
                  )}
                </motion.div>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
