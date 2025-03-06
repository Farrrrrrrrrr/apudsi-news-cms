import crypto from 'crypto';
import { cookies } from 'next/headers';

// Generate CSRF token
export async function GET(request) {
  // Verify the request is from our app using the Referer header
  const referer = request.headers.get('referer') || '';
  const host = request.headers.get('host') || '';
  
  // Only allow requests from our own site or local development
  if (!referer.includes(host) && !referer.includes('localhost')) {
    return Response.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Generate a random token
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // Store token in a cookie
  cookies().set('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });
  
  return Response.json({ csrfToken });
}
