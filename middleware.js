import { NextResponse } from 'next/server';

export function middleware(request) {
  // Define paths that require authentication
  const protectedPaths = ['/dashboard'];
  const authPaths = ['/login', '/signup'];
  
  const { pathname } = request.nextUrl;
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // If accessing a protected path without a token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // For all other cases, let the client-side handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};