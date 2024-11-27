// Create user middleware to protect dashboard route
// middleware.ts
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const session = req.cookies.get('user_session')

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
} 
  