import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = {
  '/writer': ['writer', 'admin'],
  '/client': ['client', 'admin'],
  '/admin': ['admin'],
  '/inbox': ['writer', 'client', 'admin'],
}

export async function middleware(request: NextRequest) {
  // 1. Refresh session
  const { response, user } = await updateSession(request)

  // 2. Redirect unauthenticated users
  const pathname = request.nextUrl.pathname
  const isProtected = Object.keys(protectedRoutes).some(r => pathname.startsWith(r))
  
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. RBAC check
  if (user) {
    const userRole = user.app_metadata?.user_role || 'client'
    
    // Redirect away from auth pages if logged in
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL(userRole === 'writer' ? '/writer' : '/client', request.url))
    }

    // Role-based protection
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url)) // Or to an unauthorized page
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
