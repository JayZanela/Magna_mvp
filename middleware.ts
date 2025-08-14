import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS para HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // CSP rigoroso
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}