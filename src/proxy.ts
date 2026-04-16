import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/profile/:path*'],
}

export function proxy(request: NextRequest) {
  // Check for Better Auth session cookie.
  // Better Auth sets either the plain or __Secure- prefixed variant depending on protocol.
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ??
    request.cookies.get('__Secure-better-auth.session_token')

  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
