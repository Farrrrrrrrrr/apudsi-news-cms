import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/articles',
  '/articles/(.*)',
  '/api/public/(.*)',
];

// Paths that should redirect to dashboard if already logged in
const authPaths = [
  '/login',
  '/register',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Check if user is authenticated
  let isAuthenticated = false;
  
  if (token) {
    try {
      const secretKey = new TextEncoder().encode(
        process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key-at-least-32-chars'
      );
      
      await jwtVerify(token, secretKey);
      isAuthenticated = true;
    } catch (error) {
      // Invalid token
      isAuthenticated = false;
    }
  }
  
  // If path is a login/register page and user is already logged in, redirect to dashboard
  if (authPaths.some(path => pathname.startsWith(path)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // If path requires auth and user is not authenticated, redirect to login
  if (
    !publicPaths.some(path => {
      if (path.endsWith('(.*)')) {
        const basePath = path.replace('(.*)', '');
        return pathname.startsWith(basePath);
      }
      return pathname === path;
    }) &&
    !isAuthenticated &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('/api/auth') && 
    !pathname.includes('favicon.ico')
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
};
