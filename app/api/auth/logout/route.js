import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export function GET() {
  // Clear the auth cookie
  cookies().delete('auth-token');
  
  // Create response with redirection
  const response = Response.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  
  // Return the response
  return response;
}
