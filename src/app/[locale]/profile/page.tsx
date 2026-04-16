import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/profile-client'

// Edge runtime required by @cloudflare/next-on-pages (auth.api.getSession
// pulls in the edge-compatible Better Auth chain on @neondatabase/serverless).
export const runtime = 'edge'

export const metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login?next=/profile')
  return <ProfileClient user={session.user} />
}
