import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // Function that will be executed on protected routes
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect superuser routes from non-superusers
    if (pathname.startsWith('/admin/users') && token?.role !== 'superuser') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // Allow access to other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run the middleware on admin routes
      authorized: ({ token }) => !!token
    },
  }
);

// Apply middleware only to admin routes
export const config = { matcher: ["/admin/:path*"] };
